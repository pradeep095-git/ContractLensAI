from passlib.context import CryptContext

pwd=CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
def hash_password(password):
    return pwd.hash(password)

def verify_password(Plain_password,hashed_password):
    return pwd.verify(Plain_password,hashed_password)    