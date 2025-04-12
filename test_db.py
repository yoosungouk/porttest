import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

try:
    # 환경 변수에서 직접 연결 정보 가져오기
    conn_params = {
        'host': os.getenv('DB_HOST'),
        'port': os.getenv('DB_PORT'),
        'database': os.getenv('DB_NAME'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'sslmode': 'disable'
    }
    
    print(f"Connecting with parameters: {conn_params}")
    conn = psycopg2.connect(**conn_params)
    print("Database connection successful!")
    
    # 데이터 조회
    cur = conn.cursor()
    cur.execute('SELECT * FROM expertise')
    rows = cur.fetchall()
    print("\nCurrent data in expertise table:")
    for row in rows:
        print(f"ID: {row[0]}, Created at: {row[1]}, Type: {row[2]}")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"An error occurred: {e}")
    if hasattr(e, 'pgcode'):
        print(f"PostgreSQL error code: {e.pgcode}")
    if hasattr(e, 'pgerror'):
        print(f"PostgreSQL error message: {e.pgerror}") 