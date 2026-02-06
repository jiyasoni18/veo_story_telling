from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from veo_prompt_generator.db.mongodb import get_database
from veo_prompt_generator.models.user import UserCreate, UserResponse, UserInDB, Token
from veo_prompt_generator.core.security import get_password_hash, verify_password, create_access_token
from veo_prompt_generator.api.v1.endpoints.deps import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate, db = Depends(get_database)):
    user = await db.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists in the system.",
        )
    
    user_dict = user_in.model_dump()
    password = user_dict.pop("password")
    user_dict["hashed_password"] = get_password_hash(password)
    user_dict["created_at"] = datetime.utcnow()
    
    new_user = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    created_user["id"] = str(created_user["_id"])
    return created_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_database)):
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=str(user["_id"]))
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]), 
        email=current_user["email"], 
        name=current_user.get("name")
    )
