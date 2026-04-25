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
    if not db_user.get("email_verificado", False):
        raise HTTPException(status_code=403, detail="Debes verificar tu email antes de iniciar sesión")

    updates = {}
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


# ── PERFIL PÚBLICO ────────────────────────────────────────────────────────────
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


# ── CERTIFICADO PÚBLICO ───────────────────────────────────────────────────────
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
LAB_CONFIG_POR_NIVEL = {
    "Bronce": {
        "dificultad": "básica",
        "descripcion": "Ataque directo con pocos pasos. Ideal para aprender el flujo de investigación SOC.",
        "num_alertas": 5, "num_logs": 12, "num_hosts": 3,
        "amenazas": "brute force SSH/RDP (cientos de intentos fallidos seguido de login exitoso), descarga de malware vía phishing, acceso no autorizado con credenciales robadas, posible persistencia básica",
        "ttps": "T1110 (Brute Force), T1566 (Phishing), T1078 (Valid Accounts), T1547 (Boot Persistence básica)",
        "num_preguntas": 5,
    },
    "Plata": {
        "dificultad": "intermedia",
        "descripcion": "Ataque multi-fase con movimiento lateral. Requiere correlación de eventos entre sistemas.",
        "num_alertas": 7, "num_logs": 18, "num_hosts": 5,
        "amenazas": "spear phishing con payload ejecutado, escalada de privilegios local, movimiento lateral con PsExec o WMI, C2 básico sobre HTTP, persistencia en registro",
        "ttps": "T1566.001 (Spear Phishing), T1059 (Command Scripting), T1021 (Remote Services), T1071 (C2 over HTTP), T1547.001 (Registry Run Keys)",
        "num_preguntas": 7,
    },
    "Oro": {
        "dificultad": "avanzada",
        "descripcion": "APT multi-fase con técnicas de evasión. Requiere threat hunting proactivo y análisis forense.",
        "num_alertas": 9, "num_logs": 24, "num_hosts": 7,
        "amenazas": "APT con living-off-the-land, credential dumping (mimikatz/lsass), DNS tunneling C2, exfiltración cifrada, persistencia avanzada (scheduled tasks + service), anti-forensics básico",
        "ttps": "T1003 (Credential Dumping), T1071.004 (DNS C2), T1055 (Process Injection), T1547 (Boot Persistence), T1070 (Indicator Removal básico)",
        "num_preguntas": 9,
    },
    "Diamante": {
        "dificultad": "experta",
        "descripcion": "Simulación APT completa. El atacante usa técnicas de evasión activa y genera ruido deliberado.",
        "num_alertas": 11, "num_logs": 30, "num_hosts": 9,
        "amenazas": "APT avanzado con zero-day exploit o supply chain, exfiltración encubierta en tráfico cifrado, anti-forensics activo, lateral movement masivo con pass-the-hash, golden ticket Kerberos",
        "ttps": "T1190 (Exploit Public App), T1195 (Supply Chain), T1070 (Indicator Removal), T1036 (Masquerading), T1558 (Steal/Forge Kerberos Tickets), T1560 (Archive Data)",
        "num_preguntas": 11,
    },
}


