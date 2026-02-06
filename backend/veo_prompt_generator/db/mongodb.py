from motor.motor_asyncio import AsyncIOMotorClient
from veo_prompt_generator.core.config import settings
import logging
import certifi

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    logging.info("Connecting to MongoDB...")
    db_instance.client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsCAFile=certifi.where()
    )
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    logging.info("Connected to MongoDB Atlas!")

async def close_mongo_connection():
    logging.info("Closing MongoDB connection...")
    db_instance.client.close()
    logging.info("MongoDB connection closed!")

def get_database():
    return db_instance.db
