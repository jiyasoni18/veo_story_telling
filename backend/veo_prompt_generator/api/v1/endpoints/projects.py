from fastapi import APIRouter, Depends, HTTPException
from typing import List
from veo_prompt_generator.db.mongodb import get_database
from veo_prompt_generator.models.project import ProjectCreate, ProjectResponse, ProjectInDB
from veo_prompt_generator.api.v1.endpoints.deps import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(db = Depends(get_database), current_user = Depends(get_current_user)):
    projects = await db.projects.find({"user_id": current_user["_id"]}).to_list(100)
    return [ProjectResponse.from_mongo(p) for p in projects]

@router.post("/", response_model=ProjectResponse)
async def create_project(project_in: ProjectCreate, db = Depends(get_database), current_user = Depends(get_current_user)):
    project_dict = project_in.model_dump()
    project_dict["user_id"] = current_user["_id"]
    project_dict["characters"] = project_dict.get("characters", {})
    project_dict["total_scenes"] = 0
    project_dict["created_at"] = datetime.utcnow()
    project_dict["last_updated"] = datetime.utcnow()
    
    new_project = await db.projects.insert_one(project_dict)
    created_project = await db.projects.find_one({"_id": new_project.inserted_id})
    return ProjectResponse.from_mongo(created_project)

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db = Depends(get_database), current_user = Depends(get_current_user)):
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": current_user["_id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.from_mongo(project)

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, project_in: ProjectCreate, db = Depends(get_database), current_user = Depends(get_current_user)):
    update_data = project_in.model_dump()
    update_data["last_updated"] = datetime.utcnow()
    
    result = await db.projects.update_one(
        {"_id": ObjectId(project_id), "user_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    updated_project = await db.projects.find_one({"_id": ObjectId(project_id)})
    return ProjectResponse.from_mongo(updated_project)
@router.delete("/{project_id}")
async def delete_project(project_id: str, db = Depends(get_database), current_user = Depends(get_current_user)):
    # 1. Delete associated scenes first
    await db.scenes.delete_many({
        "project_id": ObjectId(project_id),
        "user_id": current_user["_id"]
    })
    
    # 2. Delete the project itself
    result = await db.projects.delete_one({
        "_id": ObjectId(project_id),
        "user_id": current_user["_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return {"message": "Project and associated scenes deleted successfully"}
