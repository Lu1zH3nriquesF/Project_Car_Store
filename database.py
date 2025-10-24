import pymysql.cursors # type: ignore
from contextlib import contextmanager
from dotenv import load_dotenv
import os

load_dotenv()

host = 'localhost'
user = 'root'
password = os.getenv("DB_PASSWORD")
db = 'venda_carros'
charset = 'utf8mb4'
cursorclass = pymysql.cursors.DictCursor

DB_CONFIG = {
    'host': 'localhost',
    'user': user,
    'password': password,
    'db': db,
    'charset': charset,
    'cursorclass': cursorclass
}

@contextmanager
def get_db_connection():
    #O contextmanager server para gerenciar a conexão com o banco de dados de forma segura
    connection = None
    try:
        connection = pymysql.connect(**DB_CONFIG)
        yield connection
    finally:
        if connection:
            connection.close()
