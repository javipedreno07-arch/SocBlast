from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
from database import connect_db, close_db
from routes import router
import os
import time
from collections import defaultdict

load_dotenv()

app = FastAPI(
    title="SoCBlast API",
    version="1.0.0",
    # Ocultar docs en producción — cambia a None si no los necesitas
    docs_url="/api/docs" if os.getenv("ENV") != "production" else None,
    redoc_url=None,
)


# ── RATE LIMITER ──────────────────────────────────────────────────────────────
# Límites por IP para endpoints sensibles
RATE_LIMITS = {
    "/api/login":            {"max": 10,  "window": 60},   # 10 intentos / minuto
    "/api/register":         {"max": 5,   "window": 60},   # 5 registros / minuto
    "/api/lab/generar":      {"max": 6,   "window": 300},  # 6 labs / 5 minutos
    "/api/lab/evaluar":      {"max": 6,   "window": 300},  # 6 evaluaciones / 5 minutos
    "/api/certificado":      {"max": 30,  "window": 60},   # 30 verificaciones / minuto
}

# Almacén en memoria — para producción con mucho tráfico usar Redis
_rate_store: dict = defaultdict(list)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        ip   = request.client.host if request.client else "unknown"

        # Buscar si el path coincide con algún límite definido
        limit_cfg = None
        for route, cfg in RATE_LIMITS.items():
            if path.startswith(route):
                limit_cfg = cfg
                break

        if limit_cfg:
            key    = f"{ip}:{path}"
            now    = time.time()
            window = limit_cfg["window"]
            max_r  = limit_cfg["max"]

            # Limpiar entradas antiguas
            _rate_store[key] = [t for t in _rate_store[key] if now - t < window]

            if len(_rate_store[key]) >= max_r:
                retry_after = int(window - (now - _rate_store[key][0]))
                return Response(
                    content='{"detail":"Demasiadas solicitudes. Espera antes de intentarlo de nuevo."}',
                    status_code=429,
                    headers={
                        "Content-Type": "application/json",
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Limit": str(max_r),
                        "X-RateLimit-Reset": str(retry_after),
                    }
                )
            _rate_store[key].append(now)

        return await call_next(request)


# ── SECURITY HEADERS ──────────────────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Evitar clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # Evitar MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Forzar HTTPS
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Referrer mínimo
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # No cachear respuestas de API con datos personales
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        return response


# ── REGISTRAR MIDDLEWARES (orden importa — se ejecutan de abajo a arriba) ─────
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY"),
    max_age=300,
    https_only=True,
    same_site="none",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Solo los orígenes explícitamente permitidos — nunca allow_origins=["*"] en producción
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # sin PATCH ni * innecesarios
    allow_headers=["Authorization", "Content-Type"],            # solo los necesarios
)


# ── STARTUP / SHUTDOWN ────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()


# ── RUTAS ─────────────────────────────────────────────────────────────────────
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "SoCBlast API"}

@app.get("/health")
async def health():
    return {"status": "ok"}