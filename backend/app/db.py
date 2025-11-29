import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pathlib import Path
from dotenv import load_dotenv

# Ruta absoluta del archivo .env.dev (dentro de backend)
env_path = Path(__file__).resolve().parent.parent / ".env.dev"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
print("DATABASE_URL cargada:", DATABASE_URL)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
