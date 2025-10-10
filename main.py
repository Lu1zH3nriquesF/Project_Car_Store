from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db_connection
import bcrypt
import os
import pymysql

app = FastAPI()

class UserIn(BaseModel):
    name: str
    email:str
    password: str
    account_type: str
    phone_number: Optional[str] = None
    
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
    
class SeachLLM(BaseModel):
    preferences: str
    
@app.post("/register/")
def register_user(user: UserIn):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    query = """
    insert into users (name, email, Password_hash, users.Account_Type, users.Phone_Number)
    values (%s, %s, %s, %s, %s)
    
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (user.name, user.email, hashed_password, user.account_type, user.phone_number))
                conn.commit()
        
        return {'Message': 'User succefully registered.'}
    except pymysql.err.IntegrityError:
        raise HTTPException(status_code=400, detail='Email alredy register.')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"The user couldn't be register: {e}")
    
@app.post("/vehicle")
def register_vehicle(vehicle: VehicleIn):
    query = """
        insert into vehicles
    """
        

    
    