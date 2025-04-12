from flask import Flask, render_template, jsonify
from flask_cors import CORS
from api.deals import handle_request

app = Flask(__name__)
CORS(app)  # CORS 설정 추가

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/deals', methods=['GET'])
def deals():
    return handle_request(None)

if __name__ == '__main__':
    app.run() 