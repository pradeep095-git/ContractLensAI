from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.contract_api import router as contract_router
app = FastAPI(
    title="ContractLensAI API",
    description=(
    "AI-powered Legal Intelligent Contract Analysis System "
    "and Risk Assessment Platform"
        
    ),
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://contract-lens-ai-eight.vercel.app"],
       
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(contract_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to ContractLensAI Backend "
    }

    #user_api.property

from app.api.user_api import router as user_router
app.include_router(user_router)

#auth_api.py router include
from app.api.auth_api import router as auth_router
app.include_router(auth_router)

from app.database.create_tables import *