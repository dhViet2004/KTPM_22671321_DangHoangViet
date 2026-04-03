from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_docker():
    return 'Hello, Docker Flask!'

if __name__ == '__main__':
    # Chạy trên tất cả các interface (0.0.0.0) để Docker có thể truy cập
    app.run(host='0.0.0.0', port=5000)