@router.post("/lab/generar")
async def generar_lab(email: str = Depends(get_current_user)):
    db   = get_db()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    arena = user.get("arena", "Bronce 3")
    grupo = get_grupo_arena(arena)
    cfg   = LAB_CONFIG_POR_NIVEL.get(grupo, LAB_CONFIG_POR_NIVEL["Bronce"])

    prompt = f"""Eres un experto en ciberseguridad ofensiva y defensiva creando un laboratorio SOC profesional estilo Blue Team Labs Online / TryHackMe SOC Level 1.

NIVEL: {grupo} ({cfg['dificultad']})
DESCRIPCIÓN: {cfg['descripcion']}
AMENAZAS A SIMULAR: {cfg['amenazas']}
TTPs MITRE ATT&CK: {cfg['ttps']}

═══ REQUISITOS CRÍTICOS DE COHERENCIA ═══
1. Todos los datos (IPs, hostnames, usuarios, hashes, procesos, timestamps) DEBEN ser coherentes entre sí a lo largo de todo el escenario
2. Los mismos IOCs deben aparecer en MÚLTIPLES fuentes (alerta + log + red) para que el analista pueda correlacionar
3. IPs internas: SOLO rango 10.0.0.x (ej: 10.0.0.5, 10.0.0.10, 10.0.0.50)
4. IPs externas: rangos públicos reales como 185.220.x.x, 45.33.x.x, 94.102.x.x (NUNCA 192.168.x.x ni 10.x.x.x)
5. Hostnames realistas: CORP-DC01, WEB-SRV-02, WORKSTATION-JSMITH, LAPTOP-MGARCIA, FILE-SRV-01
6. Usuarios de dominio: CORP\\jsmith, CORP\\svc_backup, NT AUTHORITY\\SYSTEM, CORP\\administrator
7. Timestamps en PROGRESIÓN LÓGICA mostrando la cadena del ataque
8. Incluir 2-3 logs/alertas de RUIDO (actividad legítima) marcados con "relevante": false
9. Event IDs reales: 4625=login fallido, 4624=login exitoso, 4688=proceso creado, 4648=logon explicit, 7045=nuevo servicio

Devuelve ÚNICAMENTE JSON válido:

{{
  "titulo": "Operación [NombreCreativo] — descripción corta",
  "descripcion": "Contexto narrativo 2-3 frases con detalles técnicos.",
  "objetivo": "El analista debe reconstruir: [cadena completa del ataque]",
  "nivel": "{grupo}",
  "alertas_siem": [
    {{
      "id": "ALT-001",
      "timestamp": "2024-03-15 02:14:33",
      "severidad": "CRITICA",
      "categoria": "Credential Access",
      "sistema": "CORP-DC01",
      "titulo": "Multiple Failed Logon Attempts - Possible Brute Force",
      "descripcion": "Descripción técnica detallada.",
      "ip_origen": "185.220.101.47",
      "ip_destino": "10.0.0.5",
      "usuario": "CORP\\\\administrator",
      "proceso": "lsass.exe",
      "regla_disparada": "SIGMA: Multiple Failed Authentications From Single Source"
    }}
  ],
  "logs": [
    {{
      "id": "LOG-001",
      "timestamp": "2024-03-15 02:13:55",
      "fuente": "Windows Security",
      "sistema": "CORP-DC01",
      "nivel": "WARNING",
      "event_id": "4625",
      "mensaje": "Mensaje completo del log en formato realista.",
      "relevante": true
    }}
  ],
  "red": {{
    "hosts": [
      {{
        "id": "host-1",
        "nombre": "CORP-DC01",
        "ip": "10.0.0.5",
        "tipo": "Domain Controller",
        "os": "Windows Server 2019",
        "estado": "comprometido",
        "servicios": ["LDAP:389", "DNS:53", "Kerberos:88", "SMB:445"],
        "notas": "Descripción de qué ocurrió en este host."
      }}
    ],
    "conexiones": [
      {{
        "origen": "host-1",
        "destino": "host-2",
        "puerto": 445,
        "protocolo": "SMB",
        "estado": "maliciosa",
        "bytes": 48320,
        "timestamp": "2024-03-15 02:18:00",
        "descripcion": "Descripción de la conexión."
      }}
    ]
  }},
  "iocs": {{
    "ips_maliciosas": ["185.220.101.47"],
    "hashes_maliciosos": ["sha256:a3f9..."],
    "dominios_maliciosos": ["evil-c2.example.com"],
    "procesos_sospechosos": ["mimikatz.exe"],
    "usuarios_comprometidos": ["CORP\\\\jsmith"],
    "regkeys_persistencia": ["HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run\\\\WindowsUpdate"]
  }},
  "preguntas": [
    {{
      "id": 1,
      "categoria": "Reconocimiento inicial",
      "pregunta": "¿Cuál es la dirección IP externa desde la que se originó el ataque?",
      "placeholder": "Ej: 185.220.101.47",
      "tipo": "texto_corto",
      "respuesta_correcta": "185.220.101.47",
      "pista": "Filtra las alertas de autenticación fallida y busca la IP origen."
    }}
  ],
  "solucion": {{
    "resumen": "Explicación técnica completa. 4-5 frases.",
    "cadena_ataque": ["1. [timestamp] paso 1", "2. [timestamp] paso 2"],
    "tecnicas_mitre": ["T1110 - Brute Force"],
    "respuestas_correctas_explicadas": [{{"id": 1, "respuesta": "185.220.101.47", "explicacion": "Visible en ALT-001"}}],
    "lecciones": "Cómo mejorar la detección."
  }}
}}

Genera exactamente {cfg['num_alertas']} alertas SIEM, {cfg['num_logs']} logs, {cfg['num_hosts']} hosts y {cfg['num_preguntas']} preguntas.
Preguntas en orden: IP ataque, técnica MITRE, credencial comprometida, herramienta maliciosa, host afectado, y más según nivel."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.75,
            max_tokens=7000,
            response_format={"type": "json_object"}
        )
        escenario = json.loads(response.choices[0].message.content)

        lab_doc = {
            "email_usuario": email,
            "arena":         arena,
            "grupo":         grupo,
            "escenario":     escenario,
            "estado":        "activo",
            "inicio":        time.time(),
            "respuestas":    {},
        }
        result = await db.labs.insert_one(lab_doc)
        lab_id = str(result.inserted_id)

        escenario_publico = json.loads(json.dumps(escenario))
        escenario_publico.pop("solucion", None)
        for p in escenario_publico.get("preguntas", []):
            p.pop("respuesta_correcta", None)

        escenario_publico["lab_id"] = lab_id
        return escenario_publico

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Error parseando respuesta de la IA: {str(e)}")
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

    if not lab_id:
        raise HTTPException(status_code=400, detail="lab_id requerido")

    lab = await db.labs.find_one({"_id": ObjectId(lab_id), "email_usuario": email})
    if not lab:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    escenario = lab["escenario"]
    grupo     = lab["grupo"]

    preguntas_eval = []
    for p in escenario.get("preguntas", []):
        pid = str(p["id"])
        preguntas_eval.append({
            "id":                 p["id"],
            "categoria":          p["categoria"],
            "pregunta":           p["pregunta"],
            "respuesta_correcta": p.get("respuesta_correcta", ""),
            "respuesta_usuario":  respuestas.get(pid, respuestas.get(p["id"], "")),
        })

    cmds_terminal = [q for q in queries_usadas if q.startswith("CMD:")]
    apps_abiertas = [q for q in queries_usadas if q.startswith("OPEN:")]
    busquedas     = [q for q in queries_usadas if q.startswith("SEARCH:")]

    prompt_eval = f"""Eres un evaluador experto SOC. Evalúa las respuestas de este analista en un laboratorio de nivel {grupo}.

