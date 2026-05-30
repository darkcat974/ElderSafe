from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.routing import APIRoute
from typing import Callable
import json
import hashlib
import secrets
from pydantic import BaseModel, ConfigDict
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy import Enum, ForeignKey
import enum

DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

from fastapi.middleware.cors import CORSMiddleware
from crypto import encrypt_json, decrypt_json

class EncryptedRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            if request.headers.get("x-encrypted") == "true":
                body = await request.body()
                if body:
                    try:
                        decrypted_dict = decrypt_json(body.decode("utf-8"))
                        request._body = json.dumps(decrypted_dict).encode("utf-8")
                        async def new_receive():
                            return {"type": "http.request", "body": request._body}
                        request._receive = new_receive
                        
                        # Changer le header content-type pour que FastAPI le parse comme du JSON
                        headers = list(request.scope.get("headers", []))
                        for i, (k, v) in enumerate(headers):
                            if k.lower() == b"content-type":
                                headers[i] = (b"content-type", b"application/json")
                                break
                        else:
                            headers.append((b"content-type", b"application/json"))
                        request.scope["headers"] = headers
                        
                        # Re-créer l'objet request pour forcer la mise à jour des headers cachés
                        from fastapi import Request as FastAPIRequest
                        new_request = FastAPIRequest(request.scope, request._receive)
                        new_request._body = request._body
                        request = new_request
                    except Exception as e:
                        print("Decrypt error:", e)

            response = await original_route_handler(request)

            if request.headers.get("x-encrypted") == "true" and hasattr(response, "body"):
                try:
                    data_dict = json.loads(response.body.decode("utf-8"))
                    encrypted_str = encrypt_json(data_dict)
                    response.body = encrypted_str.encode("utf-8")
                    response.headers["Content-Length"] = str(len(response.body))
                except Exception:
                    pass

            return response

        return custom_route_handler

app = FastAPI(title="User API")
app.router.route_class = EncryptedRoute

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
    is_active = Column(Boolean, default=True)


class LocalServer(Base):
    __tablename__ = "local_servers"

    id = Column(Integer, primary_key=True, index=True)
    local_server_id = Column(String, unique=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    forfait = Column(String)
    username = Column(String)
    status = Column(Enum(StatusEnum), default=StatusEnum.ACTIVE)

class Alerte(Base):
    __tablename__ = "alertes"

    id = Column(Integer, primary_key=True, index=True)
    local_server_id = Column(Integer, ForeignKey("local_servers.id"))
    client_id = Column(Integer, ForeignKey("users.id"))
    etat_de_la_chute = Column(String)
    temps_au_sol = Column(String)
    niveau_urgence = Column(String)
    timestamp = Column(String)
    is_resolved = Column(Boolean, default=False)


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    contact_name = Column(String)
    user_name = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    num_tel = Column(String)
    mail = Column(String)
    pris_en_charge = Column(Boolean, default=False)


def hash_password(password: str, salt: str = None) -> str:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(password: str, stored_password: str) -> bool:
    try:
        salt, hashed = stored_password.split(":")
        return hash_password(password, salt) == stored_password
    except Exception:
        return False


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)


Base.metadata.create_all(bind=engine)

class UserCreate(BaseModel):
    email: str
    name: str
    is_active: bool = True


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool

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


class StatutPayload(BaseModel):
    id_local: str
    etat_connexion: str


class CapteurData(BaseModel):
    etat_de_la_chute: str
    temps_au_sol: str
    niveau_urgence: str
    timestamp: str


class AlertePayload(BaseModel):
    id_local: str
    id_client: str
    etat_connexion: str
    donnees_capteur: CapteurData


class AlerteResponse(BaseModel):
    id: int
    local_server_id: int
    client_id: int
    etat_de_la_chute: str
    temps_au_sol: str
    niveau_urgence: str
    timestamp: str
    is_resolved: bool

    model_config = ConfigDict(from_attributes=True)


class ContactCreate(BaseModel):
    contact_name: str
    user_name: str
    user_id: int
    num_tel: str
    mail: str
    pris_en_charge: bool = False


