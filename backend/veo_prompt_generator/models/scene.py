from datetime import datetime
from typing import Optional, Dict, Any, Annotated
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from .user import PyObjectId

class SceneBase(BaseModel):
    scene_number: int
    description: str
    duration: int = 8
    scene_type: str = "dialogue"
    characters_in_scene: Dict[str, Any] = {}
    dialogue: Optional[str] = None
    camera_angle: Optional[str] = "Eye level"
    transition_type: Optional[str] = "Cut"
    setting: Optional[str] = None
    lighting: Optional[str] = None
    time_of_day: Optional[str] = None

class SceneCreate(SceneBase):
    pass

class SceneInDB(SceneBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    project_id: PyObjectId
    user_id: PyObjectId
    generated_prompt: Optional[str] = None
    story_context: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SceneResponse(SceneBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    generated_prompt: Optional[str] = None
    story_context: Optional[str] = None

    @classmethod
    def from_mongo(cls, data: dict):
        if "_id" in data:
            data["id"] = str(data["_id"])
        return cls(**data)