ESCENARIO: {escenario.get('titulo', '')}
{escenario.get('descripcion', '')}

PREGUNTAS CON RESPUESTAS CORRECTAS Y RESPUESTAS DEL ANALISTA:
{json.dumps(preguntas_eval, ensure_ascii=False, indent=2)}

INFORME LIBRE: "{informe_libre}"

ACTIVIDAD: {len(queries_usadas)} interacciones totales, {len(cmds_terminal)} comandos terminal, {len(busquedas)} búsquedas logs.

CRITERIOS (0-10 por pregunta):
- Exacta o keyword correcta: 10 pts
- Mismo concepto diferente formato: 7-8 pts
- Parcialmente correcta: 4-6 pts
- Incorrecta con razonamiento: 1-3 pts
- Sin respuesta: 0 pts

BONUS: informe detallado +10, 5+ comandos +3, 10+ interacciones +5, 15+ interacciones +8.

SKILLS (delta 0.0-0.3, malo true/false):
- siem_queries, forense_digital, threat_hunting, analisis_logs, inteligencia_amenazas

Devuelve ÚNICAMENTE JSON:
{{
  "puntuacion_preguntas": <suma>,
  "puntuacion_informe": <0-10>,
  "puntuacion_queries": <0-8>,
  "puntuacion_total": <suma>,
  "puntuacion_normalizada": <0-100>,
  "feedback_preguntas": [{{"id":1,"puntos":0,"correcto":false,"respuesta_correcta":"...","feedback":"..."}}],
  "feedback_general": "3-4 frases valoración global",
  "cadena_ataque_descubierta": <0-100>,
  "skills_mejoradas": {{
    "siem_queries": {{"delta":0.0,"malo":false}},
    "forense_digital": {{"delta":0.0,"malo":false}},
    "threat_hunting": {{"delta":0.0,"malo":false}},
    "analisis_logs": {{"delta":0.0,"malo":false}},
    "inteligencia_amenazas": {{"delta":0.0,"malo":false}}
  }},
  "solucion_completa": {{
    "resumen": "...",
    "cadena_ataque": ["1. paso", "2. paso"],
    "tecnicas_mitre": ["T1xxx - Nombre"],
    "lecciones": "..."
  }}
}}"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt_eval}],
            temperature=0.2,
            max_tokens=2800,
            response_format={"type": "json_object"}
        )
        resultado = json.loads(response.choices[0].message.content)

        puntuacion = max(0, min(100, resultado.get("puntuacion_normalizada", 0)))
        xp_ganada  = round(50 + puntuacion)

        skills_mejora     = resultado.get("skills_mejoradas", {})
        user              = await db.users.find_one({"email": email})
        skills_actuales   = user.get("skills", {s: 0.0 for s in SKILLS_LIST})
        skills_streak_bad = user.get("skills_streak_bad", skills_streak_inicial())
        skills_nuevas, nuevo_streak = aplicar_skills(
            skills_actuales, skills_mejora, skills_streak_bad, lab["arena"]
        )

        nueva_xp = user["xp"] + xp_ganada
        tier     = calcular_tier(nueva_xp)

        await db.users.update_one({"email": email}, {"$set": {
            "xp":                nueva_xp,
            "tier":              tier,
            "skills":            skills_nuevas,
            "skills_streak_bad": nuevo_streak,
        }})

        await db.labs.update_one(
            {"_id": ObjectId(lab_id)},
            {"$set": {
                "estado":     "completado",
                "resultado":  resultado,
                "fin":        time.time(),
                "respuestas": respuestas,
            }}
        )

        resultado["xp_ganada"]     = xp_ganada
        resultado["skills_nuevas"] = skills_nuevas
        resultado["tier"]          = tier

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluando laboratorio: {str(e)}")


