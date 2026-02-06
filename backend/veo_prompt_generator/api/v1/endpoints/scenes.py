from fastapi import APIRouter, Depends, HTTPException
from typing import List
from veo_prompt_generator.db.mongodb import get_database
from veo_prompt_generator.models.scene import SceneCreate, SceneResponse, SceneInDB
from veo_prompt_generator.api.v1.endpoints.deps import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/projects/{project_id}/scenes", response_model=List[SceneResponse])
async def list_scenes(project_id: str, db = Depends(get_database), current_user = Depends(get_current_user)):
    scenes = await db.scenes.find({
        "project_id": ObjectId(project_id),
        "user_id": current_user["_id"]
    }).sort("scene_number", 1).to_list(100)
    return [SceneResponse.from_mongo(s) for s in scenes]

@router.post("/projects/{project_id}/scenes", response_model=SceneResponse)
async def create_scene(
    project_id: str, 
    scene_in: SceneCreate, 
    db = Depends(get_database), 
    current_user = Depends(get_current_user)
):
    # Verify project exists and belongs to user
    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "user_id": current_user["_id"]
    })
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    scene_dict = scene_in.model_dump()
    scene_dict["project_id"] = ObjectId(project_id)
    scene_dict["user_id"] = current_user["_id"]
    scene_dict["created_at"] = datetime.utcnow()
    scene_dict["updated_at"] = datetime.utcnow()
    
    # Generate Story Context from previous scenes
    previous_scenes = await db.scenes.find({
        "project_id": ObjectId(project_id),
        "scene_number": {"$lt": scene_in.scene_number}
    }).sort("scene_number", 1).to_list(10)
    
    context_list = [f"Scene {s['scene_number']}: {s['description']}" for s in previous_scenes]
    scene_dict["story_context"] = " ".join(context_list)

    new_scene = await db.scenes.insert_one(scene_dict)
    
    # Update project's last_updated and scene count
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {
            "$set": {"last_updated": datetime.utcnow()},
            "$inc": {"total_scenes": 1}
        }
    )
    
    created_scene = await db.scenes.find_one({"_id": new_scene.inserted_id})
    return SceneResponse.from_mongo(created_scene)

@router.put("/scenes/{scene_id}", response_model=SceneResponse)
async def update_scene(
    scene_id: str,
    scene_in: SceneCreate,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
):
    update_data = scene_in.model_dump()
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.scenes.update_one(
        {"_id": ObjectId(scene_id), "user_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Scene not found")
        
    updated_scene = await db.scenes.find_one({"_id": ObjectId(scene_id)})
    return SceneResponse.from_mongo(updated_scene)

@router.delete("/scenes/{scene_id}")
async def delete_scene(
    scene_id: str,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
):
    result = await db.scenes.delete_one({"_id": ObjectId(scene_id), "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    return {"message": "Scene deleted successfully"}
@router.delete("/projects/{project_id}/scenes")
async def delete_project_scenes(
    project_id: str,
    db = Depends(get_database),
    current_user = Depends(get_current_user)
):
    await db.scenes.delete_many({
        "project_id": ObjectId(project_id),
        "user_id": current_user["_id"]
    })
    
    # Reset total_scenes count in project
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"total_scenes": 0}}
    )
    
    return {"message": "All scenes for project deleted"}
