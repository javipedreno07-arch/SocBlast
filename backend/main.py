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
    docs_url="/api/docs" if os.getenv("ENV") != "production" else None,
    redoc_url=None,
)


# ── RATE LIMITER ──────────────────────────────────────────────────────────────
RATE_LIMITS = {
    "/api/login":            {"max": 10,  "window": 60},
    "/api/register":         {"max": 5,   "window": 60},
    "/api/lab/generar":      {"max": 6,   "window": 300},
    "/api/lab/evaluar":      {"max": 6,   "window": 300},
    "/api/certificado":      {"max": 30,  "window": 60},
}

_rate_store: dict = defaultdict(list)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        ip   = request.client.host if request.client else "unknown"
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
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        return response


# ── MIDDLEWARES ───────────────────────────────────────────────────────────────
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
# Dominios base siempre permitidos
BASE_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://socblast.com",
    "https://www.socblast.com",
]

# Dominios extra desde variable de entorno (separados por coma)
_raw = os.getenv("ALLOWED_ORIGINS", "")
_extra = [o.strip() for o in _raw.split(",") if o.strip()]

# Unir ambos sin duplicados
origins = list(dict.fromkeys(BASE_ORIGINS + _extra))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
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