from fastapi import APIRouter, Depends, HTTPException
from app.core.db import get_db
from app.core.deps import get_current_user_id
from app.models.user import UserPublic
from app.repos.users_repo import get_user, find_users, update_user, delete_user


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserPublic)
async def get(user_id: str, db=Depends(get_db)):
    u = await get_user(db, user_id)
    if not u:
        raise HTTPException(404, "User not found")
    return u


@router.get("", response_model=list[UserPublic])
async def list_users(q: str | None = None, db=Depends(get_db)):
    query = {"$text": {"$search": q}} if q else {}
    return await find_users(db, query)


@router.patch("/{user_id}", response_model=UserPublic)
async def patch(user_id: str, patch: dict, db=Depends(get_db), current_user: str = Depends(get_current_user_id)):
    # Example policy: only allow authenticated users to patch
    u = await update_user(db, user_id, patch)
    if not u:
        raise HTTPException(404, "User not found")
    return u


@router.delete("/{user_id}")
async def remove(user_id: str, db=Depends(get_db), current_user: str = Depends(get_current_user_id)):
    ok = await delete_user(db, user_id)
    if not ok:
        raise HTTPException(404, "User not found")
    return {"deleted": True}
