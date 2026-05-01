from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from database import get_db
from models import UserRegister, UserLogin, Token
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import datetime
from openai import OpenAI
import time
import os
import json

router = APIRouter()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ── ARENA SYSTEM ──────────────────────────────────────────────────────────────
ARENAS_CONFIG = [
    {"nombre": "Bronce 3",  "grupo": "Bronce",   "min": 0,    "max": 299},
    {"nombre": "Bronce 2",  "grupo": "Bronce",   "min": 300,  "max": 599},
    {"nombre": "Bronce 1",  "grupo": "Bronce",   "min": 600,  "max": 899},
    {"nombre": "Plata 3",   "grupo": "Plata",    "min": 900,  "max": 1199},
    {"nombre": "Plata 2",   "grupo": "Plata",    "min": 1200, "max": 1499},
    {"nombre": "Plata 1",   "grupo": "Plata",    "min": 1500, "max": 1799},
    {"nombre": "Oro 3",     "grupo": "Oro",      "min": 1800, "max": 2099},
    {"nombre": "Oro 2",     "grupo": "Oro",      "min": 2100, "max": 2399},
    {"nombre": "Oro 1",     "grupo": "Oro",      "min": 2400, "max": 2699},
    {"nombre": "Diamante 3","grupo": "Diamante", "min": 2700, "max": 2999},
    {"nombre": "Diamante 2","grupo": "Diamante", "min": 3000, "max": 3299},
    {"nombre": "Diamante 1","grupo": "Diamante", "min": 3300, "max": 99999},
]

SKILLS_LIST = [
    "analisis_logs", "deteccion_amenazas", "respuesta_incidentes",
    "threat_hunting", "forense_digital", "gestion_vulnerabilidades",
    "inteligencia_amenazas", "siem_queries"
]

SKILLS_CAP = {
    "Bronce":   6.0,
    "Plata":    8.0,
    "Oro":      10.0,
    "Diamante": 10.0,
}

DELTA_BAJA        = 0.1
RACHA_MALA_LIMITE = 3


def get_arena_por_copas(copas: int) -> str:
    for a in ARENAS_CONFIG:
        if copas <= a["max"]:
            return a["nombre"]
    return "Diamante 1"


def get_grupo_arena(arena: str) -> str:
    for grupo in ["Diamante", "Oro", "Plata", "Bronce"]:
        if grupo in arena:
            return grupo
    return "Bronce"


def calcular_tier(xp: int) -> int:
    if xp < 500:   return 1
    if xp < 1500:  return 2
    if xp < 3000:  return 3
    if xp < 5000:  return 4
    if xp < 8000:  return 5
    if xp < 12000: return 6
    if xp < 18000: return 7
    return 8


def aplicar_skills(skills_actuales, evaluacion_ia, skills_streak_bad, arena):
    grupo        = get_grupo_arena(arena)
    cap          = SKILLS_CAP.get(grupo, 6.0)
    nuevas       = {k: float(v) for k, v in skills_actuales.items()}
    nuevo_streak = dict(skills_streak_bad)

    for skill, datos in evaluacion_ia.items():
        if skill not in nuevas:
            continue
        if isinstance(datos, (int, float)):
            delta = float(datos) * 0.15
            malo  = (datos == 0)
        else:
            delta = min(0.3, max(0.0, float(datos.get("delta", 0.0))))
            malo  = bool(datos.get("malo", False))

        if malo:
            nuevo_streak[skill] = nuevo_streak.get(skill, 0) + 1
            if nuevo_streak[skill] >= RACHA_MALA_LIMITE:
                nuevas[skill]       = round(max(0.0, nuevas[skill] - DELTA_BAJA), 2)
                nuevo_streak[skill] = 0
        else:
            nuevo_streak[skill] = 0
            if delta > 0:
                nuevas[skill] = round(min(cap, nuevas[skill] + delta), 2)

    return nuevas, nuevo_streak


def skills_streak_inicial():
    return {s: 0 for s in SKILLS_LIST}


# ── OAUTH GOOGLE ──────────────────────────────────────────────────────────────
oauth = OAuth()
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    client_kwargs={'scope': 'openid email profile'},
)

