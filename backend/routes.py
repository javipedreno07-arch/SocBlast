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

router = APIRouter()

# ── ARENA SYSTEM ──────────────────────────────────────────────────────────────
ARENAS_CONFIG = [
    {"nombre": "Bronce 3", "grupo": "Bronce", "min": 0,    "max": 299},
    {"nombre": "Bronce 2", "grupo": "Bronce", "min": 300,  "max": 599},
    {"nombre": "Bronce 1", "grupo": "Bronce", "min": 600,  "max": 899},
    {"nombre": "Plata 3",  "grupo": "Plata",  "min": 900,  "max": 1199},
    {"nombre": "Plata 2",  "grupo": "Plata",  "min": 1200, "max": 1499},
    {"nombre": "Plata 1",  "grupo": "Plata",  "min": 1500, "max": 1799},
    {"nombre": "Oro 3",    "grupo": "Oro",    "min": 1800, "max": 2099},
    {"nombre": "Oro 2",    "grupo": "Oro",    "min": 2100, "max": 2399},
    {"nombre": "Oro 1",    "grupo": "Oro",    "min": 2400, "max": 2699},
    {"nombre": "Diamante 3","grupo": "Diamante","min": 2700,"max": 2999},
    {"nombre": "Diamante 2","grupo": "Diamante","min": 3000,"max": 3299},
    {"nombre": "Diamante 1","grupo": "Diamante","min": 3300,"max": 99999},
]

SKILLS_LIST = [
    "analisis_logs", "deteccion_amenazas", "respuesta_incidentes",
    "threat_hunting", "forense_digital", "gestion_vulnerabilidades",
    "inteligencia_amenazas", "siem_queries"
]

# Cap de skill según grupo de arena
SKILLS_CAP = {
    "Bronce":   6.0,
    "Plata":    8.0,
    "Oro":      10.0,
    "Diamante": 10.0,
}

DELTA_BAJA        = 0.1   # penalización por racha mala
RACHA_MALA_LIMITE = 3     # sesiones seguidas fallando → penalizar


def get_arena_por_copas(copas: int) -> str:
    for a in ARENAS_CONFIG:
        if copas <= a["max"]:
            return a["nombre"]
    return "Diamante 1"


def get_grupo_arena(arena: str) -> str:
    """Extrae el grupo ('Bronce', 'Plata', 'Oro', 'Diamante') del nombre de arena."""
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


def aplicar_skills(
    skills_actuales: dict,
    evaluacion_ia: dict,       # {"skill": {"delta": 0.2, "malo": False}, ...}
    skills_streak_bad: dict,   # {"skill": 0, ...} — contador rachas malas
    arena: str
) -> tuple:
    """
    Aplica mejoras/penalizaciones de skills con:
    - Cap por grupo de arena (Bronce ≤6, Plata ≤8, Oro/Diamante ≤10)
    - Penalización -0.1 si lleva RACHA_MALA_LIMITE sesiones seguidas fallando esa skill
    - Skills pueden subir máximo 0.3 por sesión

    Retorna (nuevas_skills: dict, nuevo_streak_bad: dict)
    """
    grupo = get_grupo_arena(arena)
    cap   = SKILLS_CAP.get(grupo, 6.0)

    nuevas     = {k: float(v) for k, v in skills_actuales.items()}
    nuevo_streak = dict(skills_streak_bad)

    for skill, datos in evaluacion_ia.items():
        if skill not in nuevas:
            continue

        # Compatibilidad: si la IA devolviera formato antiguo (solo número)
        if isinstance(datos, (int, float)):
            delta = float(datos) * 0.15  # escalar 0-2 → 0-0.3
            malo  = (datos == 0)
        else:
            delta = min(0.3, max(0.0, float(datos.get("delta", 0.0))))
            malo  = bool(datos.get("malo", False))

        if malo:
            # Incrementar racha mala
            nuevo_streak[skill] = nuevo_streak.get(skill, 0) + 1

            # Penalizar si alcanza el límite de rachas
            if nuevo_streak[skill] >= RACHA_MALA_LIMITE:
                nuevas[skill]        = round(max(0.0, nuevas[skill] - DELTA_BAJA), 2)
                nuevo_streak[skill]  = 0  # reset tras penalizar
        else:
            # Resetear racha mala siempre que no falle
            nuevo_streak[skill] = 0

            if delta > 0:
                # Aplicar mejora respetando cap de arena
                nuevas[skill] = round(min(cap, nuevas[skill] + delta), 2)

    return nuevas, nuevo_streak


