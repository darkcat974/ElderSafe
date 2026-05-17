import json
import base64
from server.crypto import encrypt_json, decrypt_json

data = {"hello": "world"}
token = encrypt_json(data)
print("Encrypted:", token)
dec = decrypt_json(token)
print("Decrypted:", dec)
