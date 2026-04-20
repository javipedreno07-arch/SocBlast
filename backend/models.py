from pydantic import BaseModel, EmailStr, field_validator, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ── ROL con Enum — nadie puede registrarse como "admin" ──────────────────────
class RolUsuario(str, Enum):
    analista = "analista"
    empresa  = "empresa"
    company  = "company"   # alias legacy — se normaliza a "empresa" en el registro


class UserRegister(BaseModel):
    email:    EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    nombre:   str = Field(..., min_length=2, max_length=60)
    rol:      RolUsuario

    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Mínimo 8 caracteres, al menos una letra y un número."""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not any(c.isalpha() for c in v):
            raise ValueError('La contraseña debe contener al menos una letra')
        if not any(c.isdigit() for c in v):
            raise ValueError('La contraseña debe contener al menos un número')
        return v

    @field_validator('nombre')
    @classmethod
    def nombre_valido(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError('El nombre debe tener al menos 2 caracteres')
        # Evitar inyección de HTML/scripts en el nombre
        forbidden = ['<', '>', '"', "'", '/', '\\', ';', '=']
        if any(c in v for c in forbidden):
            raise ValueError('El nombre contiene caracteres no permitidos')
        return v


class UserLogin(BaseModel):
    email:    EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class UserDB(BaseModel):
    email:    str
    nombre:   str
    rol:      str
    copas:    int = 0
    xp:       int = 0
    tier:     int = 1
    arena:    str = "Bronce 3"
    skills:   dict = {
        "analisis_logs": 0, "deteccion_amenazas": 0,
        "respuesta_incidentes": 0, "threat_hunting": 0,
        "forense_digital": 0, "gestion_vulnerabilidades": 0,
        "inteligencia_amenazas": 0,
    }
    sesiones_completadas: int  = 0
    training_progreso:    dict = {}
    fecha_registro:       datetime = datetime.now()


class Token(BaseModel):
    access_token: str
    token_type:   str
    rol:          str
    nombre:       str