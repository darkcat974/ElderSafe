from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy import Enum, ForeignKey
import enum

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

class StatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ERROR = "ERROR"
    MAINTENANCE = "MAINTENANCE"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)


class LocalServer(Base):
    __tablename__ = "local_servers"

    id = Column(Integer, primary_key=True, index=True)
    local_server_id = Column(String, unique=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    forfait = Column(String)
    username = Column(String)
    status = Column(Enum(StatusEnum), default=StatusEnum.ACTIVE)

Base.metadata.create_all(bind=engine)

class UserCreate(BaseModel):
    email: str
    name: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    model_config = ConfigDict(from_attributes=True)


class LocalServerCreate(BaseModel):
    local_server_id: str
    client_id: int
    forfait: str
    username: str
    status: StatusEnum = StatusEnum.ACTIVE


class LocalServerResponse(BaseModel):
    id: int
    local_server_id: str
    client_id: int
    forfait: str
    username: str
    status: StatusEnum

    model_config = ConfigDict(from_attributes=True)

import random

def seed_data():
    db = SessionLocal()
    try:
        # ---- USERS ----
        users_data = [
            ("alice@mail.com", "Alice"),
            ("bob@mail.com", "Bob"),
            ("charlie@mail.com", "Charlie"),
            ("dana@mail.com", "Dana"),
            ("eve@mail.com", "Eve"),
        ]

        users = []
        for email, name in users_data:
            user = db.query(User).filter_by(email=email).first()
            if not user:
                user = User(email=email, name=name)
                db.add(user)
                db.flush()  # get id immediately
            users.append(user)

        # ---- SERVERS ----
        forfaits = ["basic", "pro", "enterprise"]
        statuses = list(StatusEnum)

        for i in range(10):
            local_id = f"server_{i}"

            if db.query(LocalServer).filter_by(local_server_id=local_id).first():
                continue

            server = LocalServer(
                local_server_id=local_id,
                client_id=random.choice(users).id,
                forfait=random.choice(forfaits),
                username=f"user_{i}",
                status=random.choice(statuses),
            )
            db.add(server)

        db.commit()
        print("✅ Seed done")
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup():
    seed_data()


# ------------------ ROOT ------------------
# -------- USERS --------

@app.post("/users", response_model=UserResponse)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    user = User(email=data.email, name=data.name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# -------- LOCAL SERVERS --------

@app.post("/servers", response_model=LocalServerResponse)
def create_server(data: LocalServerCreate, db: Session = Depends(get_db)):
    server = LocalServer(**data.model_dump())
    db.add(server)
    db.commit()
    db.refresh(server)
    return server


@app.get("/servers", response_model=list[LocalServerResponse])
def get_servers(db: Session = Depends(get_db)):
    return db.query(LocalServer).all()


@app.get("/servers/{server_id}", response_model=LocalServerResponse)
def get_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(LocalServer).filter(LocalServer.id == server_id).first()
    if not server:
        raise HTTPException(404, "Server not found")
    return server


@app.delete("/servers/{server_id}")
def delete_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(LocalServer).filter(LocalServer.id == server_id).first()
    if not server:
        raise HTTPException(404, "Server not found")

    db.delete(server)
    db.commit()
    return {"success": True}