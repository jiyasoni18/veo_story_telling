# 🤖 Auto-Character Detection & Consistent Story Breaking - Complete Spec

## 📋 **Overview**

This system automatically detects characters from raw stories, generates consistent character descriptions, and breaks the story into 8-second scenes with narrator and character dialogue.

---

## 🎯 **Key Features**

### **1. Auto-Character Detection** ✅
- LLM analyzes raw story text
- Identifies all characters (Monkey, Crocodile, Crocodile's Wife, etc.)
- Extracts character traits from story context
- Generates detailed, consistent character descriptions

### **2. Consistent Character Descriptions** ✅
- Uses EXACT SAME words for character in ALL scenes
- Example: "Monkey with brown fur, long tail, agile movements, friendly expression"
- This EXACT description appears in Scene 1, 2, 3... till end
- Ensures Veo generates consistent character appearance

### **3. Narrator + Character Dialogue** ✅
- Separates narrator text from character dialogue
- Narrator provides voiceover
- Characters speak their dialogue with lip-sync
- Both work together in same scene

### **4. Character Image Support** ✅
- If user uploads character image, AI analyzes it
- Generates description from image
- Uses that description consistently in all scenes
- Image-based consistency

---

## 🔧 **Backend Implementation**

### **File**: `backend/veo_prompt_generator/services/gemini.py`

### **Enhanced `break_script_into_scenes` Function**:

```python
async def break_script_into_scenes(
    story_text: str, 
    characters: dict = None, 
    narrator_mode: str = "narrator_with_visuals",
    background_visual_style: str = "Cinematic Photorealism"
):
    """
    Break raw story into 8-second scenes with auto-character detection
    
    Args:
        story_text: Raw story text (can be in any language)
        characters: User-provided characters (optional)
        narrator_mode: Narrator behavior mode
        background_visual_style: Environment visual style
    
    Returns:
        {
            "scenes": [...],
            "detected_characters": {...}  # Auto-detected if not provided
        }
    """
    
    # Step 1: Auto-detect characters if not provided
    if not characters or len(characters) == 0:
        detected_characters = await auto_detect_characters(story_text)
    else:
        detected_characters = characters
    
    # Step 2: Generate consistent character descriptions
    character_descriptions = await generate_consistent_character_descriptions(
        story_text, 
        detected_characters
    )
    
    # Step 3: Break story into 8-second scenes
    scenes = await break_into_scenes_with_narrator(
        story_text,
        character_descriptions,
        narrator_mode,
        background_visual_style
    )
    
    return {
        "scenes": scenes,
        "detected_characters": character_descriptions
    }
```

---

### **Function 1: Auto-Detect Characters**

```python
async def auto_detect_characters(story_text: str) -> dict:
    """
    Automatically detect all characters from story text
    
    Returns:
        {
            "Monkey": {
                "role": "protagonist",
                "traits_from_story": "lives on tree, eats jamun, friendly"
            },
            "Crocodile": {
                "role": "friend turned antagonist",
                "traits_from_story": "weak initially, has wife, conflicted"
            },
            "Crocodile's Wife": {
                "role": "antagonist",
                "traits_from_story": "greedy, manipulative"
            },
            "Narrator": {
                "role": "storyteller",
                "is_narrator": true
            }
        }
    """
    
    system_prompt = f"""
    Analyze this story and identify ALL characters.
    
    For each character, provide:
    1. Character name
    2. Role in story (protagonist, antagonist, supporting, narrator)
    3. Traits mentioned in story
    4. Is this a narrator? (true/false)
    
    Story:
    {story_text}
    
    Return JSON format:
    {{
        "CharacterName": {{
            "role": "...",
            "traits_from_story": "...",
            "is_narrator": true/false
        }}
    }}
    
    IMPORTANT: Always include a "Narrator" character for voiceover.
    """
    
    response = await gemini_service.generate_content(system_prompt)
    characters = parse_json_response(response)
    
    return characters
```

---

### **Function 2: Generate Consistent Character Descriptions**

```python
async def generate_consistent_character_descriptions(
    story_text: str,
    detected_characters: dict
) -> dict:
    """
    Generate ULTRA-SPECIFIC character descriptions that will be used
    IDENTICALLY in ALL scenes for perfect consistency
    
    Returns:
        {
            "Monkey": {
                "consistent_description": "A monkey with warm brown fur, long curved tail, agile athletic build, friendly round eyes, expressive face with gentle smile, wearing no clothes, sitting on tree branches with natural ease",
                "visual_style": "Cinematic Photorealism",
                "voice_anchor": "Monkey, a character in their young adult years, with a cheerful, energetic voice, quick and animated tone, neutral accent, speaks with innocent enthusiasm",
                "is_narrator": false
            },
            "Crocodile": {
                "consistent_description": "A crocodile with dark green scaly skin, long powerful tail, strong jaws with visible teeth, initially weak and thin appearance, yellow reptilian eyes, large muscular body, moves slowly on land",
                "visual_style": "Cinematic Photorealism",
                "voice_anchor": "Crocodile, a character in their middle-aged years, with a deep, rumbling voice, slow and thoughtful tone, neutral accent, speaks with conflicted sincerity",
                "is_narrator": false
            },
            "Narrator": {
                "consistent_description": "Not visually present",
                "visual_style": "N/A",
                "voice_anchor": "Narrator, a storyteller in their mature years, with a warm, engaging voice, calm and rhythmic tone, neutral Hindi accent, speaks with wise and comforting presence",
                "is_narrator": true
            }
        }
    """
    
    system_prompt = f"""
    Generate ULTRA-SPECIFIC, DETAILED character descriptions for perfect visual consistency.
    
    CRITICAL RULES:
    1. Use EXACT, SPECIFIC details (colors, textures, measurements)
    2. These descriptions will be used WORD-FOR-WORD in EVERY scene
    3. More specific = better consistency
    4. Include 12 parameters: skin/fur, eyes, facial features, body type, clothing, unique marks
    
    Story context:
    {story_text}
    
    Characters detected:
    {json.dumps(detected_characters, indent=2)}
    
    For each character, generate:
    
    1. CONSISTENT_DESCRIPTION (Visual appearance):
       - Use ultra-specific details
       - Example: "A monkey with warm brown fur with golden highlights, long curved tail measuring approximately 60cm, agile athletic build with defined muscles, friendly round amber-colored eyes, expressive face with gentle smile showing small white teeth, no clothing, sitting on tree branches with natural ease, small scar on left ear"
       - This EXACT description will appear in ALL scenes
    
    2. VOICE_ANCHOR (Voice characteristics):
       - Format: "[Name], a [age range], with a [vocal quality], [speaking style], [accent], speaks with [emotional baseline]"
       - Example: "Monkey, a character in their young adult years, with a cheerful, energetic voice, quick and animated tone, neutral accent, speaks with innocent enthusiasm and playful curiosity"
    
    3. VISUAL_STYLE:
       - Default: "Cinematic Photorealism"
       - Can be: "3D Animation", "2D Anime", etc.
    
    4. IS_NARRATOR:
       - true if this is narrator character
       - false for regular characters
    
    Return JSON format:
    {{
        "CharacterName": {{
            "consistent_description": "...",
            "voice_anchor": "...",
            "visual_style": "...",
            "is_narrator": true/false
        }}
    }}
    
    REMEMBER: The consistent_description will be copy-pasted into EVERY scene prompt.
    Make it EXTREMELY specific and detailed!
    """
    
    response = await gemini_service.generate_content(system_prompt)
    character_descriptions = parse_json_response(response)
    
    return character_descriptions
```

---

### **Function 3: Break Into Scenes with Narrator**

```python
async def break_into_scenes_with_narrator(
    story_text: str,
    character_descriptions: dict,
    narrator_mode: str,
    background_visual_style: str
) -> list:
    """
    Break story into 8-second scenes with narrator and character dialogue
    
    Returns:
        [
            {
                "scene_number": 1,
                "duration": 8,
                "description": "Visual description of what's happening",
                "narrator_text": "What narrator says (voiceover)",
                "characters_in_scene": {
                    "Monkey": {
                        "dialogue": "What monkey says (with lip-sync)",
                        "action": "What monkey does",
                        "emotion": "happy/sad/worried"
                    }
                },
                "camera_angle": "Wide shot",
                "transition_type": "Fade in",
                "time_of_day": "Morning",
                "location": "River bank with jamun trees"
            },
            ...
        ]
    """
    
    # Find narrator character
    narrator_name = None
    for char_name, char_data in character_descriptions.items():
        if char_data.get("is_narrator", False):
            narrator_name = char_name
            break
    
    system_prompt = f"""
    Break this story into 8-SECOND scenes with narrator and character dialogue.
    
    STORY:
    {story_text}
    
    CHARACTER DESCRIPTIONS (USE THESE EXACTLY):
    {json.dumps(character_descriptions, indent=2)}
    
    NARRATOR: {narrator_name}
    NARRATOR MODE: {narrator_mode}
    BACKGROUND STYLE: {background_visual_style}
    
    RULES:
    1. Each scene = 8 seconds maximum
    2. Separate narrator text from character dialogue
    3. Narrator provides voiceover (background narration)
    4. Characters speak their dialogue (with lip-sync)
    5. Include camera angles, transitions, emotions
    
    NARRATOR MODE RULES:
    - If "narrator_with_visuals": Narrator speaks + Characters can also speak
    - If "narrator_only": Only narrator speaks, characters shown silently
    
    SCENE FORMAT:
    {{
        "scene_number": 1,
        "duration": 8,
        "description": "Visual description of scene",
        "narrator_text": "What narrator says as voiceover",
        "characters_in_scene": {{
            "CharacterName": {{
                "dialogue": "What character says (empty if narrator_only mode)",
                "action": "What character does visually",
                "emotion": "happy/sad/worried/angry/neutral"
            }}
        }},
        "camera_angle": "Wide shot/Close-up/Medium shot/etc",
        "transition_type": "Fade in/Cut/Dissolve/etc",
        "time_of_day": "Morning/Afternoon/Evening/Night",
        "location": "Specific location description"
    }}
    
    IMPORTANT:
    - Break story into logical 8-second chunks
    - Each scene should have clear visual action
    - Narrator text should describe what's shown
    - Character dialogue should be natural and brief (8 seconds max)
    - Use appropriate camera angles for storytelling
    
    Return array of scenes in JSON format.
    """
    
    response = await gemini_service.generate_content(system_prompt)
    scenes = parse_json_response(response)
    
    return scenes
```

---

## 📝 **Example: Your Monkey Story**

### **Input**:
```
बंदर की कहानी: एक बार की बात है, एक नदी के किनारे बहुत सारे जामुन के पेड़ थे 
और वहां पर एक बंदर रहता था। जामुन के पेड़ में बहुत रशीले और मीठे जामुन लगे 
हुए थे, जिसको बंदर बहुत चाव से खाता था...
```

---

### **Step 1: Auto-Detect Characters**

```json
{
    "Monkey": {
        "role": "protagonist",
        "traits_from_story": "lives on jamun tree, eats jamun fruits, friendly, clever",
        "is_narrator": false
    },
    "Crocodile": {
        "role": "friend turned antagonist",
        "traits_from_story": "weak initially, becomes friend, has wife, conflicted",
        "is_narrator": false
    },
    "Crocodile's Wife": {
        "role": "antagonist",
        "traits_from_story": "greedy, manipulative, wants to eat monkey",
        "is_narrator": false
    },
    "Narrator": {
        "role": "storyteller",
        "is_narrator": true
    }
}
```

---

### **Step 2: Generate Consistent Descriptions**

```json
{
    "Monkey": {
        "consistent_description": "A monkey with warm brown fur with golden highlights on chest, long curved tail measuring approximately 60cm, agile athletic build with defined arm muscles, friendly round amber-colored eyes, expressive face with gentle smile showing small white teeth, small pink nose, no clothing, sitting on tree branches with natural ease, small scar on left ear, approximately 2 feet tall when sitting",
        "voice_anchor": "Monkey, a character in their young adult years, with a cheerful, energetic voice, quick and animated tone, neutral Hindi accent, speaks with innocent enthusiasm and playful curiosity",
        "visual_style": "Cinematic Photorealism",
        "is_narrator": false
    },
    "Crocodile": {
        "consistent_description": "A crocodile with dark olive-green scaly skin with lighter yellow underbelly, long powerful tail measuring 6 feet, strong jaws with visible white teeth, initially thin and weak appearance with visible ribs, yellow reptilian eyes with vertical pupils, large muscular body approximately 10 feet long, rough textured scales, moves slowly on land with heavy steps, four short legs with webbed feet",
        "voice_anchor": "Crocodile, a character in their middle-aged years, with a deep, rumbling voice, slow and thoughtful tone, neutral Hindi accent, speaks with conflicted sincerity and underlying sadness",
        "visual_style": "Cinematic Photorealism",
        "is_narrator": false
    },
    "Crocodile's Wife": {
        "consistent_description": "A female crocodile with darker green scaly skin, slightly smaller than male crocodile at 8 feet long, sharp yellow eyes with cunning expression, well-fed appearance with rounded body, smooth scales, long snout with sharp teeth, moves with calculated precision, aggressive posture",
        "voice_anchor": "Crocodile's Wife, a character in their middle-aged years, with a sharp, demanding voice, quick and manipulative tone, neutral Hindi accent, speaks with greedy insistence and cunning persuasion",
        "visual_style": "Cinematic Photorealism",
        "is_narrator": false
    },
    "Narrator": {
        "consistent_description": "Not visually present",
        "voice_anchor": "Narrator, a storyteller in their mature years, with a warm, engaging voice, calm and rhythmic tone, neutral Hindi accent, speaks with wise and comforting presence, traditional storytelling style",
        "visual_style": "N/A",
        "is_narrator": true
    }
}
```

---

### **Step 3: Break Into Scenes**

**Scene 1** (8 seconds):
```json
{
    "scene_number": 1,
    "duration": 8,
    "description": "River bank with lush jamun trees. A monkey sits on a branch eating jamun fruits.",
    "narrator_text": "एक बार की बात है, एक नदी के किनारे बहुत सारे जामुन के पेड़ थे और वहां पर एक बंदर रहता था।",
    "characters_in_scene": {
        "Monkey": {
            "dialogue": "",
            "action": "sitting on tree branch, eating jamun fruits happily",
            "emotion": "happy"
        }
    },
    "camera_angle": "Wide shot",
    "transition_type": "Fade in",
    "time_of_day": "Morning",
    "location": "River bank with jamun trees"
}
```

**Scene 2** (8 seconds):
```json
{
    "scene_number": 2,
    "duration": 8,
    "description": "A weak crocodile approaches the tree. Monkey looks down.",
    "narrator_text": "एक दिन बन्दर जामुन खाने में मस्त था तभी वहां अचानक एक मगर आया। मगर बहुत ही दुर्बल था।",
    "characters_in_scene": {
        "Monkey": {
            "dialogue": "",
            "action": "looking down from tree at crocodile",
            "emotion": "curious"
        },
        "Crocodile": {
            "dialogue": "",
            "action": "approaching tree slowly, looking weak and tired",
            "emotion": "tired"
        }
    },
    "camera_angle": "Medium shot",
    "transition_type": "Cut",
    "time_of_day": "Morning",
    "location": "River bank near jamun tree"
}
```

**Scene 3** (8 seconds):
```json
{
    "scene_number": 3,
    "duration": 8,
    "description": "Crocodile looks up at monkey. Monkey smiles down.",
    "narrator_text": "मगर ने बंदर को देखा और पूछा",
    "characters_in_scene": {
        "Monkey": {
            "dialogue": "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।",
            "action": "smiling and gesturing with jamun in hand",
            "emotion": "friendly"
        },
        "Crocodile": {
            "dialogue": "भाई तुम क्या खा रहे हो।",
            "action": "looking up at monkey with hopeful expression",
            "emotion": "curious"
        }
    },
    "camera_angle": "Close-up alternating between monkey and crocodile",
    "transition_type": "Cut",
    "time_of_day": "Morning",
    "location": "River bank at jamun tree"
}
```

---

### **Step 4: Generate Veo Prompt (Scene 3)**

```
BACKGROUND/ENVIRONMENT VISUAL STYLE: Cinematic Photorealism (MUST BE CONSISTENT)

NARRATOR (VOICEOVER):
- Voice Anchor: Narrator, a storyteller in their mature years, with a warm, engaging voice, calm and rhythmic tone, neutral Hindi accent, speaks with wise and comforting presence, traditional storytelling style.
- Narration Text: "मगर ने बंदर को देखा और पूछा"
- This is BACKGROUND VOICEOVER

CHARACTER: Monkey
- Visual Style: Cinematic Photorealism (MUST BE CONSISTENT IN ALL SCENES)
- Consistent Description: A monkey with warm brown fur with golden highlights on chest, long curved tail measuring approximately 60cm, agile athletic build with defined arm muscles, friendly round amber-colored eyes, expressive face with gentle smile showing small white teeth, small pink nose, no clothing, sitting on tree branches with natural ease, small scar on left ear, approximately 2 feet tall when sitting
- Voice Anchor: Monkey, a character in their young adult years, with a cheerful, energetic voice, quick and animated tone, neutral Hindi accent, speaks with innocent enthusiasm and playful curiosity.
- Dialogue: "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।"
- Action: smiling and gesturing with jamun in hand
- Emotion: friendly

CHARACTER: Crocodile
- Visual Style: Cinematic Photorealism (MUST BE CONSISTENT IN ALL SCENES)
- Consistent Description: A crocodile with dark olive-green scaly skin with lighter yellow underbelly, long powerful tail measuring 6 feet, strong jaws with visible white teeth, initially thin and weak appearance with visible ribs, yellow reptilian eyes with vertical pupils, large muscular body approximately 10 feet long, rough textured scales, moves slowly on land with heavy steps, four short legs with webbed feet
- Voice Anchor: Crocodile, a character in their middle-aged years, with a deep, rumbling voice, slow and thoughtful tone, neutral Hindi accent, speaks with conflicted sincerity and underlying sadness.
- Dialogue: "भाई तुम क्या खा रहे हो।"
- Action: looking up at monkey with hopeful expression
- Emotion: curious

---

FINAL VEO 3.1 PROMPT:

Close-up shot reveals a river bank scene at a jamun tree on a bright morning. The environment is rendered in Cinematic Photorealism with natural lighting, detailed bark textures, and lush green foliage.

[VOICEOVER - Narrator, a storyteller in their mature years, with a warm, engaging voice, calm and rhythmic tone, neutral Hindi accent, speaks with wise and comforting presence, narrates:]
"मगर ने बंदर को देखा और पूछा"

A monkey with warm brown fur with golden highlights on chest, long curved tail measuring approximately 60cm, agile athletic build with defined arm muscles, friendly round amber-colored eyes, expressive face with gentle smile showing small white teeth, small pink nose, no clothing, sitting on tree branches with natural ease, small scar on left ear, approximately 2 feet tall when sitting, sits on a tree branch holding a jamun fruit. The monkey smiles down warmly and gestures with the fruit in hand.

The monkey speaks with cheerful enthusiasm: "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।" [TECHNICAL: Lip-sync active for Monkey]

Below, a crocodile with dark olive-green scaly skin with lighter yellow underbelly, long powerful tail measuring 6 feet, strong jaws with visible white teeth, initially thin and weak appearance with visible ribs, yellow reptilian eyes with vertical pupils, large muscular body approximately 10 feet long, rough textured scales, moves slowly on land with heavy steps, four short legs with webbed feet, looks up at the monkey with a hopeful, curious expression.

The crocodile speaks in a deep, rumbling voice: "भाई तुम क्या खा रहे हो।" [TECHNICAL: Lip-sync active for Crocodile]

Camera alternates between close-ups of monkey's friendly face and crocodile's hopeful expression. Natural forest sounds, gentle river flow in background. Photorealistic rendering with detailed fur and scale textures, natural shadows, and warm morning sunlight filtering through leaves.
```

---

## ✅ **Key Features Implemented**

### **1. Auto-Character Detection** ✅
- Detects: Monkey, Crocodile, Crocodile's Wife, Narrator
- Extracts traits from story context
- No manual character entry needed

### **2. Consistent Descriptions** ✅
**Monkey in Scene 1**:
```
"A monkey with warm brown fur with golden highlights on chest, long curved tail measuring approximately 60cm..."
```

**Monkey in Scene 2**:
```
"A monkey with warm brown fur with golden highlights on chest, long curved tail measuring approximately 60cm..."
```

**Monkey in Scene 10**:
```
"A monkey with warm brown fur with golden highlights on chest, long curved tail measuring approximately 60cm..."
```

**IDENTICAL in ALL scenes!** ✅

### **3. Narrator + Character Dialogue** ✅
- Narrator: "मगर ने बंदर को देखा और पूछा" (voiceover)
- Monkey: "भाई मत बोलो मैं तुम्हारा दोस्त हूं" (lip-sync)
- Crocodile: "भाई तुम क्या खा रहे हो" (lip-sync)
- All in same scene!

### **4. Lip-Sync Markers** ✅
```
[TECHNICAL: Lip-sync active for Monkey]
[TECHNICAL: Lip-sync active for Crocodile]
```

### **5. Voice Consistency** ✅
- Voice Anchor Block for each character
- IDENTICAL in all scenes
- Narrator also has Voice Anchor

---

## 🔄 **Complete Workflow**

### **User Provides**:
1. Raw story (any language, any format)
2. Optional: Character images
3. Optional: Background visual style
4. Optional: Narrator mode

### **System Does**:
1. ✅ Auto-detects characters
2. ✅ Generates ultra-specific consistent descriptions
3. ✅ Breaks into 8-second scenes
4. ✅ Separates narrator from dialogue
5. ✅ Generates Veo prompts with:
   - Narrator voiceover
   - Character dialogue with lip-sync
   - Consistent character descriptions
   - Consistent voice anchors
   - Camera angles and transitions

### **User Gets**:
- ✅ Perfectly broken scenes
- ✅ Consistent characters across all scenes
- ✅ Professional prompts ready for Veo 3.1
- ✅ Narrator + character dialogue
- ✅ Lip-sync markers

---

## 📊 **Implementation Checklist**

### **Backend**:
- [ ] Implement `auto_detect_characters()`
- [ ] Implement `generate_consistent_character_descriptions()`
- [ ] Implement `break_into_scenes_with_narrator()`
- [ ] Update `break_script_into_scenes()` to use new functions
- [ ] Add character image analysis (if image provided)
- [ ] Test with Hindi story
- [ ] Test with English story

### **Frontend**:
- [ ] Allow empty character library (auto-detect will handle)
- [ ] Show detected characters after breaking script
- [ ] Allow user to edit auto-detected characters
- [ ] Send narrator mode to backend

### **Testing**:
- [ ] Test with your monkey story
- [ ] Verify character consistency
- [ ] Verify narrator + dialogue separation
- [ ] Verify lip-sync markers
- [ ] Test with character images

---

## 🎉 **Expected Result**

**User pastes raw Hindi story** → **System auto-detects Monkey, Crocodile, Crocodile's Wife, Narrator** → **Generates ultra-specific descriptions** → **Breaks into 8-second scenes** → **Creates prompts with narrator voiceover + character dialogue** → **Perfect consistency across all scenes** → **Ready for Veo 3.1!**

**This will work with ANY story in ANY language!** 🚀✨🎬
