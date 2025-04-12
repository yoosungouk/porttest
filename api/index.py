from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys

# API 모듈 import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.deals import handle_request as deals_handler

app = Flask(__name__)
CORS(app)  # CORS 설정

@app.route('/')
def index():
    # 기본 라우트는 templates 폴더의 index.html을 제공
    return send_from_directory('../templates', 'index.html')

@app.route('/api/deals', methods=['GET'])
def deals():
    # deals API 엔드포인트
    return deals_handler(request)

@app.route('/<path:path>')
def serve_static(path):
    # 정적 파일 제공
    return send_from_directory('../templates', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080))) 