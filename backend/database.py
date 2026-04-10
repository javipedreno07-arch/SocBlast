from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = "mongodb+srv://SocBlast:Socblast2024!@cluster0.fixhbqu.mongodb.net/socblast?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "socblast"

client = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    print("✅ Conectado a MongoDB Atlas")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db