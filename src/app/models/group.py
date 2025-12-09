from datetime import datetime
from pydantic import Field
from .common import MongoModel, PyObjectId


class GroupIn(MongoModel):
    title: str
    course_code: str | None = None
    capacity: int = 5
    meeting_slots: dict | None = None # e.g., {"fri": [16, 18]}
    tags: list[str] = []


class GroupDB(GroupIn):
    id: PyObjectId = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
