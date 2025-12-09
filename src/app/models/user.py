from datetime import datetime
from pydantic import Field, EmailStr
from .common import MongoModel, PyObjectId


class UserIn(MongoModel):
    email: EmailStr
    name: str
    major: str | None = None
    class_year: int | None = None
    bio_text: str | None = None
    schedule_pref: dict | None = None # e.g., {"mon":[18,19], "wed":[18]}


class UserDB(UserIn):
    id: PyObjectId = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
