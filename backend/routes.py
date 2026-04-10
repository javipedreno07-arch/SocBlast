from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from database import get_db
from models import UserRegister, UserLogin, Token
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import datetime
import time
import os
import secrets

router = APIRouter()

# ── OAUTH GOOGLE ──
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
    redirect_uri = "http://127.0.0.1:8000/api/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google/callback")
async def google_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        email = user_info['email']
        nombre = user_info.get('name', email.split('@')[0])
        db = get_db()
        existing = await db.users.find_one({"email": email})
        if not existing:
            await db.users.insert_one({
                "email": email,
                "password": "",
                "nombre": nombre,
                "rol": "analista",
                "copas": 0, "xp": 0, "tier": 1, "arena": "Bronce",
                "skills": {
                    "analisis_logs": 0,
                    "deteccion_amenazas": 0,
                    "respuesta_incidentes": 0,
                    "threat_hunting": 0,
                    "forense_digital": 0,
                    "gestion_vulnerabilidades": 0,
                    "inteligencia_amenazas": 0
                },
                "sesiones_completadas": 0,
                "training_progreso": {},
                "fecha_registro": datetime.now().isoformat(),
                "oauth_provider": "google",
                "email_verificado": True  # Google ya verifica el email
            })
            rol = "analista"
        else:
            rol = existing.get("rol", "analista")
        access_token = create_access_token({"sub": email, "rol": rol})
        return RedirectResponse(
            url=f"http://localhost:3000/oauth/callback?token={access_token}&rol={rol}&nombre={nombre}"
        )
    except Exception as e:
        print(f"Error Google OAuth: {e}")
        return RedirectResponse(url="http://localhost:3000/login?error=google_failed")

# ── AUTH ──
@router.post("/register")
async def register(user: UserRegister, background_tasks: BackgroundTasks):
    from email_utils import enviar_email_verificacion
    db = get_db()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    token_verificacion = secrets.token_urlsafe(32)

    new_user = {
        "email": user.email,
        "password": get_password_hash(user.password),
        "nombre": user.nombre,
        "rol": user.rol,
        "copas": 0, "xp": 0, "tier": 1, "arena": "Bronce",
        "skills": {
            "analisis_logs": 0,
            "deteccion_amenazas": 0,
            "respuesta_incidentes": 0,
            "threat_hunting": 0,
            "forense_digital": 0,
            "gestion_vulnerabilidades": 0,
            "inteligencia_amenazas": 0
        },
        "sesiones_completadas": 0,
        "training_progreso": {},
        "fecha_registro": datetime.now().isoformat(),
        "email_verificado": False,
        "token_verificacion": token_verificacion
    }
    await db.users.insert_one(new_user)

    background_tasks.add_task(
        enviar_email_verificacion, user.email, user.nombre, token_verificacion
    )

    return {"mensaje": "Registro exitoso. Revisa tu email para verificar tu cuenta."}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db = get_db()
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    # Bloquear si no ha verificado el email
    if not db_user.get("email_verificado", False):
        raise HTTPException(status_code=403, detail="Debes verificar tu email antes de iniciar sesión")

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

