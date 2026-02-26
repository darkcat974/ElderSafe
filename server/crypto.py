# crypto.py
import nacl.secret
import nacl.utils
import base64
import json
import os
from dotenv import load_dotenv

load_dotenv()

key_b64 = os.environ["SECRETBOX_KEY_B64"]
key = base64.b64decode(key_b64) #64 -> 32b
box = nacl.secret.SecretBox(key)

def encrypt_json(data: dict) -> str:
    plaintext = json.dumps(data).encode("utf-8")
    encrypted = box.encrypt(plaintext)  # nonce + ciphertext + MAC inside[web:35]
    return base64.b64encode(encrypted).decode("ascii")

def decrypt_json(token: str) -> dict:
    encrypted = base64.b64decode(token)
    plaintext = box.decrypt(encrypted)
    return json.loads(plaintext.decode("utf-8"))
