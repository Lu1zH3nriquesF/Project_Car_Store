from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from database import get_db_connection
import bcrypt # type: ignore
import os
import pymysql # type: ignore
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Lista de origens permitidas (seu React)
    allow_credentials=True, # Permite cookies, headers de autorização, etc.
    allow_methods=["*"],    # Permite todos os métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Permite todos os headers
)

class UserIn(BaseModel):
    name: str
    email:str
    password: str
    account_type: str
    phone_number: Optional[str] = None
    company_name: Optional[str] = None 
    cnpj: Optional[str] = None
    
class VehicleIn(BaseModel):
    mark: str
    model: str
    year: str
    mileage: int
    price: float
    fuel_type: str
    color: str
    status: str
    description: Optional[str] = None
    seller_id: int
    #O Id do vendendor será obtido da sessão/token de autenticação
    
class SearchLLM(BaseModel):
    preferences: str
    
@app.post("/register/")
def register_user(user: UserIn):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    query_user = """
    insert into users (name, email, Password_hash, users.Account_Type, users.Phone_Number, Company_Name, CNPJ)
    values (%s, %s, %s, %s, %s, %s, %s)
    
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query_user, (user.name, user.email, hashed_password, user.account_type, user.phone_number, user.company_name, user.cnpj))
                new_user_id = cursor.lastrowid
                conn.commit()
                
        
        return {'Message': 'User succefully registered.', 'User_ID': new_user_id}
    except pymysql.err.IntegrityError:
        raise HTTPException(status_code=400, detail='Email alredy register.')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"The user couldn't be register: {e}")
    
@app.post("/vehicle/")
async def register_vehicle(vehicle: VehicleIn):
    query_vehicle = """
        insert into vehicles (Seller_ID, Type_Seller, Mark, Model, Year, Mileage, Price, Fuel_type, Color, Status, description)
        values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    seller_type = "Person"
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query_vehicle, (vehicle.seller_id, seller_type, vehicle.mark, vehicle.model, vehicle.year, vehicle.mileage, vehicle.price, vehicle.fuel_type, vehicle.color, vehicle.status, vehicle.description))
                conn.commit()
        
        return {"Message": "Vehicle successfully registered."}
    
    except Exception as e:
        raise  HTTPException(status_code=500, detail=f"Fail to register this vehicle: {e}")
    
@app.get("/vehicle/")
def list_vehicle(mark: Optional[str] = None, min_price: Optional[float] = None):
    base_query = "select * from vehicles where 1=1"
    params = []
    
    if mark:
        base_query += " and mark = %s"
        params.append(mark)
    
    if min_price is not None:
        base_query += " and price >= %s"
        params.append(min_price)
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(base_query, params)
                vehicles = cursor.fetchall()
        
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fail to search this vehicle: {e}")
    
# main.py (Adicionar esta nova rota)
@app.get("/companies/")
async def list_companies():
    query = """
    SELECT id, email, name, phone_number, company_name, cnpj 
    FROM users 
    WHERE account_type = 'Company'
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                companies = cursor.fetchall()
        
        # O DictCursor retorna dicionários, que o FastAPI converte para JSON
        return companies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch companies: {e}")
    
@app.get("/user/{user_id}")
async def get_user_profile(user_id: int):
    query = """
    SELECT id, name, email, account_type, phone_number, company_name, cnpj 
    FROM users 
    WHERE id = %s
    """ 
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (user_id,))
                user_data = cursor.fetchone()
                
                if user_data is None:
                    raise HTTPException(status_code=404, detail="User not found")
        
        return user_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user profile: {e}")


@app.post("/suggest_car/")
async def suggest_car(search: SearchLLM, user_id: Optional[str] = None):
    if not api_key:
       raise HTTPException(status_code=500, detail="Key not configured.")
   
    llm_sugestion = ""
    used_model = "gemini-2.5-flash"
   
    try:
       genai.configure(api_key=api_key)
       
       prompt = f"""
        Você é um assistente de compra de carros.
        Analise o pedido do usuário para sugerir 3 modelos de carros no mercado brasileiro com uma breve justificativa para cada.
        Pedido: '{search.preferences}'
        Responda em português e de forma amigável.
       """
       
       response = genai.GenerativeModel(used_model).generate_content(prompt)
       llm_sugestion = response.text
       
    except Exception as e:
        llm_sugestion = f"Sorry some problem be happend: {e}"
       
    query_log = """
    insert into llm_register (User_id, Prompt_use, LLM_Aswer, LLM_Model)
    values (%s, %s, %s, %s)
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query_log, (user_id, search.preferences, llm_sugestion, used_model))
                conn.commit()
    
    except Exception as e:
        print(f"Waring: Fail to register LLM log: {e}")
        
    finally:
        return {"Suggestion": llm_sugestion}
   
        

  
    