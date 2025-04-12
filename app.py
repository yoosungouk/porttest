from flask import Flask, render_template, request, jsonify
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# 데이터베이스 연결 함수
def get_db_connection():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    return conn

# 전문분야 테이블 생성 함수
def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS expertise (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            value TEXT NOT NULL
        )
    ''')
    conn.commit()
    cur.close()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/expertise', methods=['GET'])
def get_expertise():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT type, value FROM expertise')
    expertise = cur.fetchall()
    cur.close()
    conn.close()
    
    expertise_dict = {item[0]: item[1] for item in expertise}
    return jsonify(expertise_dict)

@app.route('/api/expertise', methods=['POST'])
def add_expertise():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    
    # 기존 데이터 삭제
    cur.execute('DELETE FROM expertise')
    
    # 새로운 데이터 추가
    for key, value in data.items():
        cur.execute('INSERT INTO expertise (type, value) VALUES (%s, %s)',
                   (key, value))
    
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    init_db()
    app.run() 