# Voice Lock Integration for Storytelling - Implementation Spec

## 🎯 Objective

Integrate the voice-locking system into the existing storytelling prompt generator so that when users generate story scenes, the prompts automatically include:
- Voice Anchor Blocks (consistent across all scenes)
- Audio Environment descriptors
- Location-specific ambient sounds
- All voice-locking best practices

---

## 📋 Current System Analysis

### **What Exists Now:**

1. **Story Breaking** (`break_story_into_scenes`):
   - Takes story text and characters
   - Breaks into 8-second scenes
   - Returns JSON with scene descriptions

2. **Character Library**:
   - Characters have: `traits`, `voice_id`, `voice_tone`
   - Visual traits already captured
   - Voice information exists but not fully utilized

3. **Scene Generation**:
   - Generates scene descriptions
   - Includes dialogue
   - Has camera angles and transitions

### **What's Missing:**

❌ Voice Anchor Block generation  
❌ Audio environment descriptors  
❌ Ambient sound specifications  
❌ Voice consistency across scenes  
❌ Standalone prompt structure (no scene references)  

---

## 🔧 Required Changes

### **1. Enhance Character Model**

**File**: `backend/veo_prompt_generator/models/character.py` (or similar)

**Add these fields to character data**:

```python
class Character:
    name: str
    visual_traits: str  # Existing
    voice_id: str  # Existing
    voice_tone: str  # Existing
    
    # NEW FIELDS FOR VOICE LOCK:
    age_range: str  # e.g., "late 20s", "early 50s"
    vocal_quality: str  # e.g., "clear alto", "deep baritone"
    speaking_style: str  # e.g., "steady and purposeful", "slow and contemplative"
    accent: str  # e.g., "soft Irish", "refined British"
    emotional_baseline: str  # e.g., "quiet courage", "ancient wisdom"
    audio_environment: str  # e.g., "Close-mic, clean audio, warm tone, no reverb"
```

---

### **2. Create Voice Anchor Block Generator**

**File**: `backend/veo_prompt_generator/services/voice_lock.py` (NEW)

```python
class VoiceLockService:
    """Service for generating and managing voice-locked character descriptions"""
    
    def generate_voice_anchor_block(self, character: dict) -> str:
        """
        Generate a Voice Anchor Block from character data.
        This block will be identical across all scenes.
        
        Args:
            character: Dict with voice characteristics
            
        Returns:
            Voice Anchor Block string (50-80 words)
        """
        name = character.get('name', 'Character')
        age_range = character.get('age_range', 'mid-30s')
        vocal_quality = character.get('vocal_quality', 'clear, warm voice')
        speaking_style = character.get('speaking_style', 'confident tone')
        accent = character.get('accent', 'neutral accent')
        emotional_baseline = character.get('emotional_baseline', 'calm presence')
        
        voice_anchor = (
            f"{name}, a person in their {age_range}, with a {vocal_quality}, "
            f"{speaking_style}, {accent}, speaks with {emotional_baseline}."
        )
        
        return voice_anchor
    
    def get_audio_environment(self, character: dict) -> str:
        """Get consistent audio environment for character"""
        return character.get('audio_environment', 'Close-mic, clean audio, warm tone, no reverb')
    
    def get_ambient_sound(self, location: str) -> str:
        """Get ambient sound for location"""
        ambient_sounds = {
            'forest': 'rustling leaves, distant bird calls, wind through branches',
            'temple': 'echoing footsteps, distant chanting, stone acoustics',
            'mountain': 'howling wind, distant thunder, echoing silence',
            'city': 'distant traffic, footsteps on pavement, urban ambience',
            'cave': 'echoing drips, hollow acoustics, subtle reverb',
            'castle': 'crackling torches, distant footsteps, stone hall echo',
            'ocean': 'crashing waves, seagull cries, wind over water',
            'spaceship': 'humming engines, beeping consoles, air circulation',
            'library': 'rustling pages, distant footsteps, old wood creaking',
            'default': 'ambient environmental sounds'
        }
        
        return ambient_sounds.get(location.lower(), ambient_sounds['default'])
    
    def build_complete_prompt(self, 
                            scene_data: dict, 
                            characters: dict, 
                            location: str = 'default') -> str:
        """
        Build a complete voice-locked scene prompt.
        
        Args:
            scene_data: Scene information (description, dialogue, etc.)
            characters: Character library with voice anchors
            location: Scene location for ambient sound
            
        Returns:
            Complete standalone prompt with voice locking
        """
        shot_type = scene_data.get('camera_angle', 'Medium shot')
        description = scene_data.get('description', '')
        emotion = scene_data.get('emotion', '')
        
        # Build character voice anchors for this scene
        character_blocks = []
        dialogues = []
        
        for char_data in scene_data.get('characters', []):
            char_name = char_data.get('name')
            if char_name and char_name in characters:
                char_info = characters[char_name]
                voice_anchor = self.generate_voice_anchor_block(char_info)
                character_blocks.append(voice_anchor)
                
                # Add dialogue
                dialogue = char_data.get('dialogue', '')
                if dialogue:
                    dialogues.append(f"{char_name} says: \"{dialogue}\"")
        
        # Get audio settings
        # Use first character's audio environment (or could be scene-specific)
        first_char = scene_data.get('characters', [{}])[0].get('name')
        audio_env = self.get_audio_environment(characters.get(first_char, {}))
        ambient_sound = self.get_ambient_sound(location)
        
        # Build complete prompt
        prompt_parts = [
            f"{shot_type}.",
            " ".join(character_blocks) + ".",
            description + ".",
            " ".join(dialogues) + ".",
            audio_env + ".",
            f"Ambient sound: {ambient_sound}.",
            "Cinematic lighting, professional composition.",
            "No subtitles."
        ]
        
        return " ".join(prompt_parts)

voice_lock_service = VoiceLockService()
```

