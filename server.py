import base64
import binascii
import hashlib
import hmac
from flask import Flask, request, jsonify
import secrets
import json

app = Flask(__name__)

@app.route('/get_token', methods=['POST'])
def get_token():
    try:
        data = request.get_json()  # Get JSON data from the request
    except Exception as e:
        return jsonify({"error": "Invalid JSON data"}), 400

    key_bytes = binascii.unhexlify(data['key'])
    digest = hmac.new(key_bytes, bytes(data['data']), hashlib.sha256).digest()

    return base64.b64encode(digest).strip()

if __name__ == '__main__':
    app.run(debug=True)
