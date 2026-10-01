from pydantic import BaseModel

class ContractResponse(BaseModel):
    id:int
    filename:str
    class Config:
        from_attributes=True