---

### **3. Update Story Breaking Service**

**File**: `backend/veo_prompt_generator/services/gemini.py`

**Modify `break_story_into_scenes` method**:

```python
async def break_story_into_scenes(self, story_text: str, characters: dict = None):
    url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
    
    char_context = ""
    if characters:
        char_context = "CHARACTER LIBRARY (Use these exact names and voice characteristics):\n"
        for char_name, char_data in characters.items():
            char_context += f"\n{char_name}:\n"
            char_context += f"  - Visual Traits: {char_data.get('traits', 'Not specified')}\n"
            
            # NEW: Include voice characteristics
            char_context += f"  - Age Range: {char_data.get('age_range', 'mid-30s')}\n"
            char_context += f"  - Vocal Quality: {char_data.get('vocal_quality', 'clear voice')}\n"
            char_context += f"  - Speaking Style: {char_data.get('speaking_style', 'confident tone')}\n"
            char_context += f"  - Accent: {char_data.get('accent', 'neutral')}\n"
            char_context += f"  - Emotional Baseline: {char_data.get('emotional_baseline', 'calm')}\n"

    prompt = f"""Break this STORY into a sequence of precisely 8-second video scenes.
Return the output as a RAW JSON OBJECT.

{char_context}

STORY:
{story_text}

CRITICAL REQUIREMENTS:
1. Each scene MUST be exactly 8 seconds
2. Use ONLY character names from the CHARACTER LIBRARY above
3. Reference character visual traits AND voice characteristics in scene descriptions
4. Assign dialogue to specific characters based on the story
5. Consider character voice tones when writing dialogue
6. Identify the LOCATION for each scene (forest, temple, city, etc.)
7. NO references to "Scene 1", "Scene 2", or "previous scene"
8. Each scene description must be STANDALONE (understandable without other scenes)

JSON STRUCTURE:
{{
  "scenes": [
    {{
      "scene_number": 1,
      "description": "Visual description (standalone, no scene references)...",
      "location": "forest",  // NEW: Location for ambient sound
      "characters": [
        {{ "name": "CharacterName", "dialogue": "Their specific line" }}
      ],
      "emotion": "Heroic",
      "scene_type": "action/dialogue",
      "camera_angle": "Close-up",
      "transition_type": "Cut"
    }}
  ]
}}"""

    # ... rest of the method stays the same
```

---

### **4. Create Voice-Locked Prompt Endpoint**

**File**: `backend/veo_prompt_generator/api/v1/endpoints/ai.py`

**Add new endpoint**:

```python
from veo_prompt_generator.services.voice_lock import voice_lock_service

class VoiceLockedSceneRequest(BaseModel):
    scene_data: dict
    characters: dict
    location: str = "default"

@router.post("/generate-voice-locked-prompt")
async def generate_voice_locked_prompt(request: VoiceLockedSceneRequest):
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
        complete_prompt = voice_lock_service.build_complete_prompt(
            scene_data=request.scene_data,
            characters=request.characters,
            location=request.location
        )
        
        return {
            "success": True,
            "prompt": complete_prompt,
            "voice_locked": True
        }
    except Exception as e:
        logging.error(f"Error generating voice-locked prompt: {e}")
        return {"success": False, "error": str(e)}
```

