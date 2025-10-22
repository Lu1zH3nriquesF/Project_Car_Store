from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from database import get_db_connection
import bcrypt # type: ignore
import os
import pymysql # type: ignore
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime
from decimal import Decimal
from starlette import status

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
    
class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdateIn(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    company_name: Optional[str] = None

class PasswordResetIn(BaseModel):
    email: str
    new_password: str
    confirm_password: str
    
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
    
class VehicleResponse(BaseModel):
    id: int
    Seller_ID: int
    Mark: str
    Model: str
    Year: int
    Mileage: int
    Price: Decimal
    Fuel_type: str
    Color: str
    Status: str
    Description: Optional[str] = None
    Inventory_Status: str
    
    class Config:
        from_attributes = True 

class CompanyResponse(BaseModel):
    user_id: int
    company_name: str
    cnpj: str
    
    class Config:
        from_attributes = True
    
class SellsIn(BaseModel):
    client_id: int
    car_id: int    
    total_value: float
class SearchLLM(BaseModel):
    preferences: str
    
    
@app.post("/register/")
def register_user(user: UserIn):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    query_user = """
        insert into users (name, email, Password_hash, users.Account_Type, users.Phone_Number)
        values (%s, %s, %s, %s, %s)
    """
    users_data = (
        user.name,
        user.email,
        hashed_password,
        user.account_type,
        user.phone_number
    )
    
    query_company = """
        insert into companies (user_id, company_name, cnpj)
        values (%s, %s, %s)
    """
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query_user, users_data)
                new_user_id = cursor.lastrowid
                    
                if user.account_type == 'Company':
                    if not user.company_name or not user.cnpj:
                         raise HTTPException(status_code=400, detail='Company name and CNPJ are required for Company registration.')
                    
                    company_data = (
                        new_user_id, # Chave Estrangeira
                        user.company_name, 
                        user.cnpj
                    )
    
                    cursor.execute(query_company, company_data)
                    
                conn.commit()
        return {
            'Message': 'User succefully registered.', 
            'User_ID': new_user_id,
            'Account_Type': user.account_type 
        }
    except pymysql.err.IntegrityError:
        raise HTTPException(status_code=400, detail='Email alredy register.')
    except HTTPException as e:
        # Repassa o erro de validação (ex: CNPJ faltando)
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"The user couldn't be register: {e}")  
    
@app.post("/login/")
def login(user_credentials: UserLogin):
    """
    Autentica o usuário pelo email e senha (hashing).
    Retorna User_ID e Account_Type se o login for bem-sucedido.
    """
    
    # 1. Busca o usuário e o HASH da senha
    query = """
    SELECT id, email, Password_hash, Account_Type FROM users WHERE email = %s
    """
    
    user_id = None
    account_type = None
    stored_hash = None 
    
    try:
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(query, (user_credentials.email,))
                user_found = cursor.fetchone()
                
                if user_found:
                    user_id = user_found['id']
                    account_type = user_found['Account_Type']
                    stored_hash = user_found['Password_hash']
                else:
                    raise HTTPException(status_code=401, detail="Invalid credentials.")
        
        # 2. COMPARAÇÃO USANDO BCRYPT (COMPARANDO HASHES)
        # Se você está usando Password_hash, o bcrypt.checkpw é obrigatório.
        if not bcrypt.checkpw(user_credentials.password.encode('utf-8'), stored_hash.encode('utf-8')):
             raise HTTPException(status_code=401, detail="Invalid credentials.")

        # 3. Retorna sucesso
        return {
            "Message": "Login successful.", 
            "User_ID": user_id, 
            "Account_Type": account_type
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        # Erros como senha inválida (bcrypt) ou problemas de DB
        raise HTTPException(status_code=401, detail="Invalid credentials.") 

@app.post("/auth/reset-password")
def reset_password(data: PasswordResetIn):
    """
    Redefine a senha diretamente após validação de email e senhas.
    """
    
    # 1. Validação de Senhas
    # ATENÇÃO: Verifique as chaves new_password/newPassword/confirm_password
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="As novas senhas não coincidem.")
    
    if len(data.new_password) < 6:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="A senha deve ter pelo menos 6 caracteres.")
    
    # 2. Conecta e Inicia Transação
    try:
        # Usa o gerenciador de contexto para a conexão
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                
                # 3. Encontra o ID do usuário pelo email
                find_user_query = "SELECT id FROM users WHERE email = %s"
                cursor.execute(find_user_query, (data.email,))
                user_record = cursor.fetchone()
                
                if not user_record:
                    # Se não achou o usuário, informa erro de forma genérica.
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                        detail="Email não encontrado.")

                user_id = user_record['id']
                
                # 4. Hasheia a nova senha (APENAS PARA USO EM PROJETO PESSOAL, O HASH É MELHOR)
                # nova_senha_hashed = hash_password(data.new_password)
                password_bytes = data.new_password.encode('utf-8') # SUBSTITUA PELA VERSÃO HASH SE USAR BCrypt/etc
                new_password_hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
                new_password_hashed_for_db = new_password_hashed.decode('utf-8')
                
                # 5. Atualiza a senha no DB
                update_query = "UPDATE users SET Password_hash = %s WHERE id = %s"
                cursor.execute(update_query, (new_password_hashed_for_db, user_id))
                conn.commit()
                
                return {"message": "Sua senha foi redefinida com sucesso."}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Erro ao redefinir senha: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            detail="Erro interno ao tentar redefinir a senha.")
        