@router.get("/auth/google")
async def google_login(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://127.0.0.1:8000/api/auth/google/callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google/callback")
async def google_callback(request: Request):
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    try:
        token     = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        email     = user_info['email']
        nombre    = user_info.get('name', email.split('@')[0])
        db        = get_db()
        existing  = await db.users.find_one({"email": email})
        if not existing:
            await db.users.insert_one({
                "email": email, "password": "", "nombre": nombre, "rol": "analista",
                "copas": 0, "xp": 0, "tier": 1, "arena": "Bronce 3",
                "skills": {s: 0.0 for s in SKILLS_LIST},
                "skills_streak_bad": skills_streak_inicial(),
                "sesiones_completadas": 0, "training_progreso": {},
                "fecha_registro": datetime.now().isoformat(),
                "oauth_provider": "google", "email_verificado": True,
                "nombre_completo": "", "edad": None, "ubicacion": "",
                "preferencias": [], "foto_perfil": "", "perfil_publico": True,
            })
            rol = "analista"
        else:
            rol     = existing.get("rol", "analista")
            updates = {}
            if "siem_queries" not in existing.get("skills", {}):
                updates["skills.siem_queries"] = 0.0
            if "skills_streak_bad" not in existing:
                updates["skills_streak_bad"] = skills_streak_inicial()
            if "nombre_completo" not in existing:
                updates["nombre_completo"] = ""
            if "ubicacion" not in existing:
                updates["ubicacion"] = ""
            if "preferencias" not in existing:
                updates["preferencias"] = []
            if "foto_perfil" not in existing:
                updates["foto_perfil"] = ""
            if "perfil_publico" not in existing:
                updates["perfil_publico"] = True
            if updates:
                await db.users.update_one({"email": email}, {"$set": updates})

        access_token = create_access_token({"sub": email, "rol": rol})
        return RedirectResponse(url=f"{frontend_url}/oauth/callback?token={access_token}&rol={rol}&nombre={nombre}")
    except Exception as e:
        print(f"Error Google OAuth: {e}")
        return RedirectResponse(url=f"{frontend_url}/login?error=google_failed")


# ── AUTH ──────────────────────────────────────────────────────────────────────
@router.post("/register")
async def register(user: UserRegister):
    db = get_db()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    await db.users.insert_one({
        "email":    user.email,
        "password": get_password_hash(user.password),
        "nombre":   user.nombre,
        "rol":      user.rol,
        "copas": 0, "xp": 0, "tier": 1, "arena": "Bronce 3",
        "skills":            {s: 0.0 for s in SKILLS_LIST},
        "skills_streak_bad": skills_streak_inicial(),
        "sesiones_completadas": 0, "training_progreso": {},
        "fecha_registro": datetime.now().isoformat(),
        "email_verificado": True,
        "nombre_completo": "", "edad": None, "ubicacion": "",
        "preferencias": [], "foto_perfil": "", "perfil_publico": True,
    })
    return {"mensaje": "Registro exitoso. Ya puedes iniciar sesión."}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db = get_db()
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    updates = {}
    if not db_user.get("email_verificado", False):
        updates["email_verificado"] = True
    if "siem_queries" not in db_user.get("skills", {}):
        updates["skills.siem_queries"] = 0.0
    if "skills_streak_bad" not in db_user:
        updates["skills_streak_bad"] = skills_streak_inicial()
    if "nombre_completo" not in db_user:
        updates["nombre_completo"] = ""
    if "ubicacion" not in db_user:
        updates["ubicacion"] = ""
    if "preferencias" not in db_user:
        updates["preferencias"] = []
    if "foto_perfil" not in db_user:
        updates["foto_perfil"] = ""
    if "perfil_publico" not in db_user:
        updates["perfil_publico"] = True
    if updates:
        await db.users.update_one({"email": user.email}, {"$set": updates})

    token = create_access_token({"sub": user.email, "rol": db_user["rol"]})
    return {"access_token": token, "token_type": "bearer", "rol": db_user["rol"], "nombre": db_user["nombre"]}

@router.get("/verificar-email")
async def verificar_email(token: str):
    db = get_db()
    usuario = await db.users.find_one({"token_verificacion": token})
    if not usuario:
        raise HTTPException(400, "Token inválido o expirado")
    await db.users.update_one(
        {"token_verificacion": token},
        {"$set": {"email_verificado": True, "token_verificacion": None}}
    )
    return {"mensaje": "Email verificado correctamente. Ya puedes iniciar sesión."}

@router.get("/me")
async def get_me(email: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": email}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user["_id"] = str(user["_id"])
    return user


# ── PERFIL ────────────────────────────────────────────────────────────────────
@router.put("/me/perfil")
async def update_perfil(datos: dict, email: str = Depends(get_current_user)):
    db = get_db()
    campos_permitidos = {"nombre_completo","edad","ubicacion","preferencias","foto_perfil","perfil_publico"}
    update = {k: v for k, v in datos.items() if k in campos_permitidos}
    if not update:
        raise HTTPException(status_code=400, detail="No hay campos válidos para actualizar")
    if "edad" in update and update["edad"] is not None:
        try:
            update["edad"] = int(update["edad"])
            if not (14 <= update["edad"] <= 99):
                raise HTTPException(status_code=400, detail="Edad fuera de rango (14-99)")
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Edad debe ser un número")
    if "nombre_completo" in update and len(str(update["nombre_completo"])) > 80:
        raise HTTPException(status_code=400, detail="Nombre completo demasiado largo (máx 80 caracteres)")
    if "ubicacion" in update and len(str(update["ubicacion"])) > 100:
        raise HTTPException(status_code=400, detail="Ubicación demasiado larga (máx 100 caracteres)")
    if "preferencias" in update:
        if not isinstance(update["preferencias"], list):
            raise HTTPException(status_code=400, detail="Preferencias debe ser una lista")
        update["preferencias"] = update["preferencias"][:10]
    if "foto_perfil" in update and update["foto_perfil"]:
        foto = str(update["foto_perfil"])
        if not (foto.startswith("data:image/") or foto.startswith("https://")):
            raise HTTPException(status_code=400, detail="Formato de foto inválido")
        if len(foto) > 2_000_000:
            raise HTTPException(status_code=400, detail="Foto demasiado grande (máx ~1.5MB)")
    await db.users.update_one({"email": email}, {"$set": update})
    user = await db.users.find_one({"email": email}, {"password": 0})
    user["_id"] = str(user["_id"])
    return user


# ── STATS ─────────────────────────────────────────────────────────────────────
@router.put("/me/copas")
async def update_copas(copas_delta: int, email: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": email})
    nuevas_copas = max(0, user["copas"] + copas_delta)
    arena = get_arena_por_copas(nuevas_copas)
    await db.users.update_one({"email": email}, {"$set": {"copas": nuevas_copas, "arena": arena}})
    return {"copas": nuevas_copas, "arena": arena}

@router.put("/me/xp")
async def update_xp(xp_delta: int, email: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": email})
    nueva_xp = user["xp"] + xp_delta
    tier = calcular_tier(nueva_xp)
    await db.users.update_one({"email": email}, {"$set": {"xp": nueva_xp, "tier": tier}})
    return {"xp": nueva_xp, "tier": tier}


# ── CERTIFICADO ───────────────────────────────────────────────────────────────
@router.get("/certificado/{cert_id}")
async def verificar_certificado(cert_id: str):
    db = get_db()
    cert_id_lower = cert_id.lower().strip()
    if len(cert_id_lower) != 12:
        raise HTTPException(status_code=400, detail="ID de certificado inválido (debe tener 12 caracteres)")
    users = await db.users.find(
        {"rol": "analista"},
        {"password": 0, "email": 0, "skills_streak_bad": 0,
         "training_progreso": 0, "token_verificacion": 0}
    ).to_list(50000)
    user = None
    for u in users:
        uid = str(u["_id"])
        if uid[-12:].lower() == cert_id_lower:
            user = u
            break
    if not user:
        raise HTTPException(status_code=404, detail="Certificado no encontrado")
    return {
        "nombre":               user.get("nombre", ""),
        "arena":                user.get("arena", "Bronce 3"),
        "tier":                 user.get("tier", 1),
        "xp":                   user.get("xp", 0),
        "copas":                user.get("copas", 0),
        "sesiones_completadas": user.get("sesiones_completadas", 0),
        "skills":               user.get("skills", {}),
        "fecha_registro":       user.get("fecha_registro", ""),
        "cert_id":              cert_id.upper(),
    }


# ── SESIONES ──────────────────────────────────────────────────────────────────
from sessions import generar_sesion, evaluar_respuesta

@router.post("/sesiones/generar")
async def crear_sesion(email: str = Depends(get_current_user)):
    db    = get_db()
    user  = await db.users.find_one({"email": email})
    arena = user.get("arena", "Bronce 3")
    grupo = arena.split(" ")[0] if " " in arena else arena
    try:
        sesion = await generar_sesion(grupo)
        sesion["arena"]         = arena
        sesion["email_usuario"] = email
        sesion["estado"]        = "activa"
        sesion["inicio"]        = time.time()
        sesion["respuestas"]    = []
        result = await db.sesiones.insert_one(sesion)
        sesion["_id"] = str(result.inserted_id)
        return sesion
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando sesión: {str(e)}")

@router.post("/sesiones/{sesion_id}/responder")
async def responder_incidente(
    sesion_id: str, incidente_id: int, respuesta: str,
    tiempo_usado: int, pistas_usadas: int = 0,
    email: str = Depends(get_current_user)
):
    from bson import ObjectId
    db     = get_db()
    sesion = await db.sesiones.find_one({"_id": ObjectId(sesion_id)})
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    incidente     = sesion["incidentes"][incidente_id - 1]
    arena         = sesion.get("arena", "Bronce 3")
    grupo         = arena.split(" ")[0] if " " in arena else arena
    tiempos       = {"Bronce": 20, "Plata": 15, "Oro": 10, "Diamante": 7}
    tiempo_limite = tiempos.get(grupo, 20)
    evaluacion = await evaluar_respuesta(
        incidente, respuesta, tiempo_usado, tiempo_limite, pistas_usadas, arena
    )
    skills_mejora = evaluacion.get("skills_mejoradas", {})
    if skills_mejora:
        user              = await db.users.find_one({"email": email})
        skills_actuales   = user.get("skills", {s: 0.0 for s in SKILLS_LIST})
        skills_streak_bad = user.get("skills_streak_bad", skills_streak_inicial())
        skills_nuevas, nuevo_streak = aplicar_skills(
            skills_actuales, skills_mejora, skills_streak_bad, arena
        )
        await db.users.update_one(
            {"email": email},
            {"$set": {"skills": skills_nuevas, "skills_streak_bad": nuevo_streak}}
        )
        evaluacion["skills_nuevas"] = skills_nuevas
    await db.sesiones.update_one(
        {"_id": ObjectId(sesion_id)},
        {"$push": {"respuestas": {"incidente_id": incidente_id, "evaluacion": evaluacion}}}
    )
    return evaluacion

@router.post("/sesiones/{sesion_id}/finalizar")
async def finalizar_sesion(sesion_id: str, email: str = Depends(get_current_user)):
    from bson import ObjectId
    db     = get_db()
    sesion = await db.sesiones.find_one({"_id": ObjectId(sesion_id)})
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    respuestas = sesion.get("respuestas", [])
    if not respuestas:
        raise HTTPException(status_code=400, detail="No hay respuestas")
    total_copas      = sum(r["evaluacion"]["copas_delta"] for r in respuestas)
    media_puntuacion = sum(r["evaluacion"]["total"] for r in respuestas) / len(respuestas)
    total_xp         = sum(r["evaluacion"]["total"] * 3 for r in respuestas)
    user         = await db.users.find_one({"email": email})
    nuevas_copas = max(0, user["copas"] + total_copas)
    nueva_xp     = user["xp"] + total_xp
    arena        = get_arena_por_copas(nuevas_copas)
    tier         = calcular_tier(nueva_xp)
    await db.users.update_one({"email": email}, {"$set": {
        "copas": nuevas_copas, "arena": arena, "xp": nueva_xp, "tier": tier,
        "sesiones_completadas": user.get("sesiones_completadas", 0) + 1,
    }})
    await db.sesiones.update_one(
        {"_id": ObjectId(sesion_id)},
        {"$set": {"estado": "completada", "resultado": {
            "copas_ganadas": total_copas,
            "media_puntuacion": media_puntuacion,
            "xp_ganada": total_xp,
        }}}
    )
    return {
        "copas_ganadas": total_copas, "nuevas_copas": nuevas_copas,
        "arena": arena, "xp_ganada": total_xp,
        "media_puntuacion": round(media_puntuacion, 1), "tier": tier,
    }

@router.get("/sesiones/historial")
async def historial_sesiones(email: str = Depends(get_current_user)):
    db = get_db()
    sesiones = await db.sesiones.find(
        {"email_usuario": email}, {"incidentes": 0}
    ).sort("inicio", -1).limit(10).to_list(10)
    for s in sesiones:
        s["_id"] = str(s["_id"])
    return sesiones


# ── RANKING ───────────────────────────────────────────────────────────────────
@router.get("/ranking")
async def get_ranking(email: str = Depends(get_current_user)):
    db = get_db()
    jugadores = await db.users.find(
        {"rol": "analista"},
        {"nombre": 1, "copas": 1, "arena": 1, "tier": 1, "xp": 1}
    ).sort("copas", -1).limit(100).to_list(100)
    for j in jugadores:
        j["_id"] = str(j["_id"])
    user = await db.users.find_one({"email": email}, {"nombre": 1, "copas": 1, "arena": 1, "tier": 1})
    mi_posicion = None
    if user:
        posicion = next(
            (i + 1 for i, j in enumerate(jugadores) if j.get("nombre") == user["nombre"]),
            len(jugadores) + 1
        )
        mi_posicion = {
            "nombre": user["nombre"], "copas": user["copas"],
            "arena": user["arena"], "tier": user["tier"], "posicion": posicion,
        }
    return {"jugadores": jugadores, "mi_posicion": mi_posicion}


# ── EMPRESA ───────────────────────────────────────────────────────────────────
@router.get("/talent-pool")
async def get_talent_pool(email: str = Depends(get_current_user)):
    db = get_db()
    analistas = await db.users.find(
        {"rol": "analista", "perfil_publico": {"$ne": False}},
        {"password": 0, "email": 0, "skills_streak_bad": 0, "training_progreso": 0}
    ).sort("copas", -1).to_list(100)
    for a in analistas:
        a["_id"] = str(a["_id"])
    return analistas

@router.post("/ofertas")
async def crear_oferta(oferta: dict, email: str = Depends(get_current_user)):
    db   = get_db()
    user = await db.users.find_one({"email": email})
    oferta["empresa"]       = user.get("nombre", "Empresa")
    oferta["email_empresa"] = email
    oferta["fecha"]         = datetime.now().isoformat()
    oferta["estado"]        = "activa"
    result = await db.ofertas.insert_one(oferta)
    return {"id": str(result.inserted_id), "mensaje": "Oferta publicada correctamente"}

@router.post("/simulaciones-empresa")
async def crear_simulacion_empresa(simulacion: dict, email: str = Depends(get_current_user)):
    db   = get_db()
    user = await db.users.find_one({"email": email})
    simulacion["empresa"]       = user.get("nombre", "Empresa")
    simulacion["email_empresa"] = email
    simulacion["fecha"]         = datetime.now().isoformat()
    result = await db.simulaciones_empresa.insert_one(simulacion)
    return {"id": str(result.inserted_id), "mensaje": "Simulación creada correctamente"}


# ── LAB ───────────────────────────────────────────────────────────────────────
import random

LAB_TIPOS = {
    "forense": {
        "nombre": "Forense Post-Mortem",
        "descripcion": "El ataque ya ocurrió. Reconstruye la cadena completa analizando artefactos.",
        "icono": "🔬",
        "skills": ["forense_digital", "analisis_logs", "inteligencia_amenazas"],
        "objetivo_template": "Reconstruir la cadena completa del ataque: vector de entrada, herramientas usadas, movimiento lateral, persistencia y datos exfiltrados.",
    },
    "threat_hunt": {
        "nombre": "Threat Hunting",
        "descripcion": "No hay alerta. El atacante lleva días dentro. Encuéntralo entre el ruido.",
        "icono": "🎯",
        "skills": ["threat_hunting", "analisis_logs", "siem_queries"],
        "objetivo_template": "Detectar actividad maliciosa oculta sin alertas previas. Formular hipótesis, buscar IOCs y confirmar compromiso.",
    },
    "incident_response": {
        "nombre": "Incident Response",
        "descripcion": "Ataque en curso. Cada decisión tiene consecuencias. Contén antes de que se propague.",
        "icono": "🚨",
        "skills": ["respuesta_incidentes", "deteccion_amenazas", "analisis_logs"],
        "objetivo_template": "Identificar el alcance del ataque activo, contener la amenaza y preservar evidencias para análisis forense.",
    },
    "malware": {
        "nombre": "Malware Analysis",
        "descripcion": "Un proceso sospechoso está activo. Analiza su comportamiento e identifica el malware.",
        "icono": "🦠",
        "skills": ["forense_digital", "inteligencia_amenazas", "deteccion_amenazas"],
        "objetivo_template": "Identificar el malware, sus capacidades, IOCs generados, mecanismo de persistencia y servidor C2.",
    },
    "osint": {
        "nombre": "OSINT & Threat Intel",
        "descripcion": "Te dan un IOC. Construye el perfil completo del actor de amenaza.",
        "icono": "🌐",
        "skills": ["inteligencia_amenazas", "threat_hunting", "siem_queries"],
        "objetivo_template": "Construir el perfil del actor: infraestructura C2, TTPs, campañas anteriores y atribución.",
    },
}

LAB_CONFIG_POR_NIVEL = {
    "Bronce": {
        "dificultad": "L1 — Triage",
        "descripcion": "Ataque directo con señales claras. Ideal para aprender el flujo SOC.",
        "num_alertas": 5, "num_logs": 12, "num_hosts": 3,
        "num_preguntas": 5, "ruido_pct": 0.15,
        "copas_base": 15, "xp_base": 60,
        "amenazas_windows": "brute force RDP/SMB con cientos de intentos fallidos seguido de login exitoso, descarga de malware vía phishing simple, acceso no autorizado con credenciales robadas, persistencia básica en registro Run key",
        "amenazas_linux": "brute force SSH con múltiples intentos fallidos seguido de login exitoso, descarga de payload vía curl/wget, crontab de persistencia, reverse shell bash hacia IP externa",
        "ttps": "T1110 (Brute Force), T1566 (Phishing), T1078 (Valid Accounts), T1547 (Boot Persistence)",
        "pistas_disponibles": True,
        "comandos_extra": [],
    },
    "Plata": {
        "dificultad": "L2 — Analyst",
        "descripcion": "Ataque multi-fase con movimiento lateral. Requiere correlación entre sistemas.",
        "num_alertas": 7, "num_logs": 18, "num_hosts": 5,
        "num_preguntas": 7, "ruido_pct": 0.25,
        "copas_base": 30, "xp_base": 100,
        "amenazas_windows": "spear phishing con macro Office ejecutada, escalada de privilegios local, movimiento lateral con PsExec o WMI, C2 sobre HTTP/S, persistencia en scheduled tasks y registro",
        "amenazas_linux": "phishing con script bash malicioso, escalada sudo o SUID, movimiento lateral con SSH keys robadas, C2 sobre DNS o HTTP, persistencia vía crontab y systemd service",
        "ttps": "T1566.001 (Spear Phishing), T1059 (Scripting), T1021 (Remote Services), T1071 (C2 HTTP), T1547 (Persistence)",
        "pistas_disponibles": False,
        "comandos_extra": ["auditpol", "schtasks", "sc query"],
    },
    "Oro": {
        "dificultad": "L3 — Senior",
        "descripcion": "APT multi-fase con evasión. Requiere threat hunting y análisis forense profundo.",
        "num_alertas": 9, "num_logs": 24, "num_hosts": 7,
        "num_preguntas": 9, "ruido_pct": 0.35,
        "copas_base": 50, "xp_base": 150,
        "amenazas_windows": "APT living-off-the-land con LOLBins, credential dumping de lsass, DNS tunneling C2, exfiltración cifrada, persistencia con scheduled tasks + WMI subscription, anti-forensics básico (clear logs)",
        "amenazas_linux": "APT con LD_PRELOAD rootkit, /proc/mem credential dump, DNS tunneling C2, exfiltración via HTTPS con datos cifrados, persistencia en PAM modules y systemd timers, log tampering",
        "ttps": "T1003 (Credential Dumping), T1071.004 (DNS C2), T1055 (Process Injection), T1070 (Indicator Removal), T1560 (Archive Data)",
        "pistas_disponibles": False,
        "comandos_extra": ["volatility", "strings", "strace", "lsof"],
    },
    "Diamante": {
        "dificultad": "L3+ — APT Expert",
        "descripcion": "Simulación APT completa con evasión activa y ruido deliberado.",
        "num_alertas": 11, "num_logs": 30, "num_hosts": 9,
        "num_preguntas": 11, "ruido_pct": 0.45,
        "copas_base": 80, "xp_base": 220,
        "amenazas_windows": "APT con zero-day o supply chain compromise, Golden Ticket Kerberos, pass-the-hash masivo, exfiltración encubierta en tráfico TLS legítimo, anti-forensics activo con timestomping y USN journal tampering, lateral movement masivo",
        "amenazas_linux": "APT con kernel exploit o supply chain, forged PAC Kerberos en AD-integrated Linux, pass-the-ticket, exfiltración covert en ICMP/DNS, rootkit a nivel kernel con módulo LKM, active defense evasion",
        "ttps": "T1190 (Exploit Public App), T1558 (Kerberos Tickets), T1070 (Indicator Removal), T1036 (Masquerading), T1195 (Supply Chain), T1560 (Archive Data)",
        "pistas_disponibles": False,
        "comandos_extra": ["volatility", "rekall", "yara", "pe-sieve"],
    },
}

# Prompts específicos por tipo de lab y SO
def build_lab_prompt(grupo: str, tipo: str, so: str, cfg: dict, tipo_cfg: dict) -> str:
    amenazas = cfg[f"amenazas_{so.lower()}"]
    
    so_context = ""
    if so == "Windows":
        so_context = """
SISTEMA OPERATIVO: Windows
- Event IDs: 4624=login OK, 4625=login FAIL, 4688=proceso creado, 4698=tarea programada, 7045=servicio instalado, 4776=auth NTLM, 4769=ticket Kerberos, 4663=acceso objeto
- Logs: Windows Security, Windows System, Windows Application, PowerShell/Operational, Sysmon
- Paths: C:\\Windows\\System32\\, C:\\Users\\, C:\\ProgramData\\, C:\\Windows\\Temp\\
- Usuarios: CORP\\jsmith, CORP\\administrator, NT AUTHORITY\\SYSTEM, CORP\\svc_backup
- Hosts: CORP-DC01 (10.0.0.5), WEB-SRV-02 (10.0.0.10), WORKSTATION-JSMITH (10.0.0.45), FILE-SRV-01 (10.0.0.20)
- Procesos sospechosos: powershell.exe -enc, cmd.exe /c, wmic.exe, certutil.exe, regsvr32.exe
- Artefactos forenses: Prefetch, Registry hives, Event Logs (.evtx), LNK files, Amcache
"""
    else:
        so_context = """
SISTEMA OPERATIVO: Linux
- Logs: /var/log/auth.log, /var/log/syslog, /var/log/apache2/access.log, journalctl, /var/log/audit/audit.log
- Paths: /tmp/, /var/tmp/, /home/user/.ssh/, /etc/cron.d/, /lib/systemd/system/
- Usuarios: root, www-data, jsmith, svc_backup, nobody
- Hosts: web-srv-01 (10.0.0.10), db-srv-01 (10.0.0.15), workstation-jsmith (10.0.0.45), bastion-01 (10.0.0.5)
- Comandos sospechosos: curl|bash, wget -O- | sh, nc -e /bin/bash, python3 -c 'import socket...', chmod +s, sudo -l
- Artefactos forenses: bash_history, /proc/[pid]/maps, crontab -l, systemctl list-units, lastlog, wtmp
- Event types (auditd): SYSCALL, EXECVE, PROCTITLE, USER_AUTH, USER_LOGIN
"""

    tipo_prompts = {
        "forense": f"""
TIPO DE LAB: Forense Post-Mortem
El ataque YA OCURRIÓ hace {random.choice(['2 horas', '6 horas', '12 horas', '1 día'])}. 
El analista llega DESPUÉS. Toda la evidencia está en los logs y artefactos.
- Incluye artefactos forenses específicos de {so} en los logs
- Los timestamps deben mostrar el ataque completo ya finalizado
- Añade evidencia de limpieza parcial del atacante (algunos logs borrados o modificados)
- El informe debe reconstruir la cadena completa post-mortem
""",
        "threat_hunt": f"""
TIPO DE LAB: Threat Hunting
El atacante lleva {random.choice(['3 días', '5 días', '1 semana', '2 semanas'])} dentro SIN haber generado alertas críticas.
- NO hay alertas CRÍTICAS, máximo 1-2 ALTAS muy ambiguas
- La mayoría de actividad maliciosa está mezclada con tráfico legítimo (alto ruido)
- Los IOCs son sutiles: conexiones periódicas, comandos que parecen legítimos, pequeñas anomalías
- El analista debe BUSCAR la amenaza, no responder a una alerta
- Incluye 40% de actividad legítima para añadir ruido real
""",
        "incident_response": f"""
TIPO DE LAB: Incident Response activo
El ataque ESTÁ OCURRIENDO en este momento. Hay urgencia.
- Los timestamps son recientes (últimos 30 minutos)
- El ataque está en progreso: algunas fases completadas, otras en curso
- Incluye alertas de propagación activa entre hosts
- El analista debe tomar decisiones de contención mientras el ataque continúa
- Añade evidencia de daño ya causado (archivos cifrados, datos exfiltrados, etc.)
""",
        "malware": f"""
TIPO DE LAB: Malware Analysis
Un ejecutable/script sospechoso fue detectado en {random.choice(['WORKSTATION-JSMITH', 'WEB-SRV-02', 'workstation-jsmith', 'web-srv-01'])}.
- Incluye detalles técnicos del malware: hash SHA256, strings extraídas, imports PE o syscalls
- Añade comportamiento observable: conexiones C2, archivos creados, registry keys, procesos hijo
- Incluye análisis estático en logs (strings, PE headers) Y dinámico (comportamiento en sandbox)
- IOCs específicos del malware: hashes, dominios C2, mutexes, rutas de persistencia
- El malware debe tener un nombre realista y técnicas de evasión según nivel
""",
        "osint": f"""
TIPO DE LAB: OSINT & Threat Intelligence
Un IOC fue detectado en la red: una IP externa {random.choice(['185.220.101.47', '94.102.49.190', '45.33.32.156', '91.108.4.55'])}.
- Los logs muestran comunicación con esta IP
- El analista debe construir el perfil completo: WHOIS, passive DNS, historial de abusos, malware asociado
- Incluye respuestas de herramientas OSINT en los logs (simuladas): VirusTotal, AbuseIPDB, Shodan, Censys
- Conecta la IP con una campaña conocida o actor de amenaza (inventado pero realista)
- Incluye otros IOCs relacionados: dominios, hashes, ASN, certificados TLS
""",
    }

    return f"""Eres un experto en ciberseguridad ofensiva y defensiva creando un laboratorio SOC profesional nivel {grupo}.
Estilo: Blue Team Labs Online / TryHackMe SOC Level 1 / HackTheBox Pro Labs.

{so_context}

NIVEL: {grupo} ({cfg['dificultad']})
TIPO: {tipo_cfg['nombre']}
AMENAZAS: {amenazas}
TTPs MITRE ATT&CK: {cfg['ttps']}
OBJETIVO: {tipo_cfg['objetivo_template']}

{tipo_prompts.get(tipo, tipo_prompts['forense'])}

═══ REGLAS DE COHERENCIA CRÍTICAS ═══
1. IPs internas SOLO 10.0.0.x — IPs externas rangos públicos reales (185.220.x.x, 45.33.x.x, 94.102.x.x)
2. Los mismos IOCs (IP, hash, proceso, usuario) deben aparecer en alertas + logs + red para correlación
3. Timestamps en PROGRESIÓN LÓGICA que muestre la cadena del ataque
4. {round(cfg['ruido_pct']*100)}% de logs deben ser ruido legítimo marcados "relevante": false
5. Event IDs, paths y sintaxis de logs deben ser 100% realistas para {so}
6. Cada pregunta debe tener respuesta exacta extraíble de los datos del escenario
7. El escenario debe tener un nombre de empresa ficticio creíble (ej: "TechCorp Industries", "GlobalBank SA")

Devuelve ÚNICAMENTE JSON válido con esta estructura exacta:

{{
  "titulo": "Operación [NombreCreativo] — [empresa ficticia]",
  "tipo_lab": "{tipo}",
  "sistema_operativo": "{so}",
  "descripcion": "Contexto narrativo 2-3 frases técnicas con nombre de empresa, sector y detalles del ataque.",
  "objetivo": "{tipo_cfg['objetivo_template']}",
  "nivel": "{grupo}",
  "dificultad": "{cfg['dificultad']}",
  "empresa": {{
    "nombre": "nombre empresa ficticia",
    "sector": "sector (bancario/salud/retail/etc)",
    "empleados": número,
    "infraestructura": "descripción breve"
  }},
  "alertas_siem": [
    {{
      "id": "ALT-001",
      "timestamp": "2024-03-15 02:14:33",
      "severidad": "CRITICA",
      "categoria": "Credential Access",
      "sistema": "hostname",
      "titulo": "Título técnico de la alerta",
      "descripcion": "Descripción técnica detallada con IOCs.",
      "ip_origen": "x.x.x.x",
      "ip_destino": "x.x.x.x",
      "usuario": "dominio\\\\usuario",
      "proceso": "proceso.exe",
      "regla_disparada": "SIGMA: nombre_regla"
    }}
  ],
  "logs": [
    {{
      "id": "LOG-001",
      "timestamp": "2024-03-15 02:13:55",
      "fuente": "fuente del log",
      "sistema": "hostname",
      "nivel": "WARNING",
      "event_id": "4625",
      "mensaje": "Mensaje completo y realista del log con todos los campos del SO.",
      "relevante": true
    }}
  ],
  "red": {{
    "hosts": [
      {{
        "id": "host-1",
        "nombre": "hostname",
        "ip": "10.0.0.x",
        "tipo": "tipo de servidor",
        "os": "OS específico con versión",
        "estado": "comprometido|sospechoso|limpio",
        "servicios": ["servicio:puerto"],
        "notas": "qué ocurrió en este host"
      }}
    ],
    "conexiones": [
      {{
        "origen": "host-id",
        "destino": "host-id",
        "puerto": 445,
        "protocolo": "SMB",
        "estado": "maliciosa|sospechosa|legitima",
        "bytes": 48320,
        "timestamp": "2024-03-15 02:18:00",
        "descripcion": "descripción técnica"
      }}
    ]
  }},
  "iocs": {{
    "ips_maliciosas": ["x.x.x.x"],
    "hashes_maliciosos": ["sha256:a3f9...realista_64chars"],
    "dominios_maliciosos": ["dominio.tld"],
    "procesos_sospechosos": ["proceso.exe o script.sh"],
    "usuarios_comprometidos": ["dominio\\\\usuario o linuxuser"],
    "regkeys_persistencia": ["ruta\\\\completa\\\\registro o /etc/cron.d/malicious"]
  }},
  "artefactos_forenses": [
    {{
      "tipo": "prefetch|registry|evtx|bash_history|crontab|memory_dump",
      "nombre": "nombre del artefacto",
      "contenido": "contenido simulado realista",
      "relevancia": "por qué es importante para la investigación"
    }}
  ],
  "preguntas": [
    {{
      "id": 1,
      "categoria": "Reconocimiento inicial",
      "pregunta": "Pregunta técnica específica con respuesta exacta extraíble del escenario",
      "placeholder": "Ej: formato esperado",
      "tipo": "ip|hash|proceso|tecnica_mitre|usuario|hostname|puerto|timestamp",
      "respuesta_correcta": "respuesta exacta",
      "pista": "Pista específica indicando dónde buscar"
    }}
  ],
  "solucion": {{
    "resumen": "Explicación técnica completa del ataque. 4-5 frases.",
    "cadena_ataque": ["[HH:MM] Paso 1 detallado", "[HH:MM] Paso 2 detallado"],
    "tecnicas_mitre": ["T1XXX - Nombre Técnica"],
    "respuestas_correctas_explicadas": [{{"id": 1, "respuesta": "valor", "ubicacion": "dónde encontrarlo", "explicacion": "por qué es correcto"}}],
    "lecciones": "Qué mejorar en detección y respuesta."
  }}
}}

Genera exactamente {cfg['num_alertas']} alertas, {cfg['num_logs']} logs, {cfg['num_hosts']} hosts y {cfg['num_preguntas']} preguntas.
Las preguntas deben cubrir: IP atacante, técnica MITRE principal, credencial/usuario comprometido, herramienta/proceso malicioso, host afectado, y preguntas específicas del tipo {tipo}."""


@router.post("/lab/generar")
async def generar_lab(
    request_data: dict = None,
    email: str = Depends(get_current_user)
):
    db   = get_db()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    arena = user.get("arena", "Bronce 3")
    grupo = get_grupo_arena(arena)
    cfg   = LAB_CONFIG_POR_NIVEL.get(grupo, LAB_CONFIG_POR_NIVEL["Bronce"])

    # Tipo y SO — aleatorio si no se especifica
    datos = request_data or {}
    tipo  = datos.get("tipo", random.choice(list(LAB_TIPOS.keys())))
    so    = datos.get("so", random.choice(["Windows", "Linux"]))
    modo  = datos.get("modo", "investigacion")  # investigacion | certificacion | arena

    tipo_cfg = LAB_TIPOS.get(tipo, LAB_TIPOS["forense"])
    prompt   = build_lab_prompt(grupo, tipo, so, cfg, tipo_cfg)

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=8000,
            response_format={"type": "json_object"}
        )
        escenario = json.loads(response.choices[0].message.content)

        # Asegurar campos de metadatos
        escenario["tipo_lab"]          = tipo
        escenario["sistema_operativo"] = so
        escenario["nivel"]             = grupo
        escenario["dificultad"]        = cfg["dificultad"]

        lab_doc = {
            "email_usuario": email,
            "arena":  arena,
            "grupo":  grupo,
            "tipo":   tipo,
            "so":     so,
            "modo":   modo,
            "escenario": escenario,
            "estado": "activo",
            "inicio": time.time(),
            "respuestas": {},
        }
        result = await db.labs.insert_one(lab_doc)
        lab_id = str(result.inserted_id)

        # Devolver sin solución ni respuestas correctas
        escenario_publico = json.loads(json.dumps(escenario))
        escenario_publico.pop("solucion", None)
        for p in escenario_publico.get("preguntas", []):
            p.pop("respuesta_correcta", None)
        escenario_publico["lab_id"] = lab_id
        escenario_publico["modo"]   = modo
        escenario_publico["copas_base"] = cfg["copas_base"]
        escenario_publico["xp_base"]    = cfg["xp_base"]

        return escenario_publico

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Error parseando respuesta IA: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando laboratorio: {str(e)}")


@router.post("/lab/evaluar")
async def evaluar_lab(payload: dict, email: str = Depends(get_current_user)):
    from bson import ObjectId
    db = get_db()

    lab_id         = payload.get("lab_id")
    respuestas     = payload.get("respuestas", {})
    informe_libre  = payload.get("informe_libre", "")
    queries_usadas = payload.get("queries_usadas", [])
    modo           = payload.get("modo", "investigacion")

    if not lab_id:
        raise HTTPException(status_code=400, detail="lab_id requerido")
    lab = await db.labs.find_one({"_id": ObjectId(lab_id), "email_usuario": email})
    if not lab:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    escenario = lab["escenario"]
    grupo     = lab["grupo"]
    tipo      = lab.get("tipo", "forense")
    cfg       = LAB_CONFIG_POR_NIVEL.get(grupo, LAB_CONFIG_POR_NIVEL["Bronce"])

    preguntas_eval = []
    for p in escenario.get("preguntas", []):
        pid = str(p["id"])
        preguntas_eval.append({
            "id":                p["id"],
            "categoria":         p["categoria"],
            "pregunta":          p["pregunta"],
            "tipo":              p.get("tipo", "texto"),
            "respuesta_correcta": p.get("respuesta_correcta", ""),
            "respuesta_usuario": respuestas.get(pid, respuestas.get(p["id"], "")),
        })

    cmds_terminal = [q for q in queries_usadas if q.startswith("CMD:")]
    busquedas     = [q for q in queries_usadas if q.startswith("SEARCH:")]
    herramientas  = [q for q in queries_usadas if q.startswith("OPEN:")]

    tiempo_usado  = payload.get("tiempo_usado", 0)
    copas_base    = cfg["copas_base"]
    xp_base       = cfg["xp_base"]

    prompt_eval = f"""Eres un evaluador experto SOC. Evalúa las respuestas de este analista.

ESCENARIO: {escenario.get('titulo', '')} | NIVEL: {grupo} | TIPO: {tipo}
{escenario.get('descripcion', '')}

PREGUNTAS Y RESPUESTAS:
{json.dumps(preguntas_eval, ensure_ascii=False, indent=2)}

INFORME LIBRE DEL ANALISTA: "{informe_libre}"

ACTIVIDAD DEL ANALISTA:
- Total interacciones: {len(queries_usadas)}
- Comandos terminal ejecutados: {len(cmds_terminal)}
- Búsquedas en logs: {len(busquedas)}
- Herramientas abiertas: {len(herramientas)}
- Tiempo empleado: {tiempo_usado} segundos

CRITERIOS DE PUNTUACIÓN (0-10 por pregunta):
- Respuesta exacta o keyword principal correcta: 10 pts
- Mismo concepto, formato diferente (ej: IP con/sin espacios): 9 pts
- Concepto correcto, valor ligeramente distinto: 7-8 pts
- Parcialmente correcta (mitad del valor): 4-6 pts
- Incorrecta pero con razonamiento: 1-3 pts
- Sin respuesta o completamente errónea: 0 pts

BONUS POINTS:
- Informe detallado (>100 palabras con técnica MITRE): +10 pts
- 5+ comandos terminal usados: +3 pts
- 10+ interacciones totales: +5 pts
- 15+ interacciones totales: +8 pts (no acumulable con anterior)

SKILLS A EVALUAR (delta 0.0-0.3, malo true si el analista claramente no sabe):
{json.dumps([s for s in LAB_TIPOS.get(tipo, LAB_TIPOS['forense'])['skills']], ensure_ascii=False)}

Devuelve ÚNICAMENTE JSON válido:
{{
  "puntuacion_preguntas": <número>,
  "puntuacion_informe": <0-10>,
  "puntuacion_queries": <0-8>,
  "puntuacion_total": <suma>,
  "puntuacion_normalizada": <0-100>,
  "feedback_preguntas": [
    {{
      "id": 1,
      "puntos": 0,
      "correcto": false,
      "respuesta_correcta": "valor exacto",
      "respuesta_usuario": "lo que escribió",
      "feedback": "explicación de por qué es correcto/incorrecto"
    }}
  ],
  "feedback_general": "3-4 frases valorando la calidad del análisis, qué hizo bien y qué mejorar",
  "cadena_ataque_descubierta": <0-100>,
  "skills_mejoradas": {{
    "forense_digital":        {{"delta": 0.0, "malo": false}},
    "analisis_logs":          {{"delta": 0.0, "malo": false}},
    "threat_hunting":         {{"delta": 0.0, "malo": false}},
    "inteligencia_amenazas":  {{"delta": 0.0, "malo": false}},
    "respuesta_incidentes":   {{"delta": 0.0, "malo": false}},
    "deteccion_amenazas":     {{"delta": 0.0, "malo": false}},
    "siem_queries":           {{"delta": 0.0, "malo": false}}
  }},
  "solucion_completa": {{
    "resumen": "explicación completa del ataque",
    "cadena_ataque": ["[HH:MM] paso 1", "[HH:MM] paso 2"],
    "tecnicas_mitre": ["T1XXX - Nombre"],
    "lecciones": "qué mejorar en detección y respuesta"
  }}
}}"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt_eval}],
            temperature=0.2,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        resultado  = json.loads(response.choices[0].message.content)
        puntuacion = max(0, min(100, resultado.get("puntuacion_normalizada", 0)))

        # Calcular XP y copas según modo y puntuación
        xp_ganada    = round(xp_base * (puntuacion / 100))
        copas_ganadas = 0
        if modo == "arena":
            copas_ganadas = round(copas_base * (puntuacion / 100))
        elif modo == "certificacion":
            copas_ganadas = round(copas_base * 0.5 * (puntuacion / 100))
        # modo investigacion: sin copas

        # Aplicar skills y actualizar usuario
        skills_mejora     = resultado.get("skills_mejoradas", {})
        user              = await db.users.find_one({"email": email})
        skills_actuales   = user.get("skills", {s: 0.0 for s in SKILLS_LIST})
        skills_streak_bad = user.get("skills_streak_bad", skills_streak_inicial())
        skills_nuevas, nuevo_streak = aplicar_skills(
            skills_actuales, skills_mejora, skills_streak_bad, lab["arena"]
        )
        nueva_xp    = user["xp"] + xp_ganada
        nuevas_copas = max(0, user.get("copas", 0) + copas_ganadas)
        tier        = calcular_tier(nueva_xp)
        arena_nueva = get_arena_por_copas(nuevas_copas)

        update_fields = {
            "xp":                nueva_xp,
            "tier":              tier,
            "skills":            skills_nuevas,
            "skills_streak_bad": nuevo_streak,
        }
        if copas_ganadas > 0:
            update_fields["copas"] = nuevas_copas
            update_fields["arena"] = arena_nueva

        await db.users.update_one({"email": email}, {"$set": update_fields})
        await db.labs.update_one(
            {"_id": ObjectId(lab_id)},
            {"$set": {
                "estado":    "completado",
                "resultado": resultado,
                "fin":       time.time(),
                "respuestas": respuestas,
            }}
        )

        resultado["xp_ganada"]      = xp_ganada
        resultado["copas_ganadas"]  = copas_ganadas
        resultado["skills_nuevas"]  = skills_nuevas
        resultado["tier"]           = tier
        resultado["arena"]          = arena_nueva if copas_ganadas > 0 else lab["arena"]
        resultado["modo"]           = modo
        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluando laboratorio: {str(e)}")


# ── AVATAR ────────────────────────────────────────────────────────────────────
import requests as req_sync
from fastapi.responses import Response as FastAPIResponse

@router.get("/avatar/proxy")
async def avatar_proxy(
    top: str = "shortHairShortFlat",
    hairColor: str = "2c1b18",
    accessories: str = "blank",
    facialHair: str = "blank",
    facialHairColor: str = "2c1b18",
    clothing: str = "hoodie",
    clothingColor: str = "262e33",
    skin: str = "light",
    eyes: str = "default",
    eyebrows: str = "default",
    mouth: str = "default",
    size: int = 200,
):
    seed = f"{top}-{hairColor}-{clothing}-{skin}-{eyes}-{mouth}-{accessories}-{facialHair}-{eyebrows}-{clothingColor}-{facialHairColor}"

    params = {
        "seed":            seed,
        "top":             top,
        "hairColor":       hairColor,
        "clothing":        clothing,
        "clothingColor":   clothingColor,
        "skin":            skin,
        "eyes":            eyes,
        "eyebrows":        eyebrows,
        "mouth":           mouth,
        "backgroundColor": "b6e3f4",
        "size":            str(size),
    }
    if accessories != "blank":
        params["accessories"] = accessories
    if facialHair != "blank":
        params["facialHair"]      = facialHair
        params["facialHairColor"] = facialHairColor

    url = "https://api.dicebear.com/9.x/avataaars/svg"
    print(f"[avatar_proxy] GET {url} params={params}")

    try:
        r = req_sync.get(url, params=params, timeout=15)
        print(f"[avatar_proxy] status={r.status_code} len={len(r.content)}")
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"DiceBear returned {r.status_code}: {r.text[:200]}")
        return FastAPIResponse(
            content=r.content,
            media_type="image/svg+xml",
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[avatar_proxy] ERROR: {e}")
        raise HTTPException(status_code=502, detail=f"Error obteniendo avatar: {str(e)}")


@router.post("/me/avatar")
async def update_avatar(datos: dict, email: str = Depends(get_current_user)):
    """Guarda la configuración del avatar DiceBear del usuario."""
    db = get_db()
    avatar_config = datos.get("avatar_config")
    if not avatar_config or not isinstance(avatar_config, dict):
        raise HTTPException(status_code=400, detail="avatar_config requerido")
    campos_validos = {
        "top", "hairColor", "accessories", "facialHair",
        "facialHairColor", "clothe", "clotheColor", "skin",
        "eyes", "eyebrow", "mouth"
    }
    config_limpia = {k: str(v) for k, v in avatar_config.items() if k in campos_validos}
    await db.users.update_one({"email": email}, {"$set": {"avatar_config": config_limpia}})
    return {"ok": True, "avatar_config": config_limpia}