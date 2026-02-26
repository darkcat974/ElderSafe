from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from fastapi.responses import JSONResponse
from crypto import encrypt_json, decrypt_json

# ------------------ pre-set ------------------

DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

app = FastAPI()


# ------------------ MODEL ------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    mac_address = Column(String, unique=True, index=True)
    nb_room = Column(Integer, default=0)
    name = Column(String, default="Unknown")


# ------------------ SCHEMA ------------------

class UserCreate(BaseModel):
    mac_address: str
    nb_room: int | None = 0
    name: str | None = "Unknown"


Base.metadata.create_all(bind=engine)
# ------------------ ROUTES ------------------

@app.get("/secure-info")
def get_secure_info():
    data = {"message": "hello", "answer": 42}
    token = encrypt_json(data)
    return JSONResponse(content={"ciphertext": token})

@app.get("/decipher-info/{token}")
def get_decipher_info(token: str):
    print(token)
    decifer = decrypt_json(token)
    return JSONResponse(content={"deciphertext": decifer})

@app.post("/data")
def receive_data(user_data: UserCreate):
    db = SessionLocal()
    try:
        if not user_data.mac_address:
            raise HTTPException(status_code=400, detail="MAC address is required")

        user = db.query(User).filter(User.mac_address == user_data.mac_address).first()

        if user:
            user.nb_room = user_data.nb_room or 0
            user.name = user_data.name or "Unknown"
        else:
            user = User(
                mac_address=user_data.mac_address,
                nb_room=user_data.nb_room or 0,
                name=user_data.name or "Unknown"
            )
            db.add(user)

        db.commit()
        db.refresh(user)

        return {
            "success": True,
            "message": "Données reçues et enregistrées !",
            "user": user
        }

    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save data")
    finally:
        db.close()


@app.get("/users")
def get_users():
    db = SessionLocal()
    try:
        return db.query(User).all()
    finally:
        db.close()


@app.get("/users/{mac}")
def get_user(mac: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.mac_address == mac).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    finally:
        db.close()
