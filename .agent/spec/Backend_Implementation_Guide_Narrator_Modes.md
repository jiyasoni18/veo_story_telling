# Backend Implementation Guide - Three Narrator Modes

## ✅ Files Already Updated

### 1. `backend/veo_prompt_generator/api/v1/endpoints/ai.py` ✅

**Changes Made**:
- Added `narrator_mode` and `background_visual_style` to `ScriptBreakRequest`
- Updated `/break-script` endpoint to pass these parameters to gemini service

```python
class ScriptBreakRequest(BaseModel):
    story_text: str
    characters: Optional[dict] = {}
    narrator_mode: Optional[str] = "narrator_with_visuals"  # ✅ ADDED
    background_visual_style: Optional[str] = "Cinematic Photorealism"  # ✅ ADDED

@router.post("/break-script")
async def break_script(request: ScriptBreakRequest, current_user = Depends(get_current_user)):
    result = await gemini_service.break_story_into_scenes(
        request.story_text, 
        characters=request.characters,
        narrator_mode=request.narrator_mode,  # ✅ ADDED
        background_visual_style=request.background_visual_style  # ✅ ADDED
    )
    ...
```

### 2. `frontend-react/src/pages/StoryProject.jsx` ✅

**Changes Made**:
- Added `narratorMode` state
- Added narrator mode dropdown with 3 options
- Sending `narrator_mode` to backend in `handleBreakScript`

```javascript
const [narratorMode, setNarratorMode] = useState('narrator_with_visuals');  // ✅ ADDED

// In handleBreakScript:
await axios.post('/api/v1/ai/break-script', {
    story_text: cleanText,
    characters: project.characters || {},
    background_visual_style: backgroundVisualStyle,
    narrator_mode: narratorMode  // ✅ ADDED
});
```

---

## ⏳ File Still Needs Update

### 3. `backend/veo_prompt_generator/services/gemini.py`

**Function**: `break_story_into_scenes`  
**Line**: 95  
**Status**: Function signature updated ✅, but prompt logic needs update ⏳

---

## 🔧 Required Changes to gemini.py

### Step 1: Update Function Signature ✅ DONE

```python
async def break_story_into_scenes(
    self, 
    story_text: str, 
    characters: dict = None,
    narrator_mode: str = "narrator_with_visuals",  # ✅ ADDED
    background_visual_style: str = "Cinematic Photorealism"  # ✅ ADDED
):
```

### Step 2: Add Narrator Detection (INSERT after line 102)

```python
# Find narrator character
narrator_name = None
if characters:
    for char_name, char_data in characters.items():
        if char_data.get('is_narrator', False):
            narrator_name = char_name
            break
```

### Step 3: Update Character Context Building (REPLACE lines 104-123)

```python
char_context = ""
if characters:
    char_context = "CHARACTER LIBRARY (Use these exact names and voice characteristics):\n"
    for char_name, char_data in characters.items():
        is_narrator = char_data.get('is_narrator', False)
        char_context += f"\n{char_name}{' (NARRATOR)' if is_narrator else ''}:\n"
        char_context += f"  - Visual Traits: {char_data.get('traits', 'Not specified')}\n"
        char_context += f"  - Voice ID: {char_data.get('voice_id', 'V1_Standard')}\n"
        char_context += f"  - Voice Tone: {char_data.get('voice_tone', 'Professional')}\n"
        char_context += f"  - Is Narrator: {'Yes' if is_narrator else 'No'}\n"  # ✅ ADDED
        
        # Add voice characteristics if available
        if char_data.get('age_range'):
            char_context += f"  - Age Range: {char_data.get('age_range')}\n"
        if char_data.get('vocal_quality'):
            char_context += f"  - Vocal Quality: {char_data.get('vocal_quality')}\n"
        if char_data.get('speaking_style'):
            char_context += f"  - Speaking Style: {char_data.get('speaking_style')}\n"
        if char_data.get('accent'):
            char_context += f"  - Accent: {char_data.get('accent')}\n"
        if char_data.get('emotional_baseline'):
            char_context += f"  - Emotional Baseline: {char_data.get('emotional_baseline')}\n"
```

### Step 4: Add Mode-Specific Instructions (INSERT before prompt building, around line 125)

