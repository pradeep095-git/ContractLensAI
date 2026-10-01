from fastapi.security import OAuth2PasswordBearer
from jose import jwt,JWTError
from fastapi import HTTPException,status

from jose import jwt
from datetime import datetime,timedelta,timezone

#Secret key
SECRET_KEY="change_this_to_a_long_random_secret_key_123456789"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60

oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/auth/login")

#Create jwt token
def create_access_token(data:dict):
    to_encode=data.copy()

    expire=datetime.now(timezone.utc)+timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({
        "exp":expire
    })
    token=jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return token
# decode_access_token()
def decode_access_token(token:str):
    try:
        payload=jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )  
        return payload

    except JWTError as e:
        print("🔥 JWT ERROR:", repr(e))

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or Expired Token"
    )