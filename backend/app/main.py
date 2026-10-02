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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://contract-lens-qsxaz3r2z-kannaujiyapradeep095-2582.vercel.app",
    ],
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