# ── STATS ──
@router.put("/me/copas")
async def update_copas(copas_delta: int, email: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": email})
    nuevas_copas = max(0, user["copas"] + copas_delta)
    if nuevas_copas < 1000: arena = "Bronce"
    elif nuevas_copas < 2000: arena = "Plata"
    elif nuevas_copas < 3000: arena = "Oro"
    else: arena = "Elite"
    await db.users.update_one({"email": email}, {"$set": {"copas": nuevas_copas, "arena": arena}})
    return {"copas": nuevas_copas, "arena": arena}

@router.put("/me/xp")
async def update_xp(xp_delta: int, email: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": email})
    nueva_xp = user["xp"] + xp_delta
    if nueva_xp < 500: tier = 1
    elif nueva_xp < 1500: tier = 2
    elif nueva_xp < 3000: tier = 3
    elif nueva_xp < 5000: tier = 4
    elif nueva_xp < 8000: tier = 5
    elif nueva_xp < 12000: tier = 6
    elif nueva_xp < 18000: tier = 7
    else: tier = 8
    await db.users.update_one({"email": email}, {"$set": {"xp": nueva_xp, "tier": tier}})
    return {"xp": nueva_xp, "tier": tier}

# ── SESIONES ──
from sessions import generar_sesion, evaluar_respuesta

@router.post("/sesiones/generar")
async def crear_sesion(email: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": email})
    arena = user.get("arena", "Bronce")
    try:
        sesion = await generar_sesion(arena)
        sesion["arena"] = arena
        sesion["email_usuario"] = email
        sesion["estado"] = "activa"
        sesion["inicio"] = time.time()
        sesion["respuestas"] = []
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
    db = get_db()
    sesion = await db.sesiones.find_one({"_id": ObjectId(sesion_id)})
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    incidente = sesion["incidentes"][incidente_id - 1]
    arena = sesion.get("arena", "Bronce")
    tiempos = {"Bronce": 20, "Plata": 15, "Oro": 10, "Elite": 7}
    tiempo_limite = tiempos.get(arena, 20)
    evaluacion = await evaluar_respuesta(incidente, respuesta, tiempo_usado, tiempo_limite, pistas_usadas)
    await db.sesiones.update_one(
        {"_id": ObjectId(sesion_id)},
        {"$push": {"respuestas": {"incidente_id": incidente_id, "evaluacion": evaluacion}}}
    )
    return evaluacion

@router.post("/sesiones/{sesion_id}/finalizar")
async def finalizar_sesion(sesion_id: str, email: str = Depends(get_current_user)):
    from bson import ObjectId
    db = get_db()
    sesion = await db.sesiones.find_one({"_id": ObjectId(sesion_id)})
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    respuestas = sesion.get("respuestas", [])
    if not respuestas:
        raise HTTPException(status_code=400, detail="No hay respuestas")
    total_copas = sum(r["evaluacion"]["copas_delta"] for r in respuestas)
    media_puntuacion = sum(r["evaluacion"]["total"] for r in respuestas) / len(respuestas)
    total_xp = sum(r["evaluacion"]["total"] * 3 for r in respuestas)
    user = await db.users.find_one({"email": email})
    nuevas_copas = max(0, user["copas"] + total_copas)
    nueva_xp = user["xp"] + total_xp
    if nuevas_copas < 1000: arena = "Bronce"
    elif nuevas_copas < 2000: arena = "Plata"
    elif nuevas_copas < 3000: arena = "Oro"
    else: arena = "Elite"
    if nueva_xp < 500: tier = 1
    elif nueva_xp < 1500: tier = 2
    elif nueva_xp < 3000: tier = 3
    elif nueva_xp < 5000: tier = 4
    elif nueva_xp < 8000: tier = 5
    elif nueva_xp < 12000: tier = 6
    elif nueva_xp < 18000: tier = 7
    else: tier = 8
    await db.users.update_one(
        {"email": email},
        {"$set": {
            "copas": nuevas_copas, "arena": arena,
            "xp": nueva_xp, "tier": tier,
            "sesiones_completadas": user.get("sesiones_completadas", 0) + 1
        }}
    )
    await db.sesiones.update_one(
        {"_id": ObjectId(sesion_id)},
        {"$set": {"estado": "completada", "resultado": {
            "copas_ganadas": total_copas,
            "media_puntuacion": media_puntuacion,
            "xp_ganada": total_xp
        }}}
    )
    return {
        "copas_ganadas": total_copas, "nuevas_copas": nuevas_copas,
        "arena": arena, "xp_ganada": total_xp,
        "media_puntuacion": round(media_puntuacion, 1), "tier": tier
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

# ── RANKING ──
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
        posicion = next((i + 1 for i, j in enumerate(jugadores) if j.get("nombre") == user["nombre"]), len(jugadores) + 1)
        mi_posicion = {"nombre": user["nombre"], "copas": user["copas"], "arena": user["arena"], "tier": user["tier"], "posicion": posicion}
    return {"jugadores": jugadores, "mi_posicion": mi_posicion}

# ── EMPRESA ──
@router.get("/talent-pool")
async def get_talent_pool(email: str = Depends(get_current_user)):
    db = get_db()
    analistas = await db.users.find({"rol": "analista"}, {"password": 0}).sort("copas", -1).to_list(100)
    for a in analistas:
        a["_id"] = str(a["_id"])
    return analistas

@router.post("/ofertas")
async def crear_oferta(oferta: dict, email: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": email})
    oferta["empresa"] = user.get("nombre", "Empresa")
    oferta["email_empresa"] = email
    oferta["fecha"] = datetime.now().isoformat()
    oferta["estado"] = "activa"
    result = await db.ofertas.insert_one(oferta)
    return {"id": str(result.inserted_id), "mensaje": "Oferta publicada correctamente"}

@router.post("/simulaciones-empresa")
async def crear_simulacion_empresa(simulacion: dict, email: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": email})
    simulacion["empresa"] = user.get("nombre", "Empresa")
    simulacion["email_empresa"] = email
    simulacion["fecha"] = datetime.now().isoformat()
    result = await db.simulaciones_empresa.insert_one(simulacion)
    return {"id": str(result.inserted_id), "mensaje": "Simulación creada correctamente"}