@router.get("/lab/activo")
async def get_lab_activo(email: str = Depends(get_current_user)):
    db  = get_db()
    lab = await db.labs.find_one(
        {"email_usuario": email, "estado": "activo"},
        sort=[("inicio", -1)]
    )
    if not lab:
        return {"lab_activo": False}

    escenario = lab.get("escenario", {})
    escenario_publico = json.loads(json.dumps(escenario))
    escenario_publico.pop("solucion", None)
    for p in escenario_publico.get("preguntas", []):
        p.pop("respuesta_correcta", None)

    escenario_publico["lab_id"] = str(lab["_id"])
    escenario_publico["inicio"] = lab.get("inicio")
    return {"lab_activo": True, "escenario": escenario_publico}


@router.get("/lab/historial")
async def historial_labs(email: str = Depends(get_current_user)):
    db   = get_db()
    labs = await db.labs.find(
        {"email_usuario": email, "estado": "completado"},
        {"escenario.logs": 0, "escenario.solucion": 0}
    ).sort("fin", -1).limit(10).to_list(10)
    for lab in labs:
        lab["_id"] = str(lab["_id"])
    return labs


# ── AVATAR ────────────────────────────────────────────────────────────────────
import httpx
from fastapi.responses import Response as FastAPIResponse

@router.get("/avatar/proxy")
async def avatar_proxy(
    top: str = "shortHairShortFlat",
    hairColor: str = "2c1b18",
    accessories: str = "blank",
    facialHair: str = "blank",
    facialHairColor: str = "2c1b18",
    clothe: str = "hoodie",
    clotheColor: str = "262e33",
    skin: str = "light",
    eyes: str = "default",
    eyebrow: str = "default",
    mouth: str = "default",
    size: int = 200,
):
    """
    Proxy para DiceBear — usa solo el seed para evitar el error 400.
    El seed es determinista: misma combinación = mismo avatar siempre.
    """
    seed = f"{top}-{hairColor}-{clothe}-{skin}-{eyes}-{mouth}-{accessories}-{facialHair}-{eyebrow}-{clotheColor}-{facialHairColor}"
    url  = f"https://api.dicebear.com/7.x/avataaars/svg?seed={seed}&size={size}&backgroundColor=b6e3f4"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(url)
            r.raise_for_status()
            return FastAPIResponse(
                content=r.content,
                media_type="image/svg+xml",
                headers={"Cache-Control": "public, max-age=86400"},
            )
    except Exception as e:
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

    await db.users.update_one(
        {"email": email},
        {"$set": {"avatar_config": config_limpia}}
    )
    return {"ok": True, "avatar_config": config_limpia}