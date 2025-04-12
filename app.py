from flask import Flask, render_template, request, jsonify
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Supabase 클라이언트 초기화
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/expertise', methods=['GET'])
def get_expertise():
    response = supabase.table('expertise').select('*').execute()
    expertise = response.data
    expertise_dict = {item['type']: item['value'] for item in expertise}
    return jsonify(expertise_dict)

@app.route('/api/expertise', methods=['POST'])
def add_expertise():
    data = request.json
    # 기존 데이터 삭제
    supabase.table('expertise').delete().execute()
    # 새로운 데이터 추가
    for key, value in data.items():
        supabase.table('expertise').insert({
            'type': key,
            'value': value
        }).execute()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run() 