---

### **5. Update Frontend UI**

**File**: `frontend/src/components/StorytellingForm.jsx` (or similar)

**Add voice characteristic inputs**:

```jsx
// For each character, add these fields:

<div className="character-voice-settings">
  <h4>Voice Characteristics for {character.name}</h4>
  
  <div className="form-group">
    <label>Age Range</label>
    <select value={character.age_range} onChange={handleAgeRangeChange}>
      <option value="early 20s">Early 20s</option>
      <option value="mid-20s">Mid 20s</option>
      <option value="late 20s">Late 20s</option>
      <option value="early 30s">Early 30s</option>
      <option value="mid-30s">Mid 30s</option>
      <option value="late 30s">Late 30s</option>
      <option value="early 40s">Early 40s</option>
      <option value="mid-40s">Mid 40s</option>
      <option value="late 40s">Late 40s</option>
      <option value="early 50s">Early 50s</option>
      <option value="60s">60s</option>
      <option value="70s">70s</option>
    </select>
  </div>
  
  <div className="form-group">
    <label>Vocal Quality</label>
    <input 
      type="text" 
      placeholder="e.g., clear alto, deep baritone, warm voice"
      value={character.vocal_quality}
      onChange={handleVocalQualityChange}
    />
  </div>
  
  <div className="form-group">
    <label>Speaking Style</label>
    <input 
      type="text" 
      placeholder="e.g., steady and purposeful, slow and contemplative"
      value={character.speaking_style}
      onChange={handleSpeakingStyleChange}
    />
  </div>
  
  <div className="form-group">
    <label>Accent</label>
    <select value={character.accent} onChange={handleAccentChange}>
      <option value="neutral American">Neutral American</option>
      <option value="soft Irish">Soft Irish</option>
      <option value="refined British">Refined British</option>
      <option value="Southern American">Southern American</option>
      <option value="Eastern European">Eastern European</option>
      <option value="neutral Indian">Neutral Indian</option>
      <option value="no discernible accent">No Discernible Accent</option>
    </select>
  </div>
  
  <div className="form-group">
    <label>Emotional Baseline</label>
    <input 
      type="text" 
      placeholder="e.g., quiet courage, ancient wisdom, infectious optimism"
      value={character.emotional_baseline}
      onChange={handleEmotionalBaselineChange}
    />
  </div>
</div>
```

---

## 📊 Implementation Phases

### **Phase 1: Backend Foundation** (2-3 hours)

1. Create `voice_lock.py` service
2. Add voice fields to character model
3. Test voice anchor block generation

### **Phase 2: Integration** (2-3 hours)

1. Update `break_story_into_scenes` to include location
2. Modify scene generation to use voice anchors
3. Create voice-locked prompt endpoint
4. Test with sample data

### **Phase 3: Frontend** (3-4 hours)

1. Add voice characteristic inputs to UI
2. Update character creation form
3. Display voice-locked prompts
4. Test end-to-end flow

### **Phase 4: Testing & Refinement** (2 hours)

1. Generate test stories
2. Verify voice consistency
3. Adjust prompt templates
4. User testing

---

## ✅ Success Criteria

When implementation is complete:

✅ Users can input voice characteristics for each character  
✅ Generated prompts include Voice Anchor Blocks  
✅ Voice Anchor Blocks are identical across all scenes for same character  
✅ Audio environment is specified in every prompt  
✅ Ambient sound matches scene location  
✅ No scene references in prompts  
✅ Each prompt is standalone  
✅ Multi-scene stories maintain voice consistency  

---

## 🎬 Example Output

**Before (Current System)**:
```
Scene 1: Aria stands in the forest. She says: "I must find the crystal."
```

**After (Voice-Locked System)**:
```
Wide shot. Aria, a woman in her late 20s, with a clear, determined alto 
voice, steady and purposeful tone, soft Irish accent, speaks with quiet 
courage and underlying vulnerability, as if carrying a great burden. She 
stands at the edge of a dark forest, hand resting on her sword hilt. She 
says: "I must find the crystal." Close-mic, clean audio, warm tone, no 
reverb. Ambient sound: rustling leaves, distant bird calls, wind through 
branches. Cinematic lighting, misty atmosphere. No subtitles.
```

---

## 🚀 Next Steps

1. **Review this spec** and confirm approach
2. **Implement Phase 1** (backend foundation)
3. **Test voice anchor generation**
4. **Implement Phase 2** (integration)
5. **Implement Phase 3** (frontend)
6. **Test complete flow**

---

**Would you like me to start implementing this integration?** 🎬✨