def skills_streak_inicial() -> dict:
    """Devuelve un streak_bad limpio para usuario nuevo."""
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
                "oauth_provider": "google", "email_verificado": True
            })
            rol = "analista"
        else:
            rol = existing.get("rol", "analista")
            # Migrar usuarios existentes que no tengan siem_queries o skills_streak_bad
            updates = {}
            if "siem_queries" not in existing.get("skills", {}):
                updates["skills.siem_queries"] = 0.0
            if "skills_streak_bad" not in existing:
                updates["skills_streak_bad"] = skills_streak_inicial()
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
        "skills":             {s: 0.0 for s in SKILLS_LIST},
        "skills_streak_bad":  skills_streak_inicial(),
        "sesiones_completadas": 0, "training_progreso": {},
        "fecha_registro": datetime.now().isoformat(),
        "email_verificado": True,
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

    # Migrar usuarios existentes sin siem_queries o skills_streak_bad
    updates = {}
    if "siem_queries" not in db_user.get("skills", {}):
        updates["skills.siem_queries"] = 0.0
    if "skills_streak_bad" not in db_user:
        updates["skills_streak_bad"] = skills_streak_inicial()
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
    sesion_id: str,
    incidente_id: int,
    respuesta: str,
    tiempo_usado: int,
    pistas_usadas: int = 0,
    email: str = Depends(get_current_user)
):
    from bson import ObjectId
    db = get_db()

    sesion = await db.sesiones.find_one({"_id": ObjectId(sesion_id)})
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    incidente     = sesion["incidentes"][incidente_id - 1]
    arena         = sesion.get("arena", "Bronce 3")
    grupo         = arena.split(" ")[0] if " " in arena else arena
    tiempos       = {"Bronce": 20, "Plata": 15, "Oro": 10, "Diamante": 7}
    tiempo_limite = tiempos.get(grupo, 20)

    # Pasar arena a evaluar_respuesta para que filtre skills por nivel
    evaluacion = await evaluar_respuesta(
        incidente, respuesta, tiempo_usado, tiempo_limite, pistas_usadas, arena
    )

    # ── APLICAR SKILLS ────────────────────────────────────────────────────────
    skills_mejora = evaluacion.get("skills_mejoradas", {})
    if skills_mejora:
        user = await db.users.find_one({"email": email})
        skills_actuales    = user.get("skills", {s: 0.0 for s in SKILLS_LIST})
        skills_streak_bad  = user.get("skills_streak_bad", skills_streak_inicial())

        skills_nuevas, nuevo_streak = aplicar_skills(
            skills_actuales,
            skills_mejora,
            skills_streak_bad,
            arena
        )

        await db.users.update_one(
            {"email": email},
            {"$set": {
                "skills":            skills_nuevas,
                "skills_streak_bad": nuevo_streak,
            }}
        )
        evaluacion["skills_nuevas"] = skills_nuevas

    # Guardar respuesta en la sesión
    await db.sesiones.update_one(
        {"_id": ObjectId(sesion_id)},
        {"$push": {"respuestas": {
            "incidente_id": incidente_id,
            "evaluacion":   evaluacion
        }}}
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

    total_copas      = sum(r["evaluacion"]["copas_delta"] for r in respuestas)
    media_puntuacion = sum(r["evaluacion"]["total"] for r in respuestas) / len(respuestas)
    total_xp         = sum(r["evaluacion"]["total"] * 3 for r in respuestas)

    user         = await db.users.find_one({"email": email})
    nuevas_copas = max(0, user["copas"] + total_copas)
    nueva_xp     = user["xp"] + total_xp
    arena        = get_arena_por_copas(nuevas_copas)
    tier         = calcular_tier(nueva_xp)

    await db.users.update_one({"email": email}, {"$set": {
        "copas":                nuevas_copas,
        "arena":                arena,
        "xp":                   nueva_xp,
        "tier":                 tier,
        "sesiones_completadas": user.get("sesiones_completadas", 0) + 1,
    }})

    await db.sesiones.update_one(
        {"_id": ObjectId(sesion_id)},
        {"$set": {
            "estado": "completada",
            "resultado": {
                "copas_ganadas":    total_copas,
                "media_puntuacion": media_puntuacion,
                "xp_ganada":        total_xp,
            }
        }}
    )

    return {
        "copas_ganadas":    total_copas,
        "nuevas_copas":     nuevas_copas,
        "arena":            arena,
        "xp_ganada":        total_xp,
        "media_puntuacion": round(media_puntuacion, 1),
        "tier":             tier,
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
            "nombre":   user["nombre"],
            "copas":    user["copas"],
            "arena":    user["arena"],
            "tier":     user["tier"],
            "posicion": posicion,
        }
    return {"jugadores": jugadores, "mi_posicion": mi_posicion}


# ── EMPRESA ───────────────────────────────────────────────────────────────────
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
    oferta["empresa"]       = user.get("nombre", "Empresa")
    oferta["email_empresa"] = email
    oferta["fecha"]         = datetime.now().isoformat()
    oferta["estado"]        = "activa"
    result = await db.ofertas.insert_one(oferta)
    return {"id": str(result.inserted_id), "mensaje": "Oferta publicada correctamente"}

@router.post("/simulaciones-empresa")
async def crear_simulacion_empresa(simulacion: dict, email: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": email})
    simulacion["empresa"]       = user.get("nombre", "Empresa")
    simulacion["email_empresa"] = email
    simulacion["fecha"]         = datetime.now().isoformat()
    result = await db.simulaciones_empresa.insert_one(simulacion)
    return {"id": str(result.inserted_id), "mensaje": "Simulación creada correctamente"}


# ── LAB ───────────────────────────────────────────────────────────────────────
@router.post("/lab/evaluar")
async def evaluar_lab(payload: dict, email: str = Depends(get_current_user)):
    """Evaluación local del laboratorio — sin IA para no gastar tokens."""
    informe  = payload.get("informe", "").lower()
    queries  = payload.get("queries_usadas", [])

    puntos    = 0
    hallazgos = []
    perdidos  = []

    checks = [
        (["185.220.101.45", "brute force", "fuerza bruta"], 25,
         "✓ Vector de entrada identificado (IP 185.220.101.45)",
         "✗ No identificaste el vector de entrada (brute force desde 185.220.101.45)"),
        (["mimikatz"], 20,
         "✓ Herramienta de credential dumping detectada (mimikatz)",
         "✗ No mencionaste mimikatz — herramienta clave del ataque"),
        (["movimiento lateral", "lateral", "srv-file", "fin-01"], 20,
         "✓ Movimiento lateral documentado",
         "✗ No documentaste el movimiento lateral a SRV-FILE01 y DESKTOP-FIN-01"),
        (["persistencia", "windowsupdatehelper", "tarea programada", "windowsupdatetask"], 15,
         "✓ Mecanismos de persistencia identificados",
         "✗ No identificaste la persistencia (servicio + tarea programada)"),
        (["exfil", "nighthawk", "c2", "4444", "command and control"], 20,
         "✓ Canal C2 y exfiltración documentados",
         "✗ No documentaste el canal C2 (nighthawk-ops.ru / puerto 4444)"),
    ]

    for keywords, pts, ok_msg, fail_msg in checks:
        if any(k in informe for k in keywords):
            puntos += pts
            hallazgos.append(ok_msg)
        else:
            perdidos.append(fail_msg)

    if len(queries) >= 5:
        puntos = min(puntos + 5, 100)
        hallazgos.append("✓ Investigación exhaustiva (5+ queries ejecutadas)")

    if puntos >= 80:
        feedback = "Excelente investigación forense. Has identificado la cadena completa del ataque."
    elif puntos >= 60:
        feedback = "Buena investigación. Encontraste los puntos principales pero faltaron detalles."
    else:
        feedback = "Investigación incompleta. Revisa los logs de procesos y el tráfico DNS."

    xp_ganada = round(puntos * 1.5)

    db       = get_db()
    user     = await db.users.find_one({"email": email})
    nueva_xp = user["xp"] + xp_ganada
    tier     = calcular_tier(nueva_xp)
    await db.users.update_one({"email": email}, {"$set": {"xp": nueva_xp, "tier": tier}})

    return {
        "puntuacion": puntos,
        "hallazgos":  hallazgos,
        "perdidos":   perdidos,
        "feedback":   feedback,
        "xp_ganada":  xp_ganada,
    }