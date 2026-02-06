from datetime import datetime
from typing import Optional, Annotated, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict, BeforeValidator

# Pydantic v2 way to handle MongoDB ObjectIds
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    api_keys: Dict[str, str] = {}

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
