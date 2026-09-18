from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

# --- NO DATABASE NEEDED FOR THIS UI TEST ---

@app.route('/api/outpass/<outpass_id>', methods=['GET'])
def get_outpass(outpass_id):
    # We instantly return "Approved" to trigger the UI logic
    return jsonify({
        "status": "Approved", 
        "qr_token": "test_outpass_001_secure_token"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)