from typing import Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.group import GroupIn, GroupDB


COLL = "groups"


async def create_group(db: AsyncIOMotorDatabase, group: GroupIn) -> GroupDB:
payload = group.model_dump(by_alias=True)
res = await db[COLL].insert_one(payload)
payload["_id"] = res.inserted_id
return GroupDB(**payload)


async def get_group(db: AsyncIOMotorDatabase, group_id: str) -> GroupDB | None:
doc = await db[COLL].find_one({"_id": ObjectId(group_id)})
return GroupDB(**doc) if doc else None


async def find_groups(db: AsyncIOMotorDatabase, query: dict[str, Any] | None = None) -> list[GroupDB]:
cursor = db[COLL].find(query or {})
return [GroupDB(**doc) async for doc in cursor]


async def update_group(db: AsyncIOMotorDatabase, group_id: str, patch: dict[str, Any]) -> GroupDB | None:
await db[COLL].update_one({"_id": ObjectId(group_id)}, {"$set": patch})
doc = await db[COLL].find_one({"_id": ObjectId(group_id)})
return GroupDB(**doc) if doc else None


async def delete_group(db: AsyncIOMotorDatabase, group_id: str) -> bool:
res = await db[COLL].delete_one({"_id": ObjectId(group_id)})
return res.deleted_count == 1
