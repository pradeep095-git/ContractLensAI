from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas.user_schemas import UserCreate
from app.utils.hash import hash_password

router =APIRouter()

#Register API 
@router.post("/register")
def register(
    user:UserCreate,
    db:Session=Depends(get_db)):

    existing =db.query(User).filter(
        User.email==user.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email alreday registered"
        )
        print(user.password)
        print(len(user.password))
        #Password Hash
    hashed=hash_password(user.password)
   #Create User
    new_user=User(
    name=user.name,
    email=user.email,
    password=hashed
    )
    #Datasave Save
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return{
    "message":"User Registered Successfully"
    }