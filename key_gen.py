# import nacl.secret, nacl.utils, base64

# key = nacl.utils.random(nacl.secret.SecretBox.KEY_SIZE)
# print("SECRETBOX_KEY_B64=", base64.b64encode(key).decode("ascii"))
from nacl.public import PrivateKey
import base64

sk = PrivateKey.generate()
pk = sk.public_key

print("SERVER_PRIVKEY_B64="+ base64.b64encode(bytes(sk)).decode())
print("SERVER_PUBKEY_B64="+ base64.b64encode(bytes(pk)).decode())