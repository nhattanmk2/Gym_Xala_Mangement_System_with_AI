import sys
try:
    import bcrypt
    print(bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode('utf-8'))
except ImportError:
    print("Bcrypt not installed")