class ContactResponse(BaseModel):
    id: int
    contact_name: str
    user_name: str
    user_id: int
    num_tel: str
    mail: str
    pris_en_charge: bool

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str
    password: str


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

        # ---- CONTACTS ----
        contacts_data = [
            ("Jean", "Alice", "0612345678", "jean@mail.com"),
            ("Marie", "Alice", "0623456789", "marie@mail.com"),
            ("Pierre", "Bob", "0634567890", "pierre@mail.com"),
            ("Sophie", "Charlie", "0645678901", "sophie@mail.com"),
        ]

        for contact_name, u_name, num_tel, mail in contacts_data:
            usr = next((u for u in users if u.name == u_name), None)
            if usr:
                existing = db.query(Contact).filter_by(contact_name=contact_name, user_id=usr.id).first()
                if not existing:
                    contact = Contact(
                        contact_name=contact_name,
                        user_name=usr.name,
                        user_id=usr.id,
                        num_tel=num_tel,
                        mail=mail,
                        pris_en_charge=random.choice([True, False])
                    )
                    db.add(contact)

        # ---- ALERTES ----
        if db.query(Alerte).count() == 0:
            all_servers = db.query(LocalServer).all()
            for srv in all_servers:
                # Ajouter 1 à 2 alertes résolues pour l'historique
                for k in range(random.randint(1, 2)):
                    alert = Alerte(
                        local_server_id=srv.id,
                        client_id=srv.client_id,
                        etat_de_la_chute=random.choice([
                            "Lourde chute détectée",
                            "Chute lente amortie",
                            "Mouvement inhabituel prolongé"
                        ]),
                        temps_au_sol=f"{random.randint(1, 10)} min",
                        niveau_urgence=random.choice(["HIGH", "MEDIUM"]),
                        timestamp=f"2026-05-26 14:0{k}:00",
                        is_resolved=True
                    )
                    db.add(alert)
                
                # Ajouter parfois une alerte non résolue
                if srv.status == StatusEnum.ERROR or random.choice([True, False]):
                    alert = Alerte(
                        local_server_id=srv.id,
                        client_id=srv.client_id,
                        etat_de_la_chute="Alerte manuelle SOS initiée",
                        temps_au_sol="3 min",
                        niveau_urgence="HIGH",
                        timestamp="2026-05-26 21:55:00",
                        is_resolved=False
                    )
                    db.add(alert)

        # ---- ACCOUNTS ----
        if db.query(Account).count() == 0:
            accounts_data = [
                ("admin", "admin@eldersafe.com", "password", "admin"),
                ("caregiver", "caregiver@eldersafe.com", "password", "caregiver"),
                ("edlersafe", "contact@eldersafe.com", "eldersafe974", "admin"),
            ]
            for username, email, pwd, role in accounts_data:
                db.add(Account(
                    username=username,
                    email=email,
                    password=hash_password(pwd),
                    role=role
                ))

        db.commit()
        print("✅ Seed done")
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup():
    seed_data()


# ------------------ ROOT ------------------
# -------- AUTH --------

@app.post("/api/v1/login")
def login_endpoint(payload: LoginRequest, db: Session = Depends(get_db)):
    # Chercher le compte par nom d'utilisateur ou adresse email
    account = db.query(Account).filter(
        (Account.username == payload.username) | (Account.email == payload.username)
    ).first()

    if not account or not verify_password(payload.password, account.password):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

    return {
        "success": True,
        "username": account.username,
        "email": account.email,
        "role": account.role
    }


# -------- USERS --------

@app.post("/users", response_model=UserResponse)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    user = User(email=data.email, name=data.name, is_active=data.is_active)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.email = data.email
    user.name = data.name
    user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    return user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


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


# -------- API SERVEUR LOCAL --------

@app.post("/api/v1/serveur-local/statut")
def update_statut(payload: StatutPayload, db: Session = Depends(get_db)):
    server = db.query(LocalServer).filter(LocalServer.local_server_id == payload.id_local).first()
    if not server:
        raise HTTPException(status_code=404, detail="Serveur local non trouvé")
    
    if payload.etat_connexion.lower() in ["connecte", "connecté", "online"]:
        server.status = StatusEnum.ACTIVE
    else:
        server.status = StatusEnum.INACTIVE
    
    db.commit()
    db.refresh(server)
    return {"message": "Statut mis à jour avec succès", "status": server.status}


@app.post("/api/v1/serveur-local/alertes")
def recevoir_alerte(payload: AlertePayload, db: Session = Depends(get_db)):
    server = db.query(LocalServer).filter(LocalServer.local_server_id == payload.id_local).first()
    if not server:
        raise HTTPException(status_code=404, detail="Serveur local non trouvé")
    
    if payload.etat_connexion.lower() in ["connecte", "connecté", "online"]:
        server.status = StatusEnum.ACTIVE

    nouvelle_alerte = Alerte(
        local_server_id=server.id,
        client_id=server.client_id,
        etat_de_la_chute=payload.donnees_capteur.etat_de_la_chute,
        temps_au_sol=payload.donnees_capteur.temps_au_sol,
        niveau_urgence=payload.donnees_capteur.niveau_urgence,
        timestamp=payload.donnees_capteur.timestamp
    )
    db.add(nouvelle_alerte)
    db.commit()
    db.refresh(nouvelle_alerte)
    
    return {"message": "Alerte reçue et enregistrée", "alerte_id": nouvelle_alerte.id}


@app.put("/api/v1/alertes/{alerte_id}/resolve")
def resolve_alerte(alerte_id: int, db: Session = Depends(get_db)):
    alerte = db.query(Alerte).filter(Alerte.id == alerte_id).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    alerte.is_resolved = True
    db.commit()
    return {"message": "Alerte marquée comme traitée", "alerte_id": alerte_id}


@app.get("/alertes", response_model=list[AlerteResponse])
def get_alertes(db: Session = Depends(get_db)):
    return db.query(Alerte).all()


# -------- CONTACTS --------

@app.post("/contacts", response_model=ContactResponse)
def create_contact(data: ContactCreate, db: Session = Depends(get_db)):
    contact = Contact(**data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@app.get("/contacts", response_model=list[ContactResponse])
def get_contacts(db: Session = Depends(get_db)):
    return db.query(Contact).all()


@app.put("/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, data: ContactCreate, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact.contact_name = data.contact_name
    contact.user_name = data.user_name
    contact.user_id = data.user_id
    contact.num_tel = data.num_tel
    contact.mail = data.mail
    contact.pris_en_charge = data.pris_en_charge
    db.commit()
    db.refresh(contact)
    return contact


@app.delete("/contacts/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(contact)
    db.commit()
    return {"success": True}