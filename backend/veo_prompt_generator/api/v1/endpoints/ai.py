from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from veo_prompt_generator.services.gemini import gemini_service
from veo_prompt_generator.api.v1.endpoints.deps import get_current_user
from veo_prompt_generator.services.prompt_builder import prompt_builder
from veo_prompt_generator.services.voice_lock import voice_lock_service
from veo_prompt_generator.db.mongodb import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    mime_type: Optional[str] = "image/jpeg"

class ScriptBreakRequest(BaseModel):
    story_text: str
    characters: Optional[dict] = {}
    narrator_mode: Optional[str] = "narrator_with_visuals"
    background_visual_style: Optional[str] = "Cinematic Photorealism"

class TalkingCharacterRequest(BaseModel):
    character_type: str
    topic: str
    language: str
    personality: str

class PromptGenerationRequest(BaseModel):
    project_id: str
    scene_id: str

@router.post("/generate-talking-character")
async def generate_talking_character(
    request: TalkingCharacterRequest,
    current_user = Depends(get_current_user)
):
    result = await gemini_service.generate_talking_character_prompt(
        request.character_type,
        request.topic,
        request.language,
        request.personality
    )
    if not result:
        raise HTTPException(status_code=500, detail="Talking character generation failed")
    return {"generated_prompt": result}

@router.post("/analyze-character")
async def analyze_character(
    request: ImageAnalysisRequest, 
    current_user = Depends(get_current_user)
):
    result = await gemini_service.analyze_character_image(
        request.image_base64, 
        request.mime_type
    )
    if not result:
        raise HTTPException(status_code=500, detail="Gemini analysis failed")
    return result

@router.post("/break-script")
async def break_script(
    request: ScriptBreakRequest, 
    current_user = Depends(get_current_user)
):
    result = await gemini_service.break_story_into_scenes(
        request.story_text, 
        characters=request.characters,
        narrator_mode=request.narrator_mode,
        background_visual_style=request.background_visual_style
    )
    if not result:
        raise HTTPException(status_code=500, detail="Gemini script breaking failed")
    return result

@router.post("/generate-scene-prompt")
async def generate_scene_prompt(
    request: PromptGenerationRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    # Fetch Project and Scene
    project = await db.projects.find_one({"_id": ObjectId(request.project_id), "user_id": current_user["_id"]})
    scene = await db.scenes.find_one({"_id": ObjectId(request.scene_id), "user_id": current_user["_id"]})
    
    if not project or not scene:
        raise HTTPException(status_code=404, detail="Project or Scene not found")
    
    # Generate Prompt
    final_prompt = await prompt_builder.generate_final_prompt(project, scene)
    
    # Save to scene
    await db.scenes.update_one(
        {"_id": ObjectId(request.scene_id)},
        {"$set": {"generated_prompt": final_prompt, "updated_at": datetime.utcnow()}}
    )
    
    return {"generated_prompt": final_prompt}


class VoiceLockedPromptRequest(BaseModel):
    scene_data: Dict
    characters: Dict
    location: Optional[str] = "default"


@router.post("/generate-voice-locked-prompt")
async def generate_voice_locked_prompt(
    request: VoiceLockedPromptRequest,
    current_user = Depends(get_current_user)
):
    """
    Generate a complete voice-locked prompt for a scene.
    
    This endpoint takes scene data and character information,
    and returns a fully formatted prompt with:
    - Voice Anchor Blocks
    - Audio Environment
    - Ambient Sound
    - Standalone structure
    """
    try:
        # Validate character voice data
        validated_characters = {}
        for char_name, char_data in request.characters.items():
            validated_characters[char_name] = voice_lock_service.validate_character_voice_data(char_data)
        
        # Build complete voice-locked prompt
        complete_prompt = voice_lock_service.build_complete_scene_prompt(
            scene_data=request.scene_data,
            characters=validated_characters,
            location=request.location
        )
        
        return {
            "success": True,
            "prompt": complete_prompt,
            "voice_locked": True,
            "location": request.location,
            "ambient_sound": voice_lock_service.get_ambient_sound(request.location)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating voice-locked prompt: {str(e)}")


@router.get("/voice-presets")
async def get_voice_presets(current_user = Depends(get_current_user)):
    """
    Get preset voice configurations for common character archetypes.
    
    Returns preset configurations for:
    - Wise Mentor
    - Young Hero
    - Mysterious Stranger
    - Child Character
    - Villain
    - Narrator
    """
    try:
        presets = voice_lock_service.generate_voice_presets()
        return {
            "success": True,
            "presets": presets
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching voice presets: {str(e)}")
