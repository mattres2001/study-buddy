from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.db import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import UserCreate, UserAuth, UserDB, UserPublic
from app.repos.users_repo import get_user_by_email, create_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic)
async def register(payload: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    existing = await get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(400, "Email already registered")
    user_db = UserDB(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
        major=payload.major,
        class_year=payload.class_year,
        bio_text=payload.bio_text,
        schedule_pref=payload.schedule_pref,
    )
    return await create_user(db, user_db)


@router.post("/login")
async def login(creds: UserAuth, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await get_user_by_email(db, creds.email)
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token(subject=str(user.id))
    return {"access_token": token, "token_type": "bearer"}