```python
# Build mode-specific instructions
mode_instructions = ""
if narrator_mode == "narrator_with_visuals":
    mode_instructions = """
NARRATOR MODE: Narrator + Visual Scenes

RULES:
- Narrator character provides voiceover narration (narrator_text field)
- Characters shown visually AND can also speak (dialogue field)
- Include both narrator_text and character dialogue
- Narrator describes scenes while characters can also speak
- Characters have lip-sync when they speak
"""
elif narrator_mode == "narrator_only":
    mode_instructions = """
NARRATOR MODE: Narrator Only (Characters Silent)

RULES:
- ONLY narrator speaks (provides ALL dialogue and narration in narrator_text)
- Characters shown visually but COMPLETELY SILENT
- Character dialogue field MUST be empty string ""
- NO lip-sync for characters (mouths closed)
- Narrator describes everything including what characters would say
- Example: Narrator says "The monkey asked, 'What are you eating?' The crocodile replied, 'I am eating fruit.'"
"""
else:  # mode == "none"
    mode_instructions = """
NARRATOR MODE: None (Characters Speak Only)

RULES:
- NO narrator at all
- narrator_text field MUST be empty string ""
- ONLY characters speak with lip-sync (dialogue field)
- Pure character dialogue driven
- No voiceover narration
"""
```

### Step 5: Update Prompt (REPLACE prompt starting at line 125)

```python
prompt = f"""Break this STORY into a sequence of precisely 8-second video scenes.
Return the output as a RAW JSON OBJECT.

NARRATOR MODE: {narrator_mode}
BACKGROUND VISUAL STYLE: {background_visual_style}
{mode_instructions}

{char_context}

STORY:
{story_text}

CRITICAL REQUIREMENTS:
1. Each scene MUST be exactly 8 seconds
2. Use ONLY character names from the CHARACTER LIBRARY above
3. Reference character visual traits AND voice characteristics in scene descriptions
4. Follow the NARRATOR MODE rules strictly
5. Identify the LOCATION for each scene (e.g., forest, temple, city, cave, mountain, etc.)
6. NO references to "Scene 1", "Scene 2", or "previous scene" in descriptions
7. Each scene description must be STANDALONE (understandable without other scenes)

JSON STRUCTURE:
{{
  "scenes": [
    {{
      "scene_number": 1,
      "description": "Visual description (standalone, no scene references)...",
      "location": "forest",
      "narrator_text": "What narrator says (empty if mode is 'none')",
      "characters": [
        {{ "name": "CharacterName", "dialogue": "Their specific line (empty if mode is 'narrator_only')" }}
      ],
      "emotion": "Heroic",
      "scene_type": "action/dialogue",
      "camera_angle": "Close-up",
      "transition_type": "Cut"
    }}
  ]
}}

IMPORTANT NARRATOR MODE RULES:
- If mode is "narrator_with_visuals": Include narrator_text AND character dialogue
- If mode is "narrator_only": Include narrator_text, character dialogue MUST be empty ""
- If mode is "none": narrator_text MUST be empty "", include character dialogue

Return ONLY the JSON object, no markdown formatting."""
```

---

## 📋 Complete Updated Function

See file: `backend/veo_prompt_generator/services/gemini_narrator_update.py`

This file contains the complete updated function ready to replace the existing one.

---

## ✅ Implementation Checklist

### Frontend ✅ COMPLETE
- [x] Add `narratorMode` state
- [x] Add narrator mode dropdown with 3 options
- [x] Update dynamic descriptions
- [x] Send `narrator_mode` to backend

### Backend API ✅ COMPLETE
- [x] Add `narrator_mode` to `ScriptBreakRequest`
- [x] Add `background_visual_style` to `ScriptBreakRequest`
- [x] Pass parameters to gemini service

### Backend Gemini Service ⏳ IN PROGRESS
- [x] Update function signature
- [ ] Add narrator detection
- [ ] Update character context building
- [ ] Add mode-specific instructions
- [ ] Update prompt with narrator mode logic

---

## 🚀 Next Steps

1. **Manually update `gemini.py`** with the changes outlined above
2. **OR** Replace the entire `break_story_into_scenes` function with the version in `gemini_narrator_update.py`
3. **Test** with all 3 narrator modes
4. **Verify** scene breaking works correctly for each mode

---

## 📝 Testing Scenarios

### Test 1: Narrator + Visual Scenes
- **Input**: Story with narrator character marked
- **Expected**: Scenes with `narrator_text` AND character `dialogue`
- **Verify**: Both narrator and characters speak

### Test 2: Narrator Only
- **Input**: Same story, mode = "narrator_only"
- **Expected**: Scenes with `narrator_text`, character `dialogue` = ""
- **Verify**: Only narrator speaks, characters silent

### Test 3: None (Characters Only)
- **Input**: Same story, mode = "none"
- **Expected**: Scenes with `narrator_text` = "", character `dialogue` filled
- **Verify**: No narrator, only characters speak

---

## 🎉 Once Complete

All 3 narrator modes will be fully functional:
- ✅ Narrator + Visual Scenes
- ✅ Narrator Only
- ✅ None (Characters Only)

Users can choose the perfect storytelling style for their content!
