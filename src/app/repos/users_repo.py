from typing import Any, Iterable
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import UserIn, UserDB


COLL = "users"


async def create_user(db: AsyncIOMotorDatabase, user: UserIn) -> UserDB:
    payload = user.model_dump(by_alias=True)
    res = await db[COLL].insert_one(payload)
    payload["_id"] = res.inserted_id
    return UserDB(**payload)




async def get_user(db: AsyncIOMotorDatabase, user_id: str) -> UserDB | None:
    doc = await db[COLL].find_one({"_id": ObjectId(user_id)})
    return UserDB(**doc) if doc else None




async def find_users(db: AsyncIOMotorDatabase, query: dict[str, Any] | None = None) -> list[UserDB]:
    cursor = db[COLL].find(query or {})
    return [UserDB(**doc) async for doc in cursor]




async def update_user(db: AsyncIOMotorDatabase, user_id: str, patch: dict[str, Any]) -> UserDB | None:
    await db[COLL].update_one({"_id": ObjectId(user_id)}, {"$set": patch})
    doc = await db[COLL].find_one({"_id": ObjectId(user_id)})
    return UserDB(**doc) if doc else None




async def delete_user(db: AsyncIOMotorDatabase, user_id: str) -> bool:
    res = await db[COLL].delete_one({"_id": ObjectId(user_id)})
    return res.deleted_count == 1
