import unittest
from server import crypto

class TestStringMethods(unittest.TestCase):
    def test_encrypt_json(self):
        self.assertEqual(crypto.encrypt_json(), '')
    
    def test_decrypt_json(self):
        self.assertEqual(crypto.decrypt_json(), '')

if __name__ == '__main__':
    unittest.main()