from fastapi import APIRouter, Depends
from pydantic import BaseModel
from veo_prompt_generator.api.v1.endpoints.auth import get_current_user
from veo_prompt_generator.services.gemini import gemini_service

router = APIRouter()

class EducationalPromptRequest(BaseModel):
    character_name: str
    voice_tone: str  # angry, friendly, educational, serious
    topic_type: str  # health_benefit, side_effect
    language: str  # Hindi, English, etc.
    duration: int  # 8, 16, 24, 32, 40, 48, 56

@router.post("/generate-prompt")
async def generate_educational_prompt(
    request: EducationalPromptRequest,
    current_user = Depends(get_current_user)
):
    """Generate complete educational health content prompt"""
    
    result = await gemini_service.generate_educational_prompt(
        character_name=request.character_name,
        voice_tone=request.voice_tone,
        topic_type=request.topic_type,
        language=request.language,
        duration=request.duration
    )
    
    return result
