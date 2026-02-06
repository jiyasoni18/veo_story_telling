from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from veo_prompt_generator.core.config import settings
from veo_prompt_generator.db.mongodb import connect_to_mongo, close_mongo_connection
from veo_prompt_generator.api.v1.endpoints import auth, projects, ai, scenes, educational

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "Welcome to VEO Video Prompt Generator API"}

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])
app.include_router(scenes.router, prefix=f"{settings.API_V1_STR}", tags=["scenes"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(educational.router, prefix=f"{settings.API_V1_STR}/educational", tags=["educational"])