@app.put("/profile/edit/{user_id}")
def update_user_profile(user_id: int, user_data: UserUpdateIn):
    """
    Atualiza o perfil com regras específicas baseadas no Account_Type.
    """
    
    # 1. Busca o tipo de conta do usuário
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            # Você deve ter uma coluna Account_Type na sua tabela USERS
            cursor.execute("SELECT Account_Type FROM users WHERE id = %s", (user_id,))
            user_record = cursor.fetchone()
            
            if not user_record:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
                
            account_type = user_record['Account_Type']
            is_company = account_type == 'Company'
            
            # Inicialização das transações
            user_updates = {}
            company_updates = {}
            data_to_update = user_data.model_dump(exclude_none=True)
            
            # 2. Aplica as Regras de Negócio e Separação de Dados
            
            allowed_user_fields = ['email'] # Email é permitido para ambos
            
            if not data_to_update:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum dado fornecido para atualização.")

            for field, value in data_to_update.items():
                if field == 'name' and not is_company:
                    # Permitido para Pessoa (Person)
                    user_updates[field] = value
                elif field == 'phone_number' and not is_company:
                    # Permitido para Pessoa (Person)
                    user_updates[field] = value
                elif field == 'company_name' and is_company:
                    # Permitido para Empresa (Company)
                    company_updates[field] = value
                elif field == 'email':
                    # Email é permitido para ambos e vai para a tabela users
                    user_updates[field] = value
                else:
                    # Ignora campos que não são permitidos para o tipo de conta
                    pass
                    
            # --- EXECUÇÃO DO UPDATE (USANDO A LÓGICA DE EXECUÇÃO DO PASSO ANTERIOR) ---
            
            # --- ATUALIZAÇÃO DA TABELA USERS ---
            if user_updates:
                updates = []
                update_values = []
                
                for field, value in user_updates.items():
                    updates.append(f"`{field}` = %s") 
                    update_values.append(value)
                
                update_user_query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
                update_values.append(user_id)
                
                cursor.execute(update_user_query, tuple(update_values))

            # --- ATUALIZAÇÃO DA TABELA COMPANIES ---
            if company_updates:
                
                company_updates_list = []
                company_update_values = []

                for field, value in company_updates.items():
                    company_updates_list.append(f"`{field}` = %s") 
                    company_update_values.append(value)
                
                update_company_query = f"UPDATE companies SET {', '.join(company_updates_list)} WHERE user_id = %s"
                company_update_values.append(user_id)
                
                cursor.execute(update_company_query, tuple(company_update_values))
                
                if cursor.rowcount == 0:
                    # Rollback se tentou atualizar a empresa e não achou
                    conn.rollback() 
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                        detail="Dados de empresa não encontrados para este ID de usuário.")


            # 3. Finaliza Transação
            conn.commit()
            return {"message": "Perfil atualizado com sucesso!"}

    except HTTPException as e:
        if conn: conn.rollback()
        raise e
    except Exception as e:
        print(f"Erro ao atualizar perfil: {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            detail="Erro interno ao tentar atualizar o perfil.")


    
@app.get("/profile/{user_id}")
def get_user_profile(user_id: int):
    
    query_user = """
        select id, name, email, Account_Type, Phone_Number
        from users
        where id = %s
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(query_user, (user_id,))
                user_data = cursor.fetchone()

                if not user_data:
                    raise HTTPException(status_code=404, detail="User not found.")
                
                # 2. Se for uma Empresa, busca os dados adicionais (companies)
                if user_data['Account_Type'] == 'Company':
                    query_company = """
                    SELECT company_name, cnpj
                    FROM companies
                    WHERE user_id = %s
                    """
                    cursor.execute(query_company, (user_id,))
                    company_data = cursor.fetchone()
                    
                    if company_data:
                        # Junta os dicionários para formar o perfil completo
                        user_data.update(company_data)

                # Remove o hash da senha (embora não devesse estar na query_user, é bom ter certeza)
                if 'Password_hash' in user_data:
                    del user_data['Password_hash']
                    
                return user_data

    except Exception as e:
        # Garante que qualquer erro de DB ou lógica seja capturado
        raise HTTPException(status_code=500, detail=f"Database error when loading profile: {e}")
    
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
    
@app.get("/api/vehicles/available", response_model=List[VehicleResponse])
def list_vehicle(mark: Optional[str] = None, min_price: Optional[float] = None):
    base_query = "select * from vehicles where Inventory_Status = 'Available'"
    params = []
    
    if mark:
        base_query += " and Mark = %s"
        params.append(mark)
    
    if min_price is not None:
        base_query += " and Price >= %s"
        params.append(min_price)
    
    try:
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(base_query, params)
                vehicles = cursor.fetchall()
        
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fail to search this vehicle: {e}")
    
@app.get("/api/companies", response_model=List[CompanyResponse])
def companies_list():
    """
    Retorna a lista completa de todas as empresas registradas.
    """
    query = "SELECT user_id, company_name, cnpj FROM companies"
    
    try:
        # Tenta se conectar ao banco de dados
        with get_db_connection() as conn:
            # 🎯 CRÍTICO: Usa DictCursor para retornar os dados como dicionários (JSON)
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(query)
                companies = cursor.fetchall()
        
        # O FastAPI validará a lista 'companies' com o CompanyResponse
        return companies
        
    except Exception as e:
        # Trata qualquer erro de banco de dados ou execução
        print(f"Erro ao buscar lista de empresas: {e}")
        # Envia um erro 500 para o frontend
        raise HTTPException(status_code=500, detail=f"Falha ao carregar a lista de empresas. Detalhe: {e}")
    
@app.post("/api/vendas/checkout")
async def sells(checkout: SellsIn):
    """
    Processar a transação de venda de um carro para o banco de dados:
    1. Verificar o status do carro (deve ser 'Disponível')
    2. Registrar a venda da tabela 'vendas'
    3. Atualiza o status do carro para vendidos.
    """
    
    query_check = "select Inventory_Status, Price from vehicles where id = %s for update"
    query_insert_data = """
        insert into sells (Client_id, Car_id, Total_value, Purchase_Status)
        values (%s, %s, %s, %s)
    """
    
    query_update_vehicle = "update vehicles set Inventory_Status = 'Sold' where id = %s"
    
    final_price = 0.0
    conn = None
    
    try:
        with get_db_connection() as conn:
            conn.begin()
            with conn.cursor() as cursor:
                cursor.execute(query_check, checkout.car_id)
                vehicle = cursor.fetchone()
                
                if not vehicle:
                    conn.rollback()
                    raise HTTPException(status_code=404, detail="Vehicle not found.")
                
                current_status = vehicle['Inventory_Status']
                final_price = float(vehicle['Price'])
                
                if current_status != 'Available':
                    conn.rollback()
                    raise HTTPException(status_code=404, detail=f"Vehicle status is {current_status}. Cannot proceed with checkout")
                
                
                purchase_status = 'Completed'
                purchase_date = (
                    checkout.client_id,
                    checkout.car_id,                    
                    final_price,
                    purchase_status,                    
                )
                
                cursor.execute(query_insert_data, purchase_date)
                sell_id = cursor.lastrowid
                
                cursor.execute(query_update_vehicle, (checkout.car_id,))
                conn.commit()
                
        return {
            "Message": "Checkout sucessful. Vehicle mark is sold.",
            "Sell_id": sell_id,
            "Car_id": checkout.car_id,
            "Value sold": final_price
        }
    except HTTPException as e:
        # Rollback já está sendo chamado dentro da exceção HTTP
        if 'conn' in locals() and conn:
            conn.rollback() 
        raise e
        
    except Exception as e:
        # Outros erros de DB
        if 'conn' in locals() and conn:
            conn.rollback() # Garante o rollback em caso de falha de conexão ou query
        print(f"Checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Transaction failed: {e}")
    
@app.get("/companies/")
async def companies_list():
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
        Analise o pedido do usuário para sugerir até 10(ou se especificar a quantidade) modelos de carros no mercado brasileiro com uma breve justificativa para cada.
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
   
        

  
    