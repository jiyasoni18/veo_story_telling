from datetime import datetime
from typing import Optional, Dict, Any, Annotated
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from .user import PyObjectId

class ProjectBase(BaseModel):
    name: str
    project_type: str = "storytelling"
    characters: Dict[str, Any] = {}
    settings: Dict[str, Any] = {
        "visual_style": "Cinematic Photorealism",
        "default_duration": 8
    }

class ProjectCreate(ProjectBase):
    pass

class ProjectInDB(ProjectBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    total_scenes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    total_scenes: int
    created_at: datetime
    last_updated: datetime

    @classmethod
    def from_mongo(cls, data: dict):
        if "_id" in data:
            data["id"] = str(data["_id"])
        return cls(**data)
