from sqlalchemy import create_engine
from sqlalchemy.orm  import sessionmaker,declarative_base
from urllib.parse import quote_plus
from dotenv import load_dotenv
import os
load_dotenv()
password=quote_plus(os.getenv("DB_PASSWORD"))
DATABASE_URL=(f"mysql+pymysql://root:{password}@localhost/contractlens_ai")

engine=create_engine(
    DATABASE_URL,
    echo=True
)

SessionLocal=sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
Base=declarative_base()

#Database session function
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

      
