from typing import Annotated
from bson import ObjectId
from pydantic import BaseModel, BeforeValidator


PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


class MongoModel(BaseModel):
# common config for all mongo models
model_config = {
"arbitrary_types_allowed": True,
"populate_by_name": True,
"json_encoders": {ObjectId: str},
}
