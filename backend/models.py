from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    rol: str  # "analista" o "company"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserDB(BaseModel):
    email: str
    nombre: str
    rol: str
    copas: int = 0
    xp: int = 0
    tier: int = 1
    arena: str = "Bronce"
    skills: dict = {
        "analisis_logs": 0,
        "deteccion_amenazas": 0,
        "respuesta_incidentes": 0,
        "threat_hunting": 0,
        "forense_digital": 0,
        "gestion_vulnerabilidades": 0,
        "inteligencia_amenazas": 0
    }
    sesiones_completadas: int = 0
    training_progreso: dict = {}
    fecha_registro: datetime = datetime.now()

class Token(BaseModel):
    access_token: str
    token_type: str
    rol: str
    nombre: str

class SessionResult(BaseModel):
    copas_ganadas: int
    xp_ganada: int
    puntuacion: float
    feedback: str
    skills_mejoradas: dict
    email_verificado: bool = False
token_verificacion: Optional[str] = None