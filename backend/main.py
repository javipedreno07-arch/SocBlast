from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from database import connect_db, close_db
from routes import router
import os

load_dotenv()

app = FastAPI(title="SoCBlast API", version="1.0.0")

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"), max_age=300)

origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "SoCBlast API funcionando"}

@app.get("/health")
async def health():
    return {"status": "ok"}