from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session

DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="User API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dev wildcard—safe for localhost
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicit POST
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    mac_address = Column(String, unique=True, index=True)
    nb_room = Column(Integer, default=0)
    name = Column(String, default="Unknown")

class UserCreate(BaseModel):
    mac_address: str
    nb_room: int | None = 0
    name: str | None = "Unknown"

# Response schema with ORM config
class UserResponse(BaseModel):
    id: int
    mac_address: str
    nb_room: int
    name: str

    model_config = ConfigDict(from_attributes=True)

Base.metadata.create_all(bind=engine)

def seed_fake_users():
    db = SessionLocal()
    try:
        fake_users = [
            ("00:1B:44:11:3A:B7", 1, "Alice"),
            ("00:1B:44:11:3A:B8", 2, "Bob"),
            ("AA:BB:CC:DD:EE:FF", 3, "Charlie"),
            ("11:22:33:44:55:66", 4, "Dana"),
            ("FF:EE:DD:CC:BB:AA", 5, "Eve"),
        ]

        added_count = 0
        for mac, nb_room, name in fake_users:
            # Skip if MAC already exists
            if not db.query(User).filter(User.mac_address == mac).first():
                db.add(User(mac_address=mac, nb_room=nb_room, name=name))
                added_count += 1

        if added_count > 0:
            db.commit()
            print(f"Seeded {added_count} new fake users")
        else:
            print("All fake users already exist")
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

# Seed immediately after tables are created
seed_fake_users()

@app.on_event("startup")
async def startup_event():
    print("🚀 Server started with fake users seeded!")


# ------------------ ROOT ------------------

@app.post("/data", response_model=dict)
def receive_data(user_data: UserCreate, db: Session = Depends(get_db)):
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
        "user": {
            "id": user.id,
            "mac_address": user.mac_address,
            "nb_room": user.nb_room,
            "name": user.name
        }
    }

@app.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.get("/users/{mac}", response_model=UserResponse)
def get_user(mac: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.mac_address == mac).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return {"success": True, "message": "User deleted"}