from fastapi import APIRouter, Depends, HTTPException
from app.core.db import get_db
from app.core.deps import get_current_user_id
from app.models.group import GroupIn, GroupDB
from app.repos.groups_repo import create_group, get_group, find_groups, update_group, delete_group


router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("", response_model=GroupDB)
async def create(group: GroupIn, db=Depends(get_db), current_user: str = Depends(get_current_user_id)):
return await create_group(db, group)


@router.get("/{group_id}", response_model=GroupDB)
async def get(group_id: str, db=Depends(get_db)):
g = await get_group(db, group_id)
if not g:
raise HTTPException(status_code=404, detail="Group not found")
return g


@router.get("", response_model=list[GroupDB])
async def list_groups(q: str | None = None, db=Depends(get_db)):
query = {"$text": {"$search": q}} if q else {}
return await find_groups(db, query)


@router.patch("/{group_id}", response_model=GroupDB)
async def patch(group_id: str, patch: dict, db=Depends(get_db), current_user: str = Depends(get_current_user_id)):
g = await update_group(db, group_id, patch)
if not g:
raise HTTPException(status_code=404, detail="Group not found")
return g


@router.delete("/{group_id}")
async def remove(group_id: str, db=Depends(get_db), current_user: str = Depends(get_current_user_id)):
ok = await delete_group(db, group_id)
if not ok:
raise HTTPException(status_code=404, detail="Group not found")
return {"deleted": True}
