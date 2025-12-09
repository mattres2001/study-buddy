from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.db import get_db, get_client
from app.core.settings import settings
from app.routers import users as users_router
from app.routers import groups as groups_router
from app.routers import auth as auth_router


app = FastAPI(title="StudyBuddy API (FARM)")


# CORS for React frontends
app.add_middleware(
CORSMiddleware,
allow_origins=settings.CORS_ALLOW_ORIGINS,
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)


# Routers
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(groups_router.router)


@app.on_event("startup")
async def startup():
    db: AsyncIOMotorDatabase = get_db()
    # text indexes
    await db["users"].create_index(
        [("name", "text"), ("bio_text", "text"), ("major", "text")],
        name="users_text_idx",
        default_language="english",
    )
    await db["users"].create_index("email", name="users_email_unique", unique=True)


    await db["groups"].create_index(
        [("title", "text"), ("course_code", "text"), ("tags", "text")],
        name="groups_text_idx",
        default_language="english",
    )


@app.on_event("shutdown")
async def shutdown():
    get_client().close()
