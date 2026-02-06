# 🎙️ Narrator & Voiceover System - Complete Specification

## 📋 **Overview**

This document specifies the complete implementation of the **Narrator/Voiceover System** for the Veo Prompt Generator.

---

## 🎯 **Requirements**

### **1. Narrator as Character**
- Add narrator to Character Library
- Mark character as "Narrator" with checkbox
- Narrator has voice characteristics like other characters
- Narrator voice is voice-locked (consistent across all scenes)

### **2. Narrator Modes**
Two modes for narrator usage:

**Mode A: Narrator + Visual Scenes** (Default)
- Narrator speaks as voiceover
- Visual scenes play simultaneously
- Characters perform actions but don't speak
- Narrator describes what's happening

**Mode B: Narrator Only**
- Only narrator speaks
- Visual scenes shown but no character dialogue
- Purely narration-driven storytelling

### **3. Auto-Detection**
- System detects narrator text in script
- Identifies narrator blocks (e.g., "Narrator:", descriptive text)
- Separates narrator text from character dialogue
- Assigns narrator text to narrator character

### **4. Voice Consistency**
- Narrator voice locked across all scenes
- Same voice characteristics in every scene
- Voice Anchor Block for narrator
- Consistent with other characters

---

## 🎨 **UI Implementation**

### **Frontend Changes Required**

#### **1. Character Modal - Add Narrator Checkbox**

**Location**: After character name field

**Code to Add**:
```jsx
<div style={{ 
    marginBottom: '24px', 
    padding: '16px', 
    background: 'rgba(255, 193, 7, 0.1)', 
    border: '2px solid rgba(255, 193, 7, 0.3)', 
    borderRadius: '12px' 
}}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
        <input
            type="checkbox"
            checked={isNarrator}
            onChange={(e) => setIsNarrator(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
        <div>
            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)' }}>
                🎙️ This is a Narrator / Voiceover
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>
                Narrator voice will play as background voiceover while scenes are shown visually
            </p>
        </div>
    </label>
</div>
```

**State Variable**:
```jsx
const [isNarrator, setIsNarrator] = useState(false);
```

**Save to Character**:
```jsx
{
    ...characterData,
    is_narrator: isNarrator
}
```

---

#### **2. Narrator Mode Selection**

**Location**: In Background Visual Style section or new section

**Code to Add**:
```jsx
<div style={{ marginTop: '20px' }}>
    <label className="input-label">🎙️ Narrator Mode</label>
    <select
        className="input-field"
        value={narratorMode}
        onChange={(e) => setNarratorMode(e.target.value)}
        style={{ cursor: 'pointer', maxWidth: '500px' }}
    >
        <option value="narrator_with_visuals">Narrator + Visual Scenes (Default)</option>
        <option value="narrator_only">Narrator Only (Voiceover Driven)</option>
    </select>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '8px' }}>
        Choose how narrator interacts with visual scenes
    </p>
</div>
```

**State Variable**:
```jsx
const [narratorMode, setNarratorMode] = useState('narrator_with_visuals');
```

---

## 🔧 **Backend Implementation**

### **1. Script Breaking with Narrator Detection**

**File**: `backend/veo_prompt_generator/services/gemini.py`

**Function**: `break_script_into_scenes`

**Enhancement**:
```python
async def break_script_into_scenes(story_text: str, characters: dict, narrator_mode: str = "narrator_with_visuals"):
    """
    Break script into scenes with narrator detection
    
    Args:
        story_text: Raw story text
        characters: Character data including narrator
        narrator_mode: "narrator_with_visuals" or "narrator_only"
    """
    
    # Find narrator character
    narrator = None
    for char_name, char_data in characters.items():
        if char_data.get("is_narrator", False):
            narrator = char_name
            break
    
    # Build prompt for scene breaking
    system_prompt = f"""
    Break this story into 8-second scenes.
    
    NARRATOR DETECTION:
    - Narrator character: {narrator if narrator else "None"}
    - Narrator mode: {narrator_mode}
    
    RULES:
    1. Identify narrator text (descriptive text, scene descriptions)
    2. Identify character dialogue (spoken by characters)
    3. Separate narrator narration from character speech
    
    For each scene, provide:
    - scene_number
    - description (visual description)
    - narrator_text (what narrator says, if any)
    - characters (list of characters with their dialogue)
    - camera_angle
    - transition_type
    
    If narrator_mode is "narrator_only":
    - Characters don't speak
    - Only narrator narrates
    - Visual scenes show actions
    
    If narrator_mode is "narrator_with_visuals":
    - Narrator provides voiceover
    - Characters can also speak
    - Both narrator and character dialogue present
    
    Story:
    {story_text}
    """
    
    # Call Gemini AI
    response = await gemini_service.generate_content(system_prompt)
    
    # Parse scenes with narrator text
    scenes = parse_scenes_with_narrator(response)
    
    return scenes
```

---

### **2. Prompt Generation with Narrator**

**File**: `backend/veo_prompt_generator/services/prompt_builder.py`

**Enhancement**:
```python
async def generate_final_prompt(project: dict, scene: dict):
    # ... existing code ...
    
    # Find narrator character
    narrator_char = None
    narrator_text = scene.get('narrator_text', '')
    
    for char_name, char_data in project_chars.items():
        if char_data.get("is_narrator", False):
            narrator_char = char_name
            break
    
    # Build narrator block if present
    narrator_block = ""
    if narrator_char and narrator_text:
        narrator_info = project_chars.get(narrator_char, {})
        
        # Build narrator Voice Anchor Block
        age_range = narrator_info.get("age_range", "")
        vocal_quality = narrator_info.get("vocal_quality", "")
        speaking_style = narrator_info.get("speaking_style", "")
        accent = narrator_info.get("accent", "")
        emotional_baseline = narrator_info.get("emotional_baseline", "")
        
        voice_parts = [f"{narrator_char}, a narrator"]
        if age_range:
            voice_parts.append(f"in their {age_range}")
        if vocal_quality:
            voice_parts.append(f"with a {vocal_quality}")
        if speaking_style:
            voice_parts.append(speaking_style)
        if accent:
            voice_parts.append(accent)
        if emotional_baseline:
            voice_parts.append(f"speaks with {emotional_baseline}")
        
        narrator_voice_anchor = ", ".join(voice_parts) + "."
        
        narrator_block = f"""
NARRATOR (VOICEOVER):
- Voice Anchor (MUST REMAIN IDENTICAL IN ALL SCENES): {narrator_voice_anchor}
- Narration Text: "{narrator_text}"
- This is BACKGROUND VOICEOVER - plays while visual scene is shown
- Narrator is NOT visually present in the scene
"""
    
    # Update system prompt to include narrator
    system_prompt = f"""Generate a technical prompt optimized for GOOGLE VEO 3.1.

TARGET: Google Veo 3.1 Video Generation
CHARACTER VISUAL STYLE: Defined per character
BACKGROUND/ENVIRONMENT VISUAL STYLE: {background_visual_style}
DURATION: {scene.get('duration', 8)} seconds

CURRENT SCENE DESCRIPTION:
{scene.get('description')}

{narrator_block}

CHARACTERS IN THIS SCENE:
{char_block}

NARRATOR INSTRUCTIONS:
- If narrator text is present, include it as VOICEOVER
- Narrator voice plays in background while visual scene is shown
- Use the exact Voice Anchor Block for narrator in every scene
- Characters in scene perform actions visually
- Narrator describes what's happening

... rest of system prompt ...
"""
    
    # Generate final prompt with Gemini
    final_prompt = await gemini_service.generate_content(system_prompt)
    
    return final_prompt
```

---

## 📝 **Example: Story with Narrator**

### **Input Story**:
```
🌄 Scene 1 – Morning by the Forest River

The sun is just rising. Soft golden light falls on tall green trees. 
Birds are chirping gently.

Near a quiet river, a poor woodcutter named Mohan is chopping wood.
His clothes are old but clean. Sweat shines on his forehead, but his 
face is peaceful.

Suddenly — clash!

His axe slips from his hand and falls straight into the deep flowing water.

Mohan freezes.

He bends near the river, looking into the moving water nervously.

Mohan (sadly):
"Oh no… that axe was the only thing I had to earn food."

He sits on a stone, head down, eyes filled with worry.
```

---

### **Character Setup**:

**Character 1: Mohan**
- Visual Style: Cinematic Photorealism
- Age Range: mid-30s
- Vocal Quality: weary but honest voice
- Speaking Style: slow and thoughtful
- Accent: neutral Indian accent
- Emotional Baseline: humble sincerity
- Is Narrator: ❌ No

**Character 2: Narrator**
- Visual Style: N/A (not visible)
- Age Range: early 50s
- Vocal Quality: warm, storytelling voice
- Speaking Style: calm and engaging tone
- Accent: neutral American accent
- Emotional Baseline: wise and comforting
- Is Narrator: ✅ Yes

---

### **Scene Breaking Result**:

**Scene 1**:
```json
{
    "scene_number": 1,
    "description": "Morning by a forest river. Golden sunlight filters through tall green trees. A poor woodcutter named Mohan chops wood near the riverbank.",
    "narrator_text": "The sun is just rising. Soft golden light falls on tall green trees. Birds are chirping gently. Near a quiet river, a poor woodcutter named Mohan is chopping wood. His clothes are old but clean. Sweat shines on his forehead, but his face is peaceful.",
    "characters": [
        {
            "name": "Mohan",
            "dialogue": "",
            "action": "chopping wood near the river"
        }
    ],
    "camera_angle": "Wide shot",
    "transition_type": "Fade in"
}
```

**Scene 2**:
```json
{
    "scene_number": 2,
    "description": "Mohan's axe slips and falls into the river. He freezes in shock.",
    "narrator_text": "Suddenly — clash! His axe slips from his hand and falls straight into the deep flowing water. Mohan freezes.",
    "characters": [
        {
            "name": "Mohan",
            "dialogue": "",
            "action": "drops axe, freezes in shock"
        }
    ],
    "camera_angle": "Close-up on hands and axe",
    "transition_type": "Cut"
}
```

**Scene 3**:
```json
{
    "scene_number": 3,
    "description": "Mohan bends near the river, looking into the water nervously, then sits on a stone with head down.",
    "narrator_text": "He bends near the river, looking into the moving water nervously.",
    "characters": [
        {
            "name": "Mohan",
            "dialogue": "Oh no… that axe was the only thing I had to earn food.",
            "action": "bends near river, then sits on stone looking worried"
        }
    ],
    "camera_angle": "Medium shot",
    "transition_type": "Cut"
}
```

---

### **Generated Veo Prompt (Scene 1)**:

```
BACKGROUND/ENVIRONMENT VISUAL STYLE: Cinematic Photorealism

NARRATOR (VOICEOVER):
- Voice Anchor: Narrator, a narrator in their early 50s, with a warm, storytelling voice, calm and engaging tone, neutral American accent, speaks with wise and comforting presence.
- Narration Text: "The sun is just rising. Soft golden light falls on tall green trees. Birds are chirping gently. Near a quiet river, a poor woodcutter named Mohan is chopping wood. His clothes are old but clean. Sweat shines on his forehead, but his face is peaceful."
- This is BACKGROUND VOICEOVER

CHARACTER: Mohan
- Visual Style: Cinematic Photorealism
- Visual Traits: Poor woodcutter, old but clean clothes, sweat on forehead, peaceful expression
- Voice Anchor: Mohan, a person in their mid-30s, with a weary but honest voice, slow and thoughtful tone, neutral Indian accent, speaks with humble sincerity.
- Action: chopping wood near the river
- Emotion: peaceful

---

Wide shot fades in, revealing a serene forest river at sunrise. Golden sunlight filters through tall green trees, casting dappled shadows on the forest floor. Birds chirp gently in the background. The river flows quietly, its surface reflecting the warm morning light.

Near the riverbank stands Mohan, a person in their mid-30s, with a weary but honest voice, slow and thoughtful tone, neutral Indian accent, speaks with humble sincerity. He is a poor woodcutter wearing old but clean clothes. Sweat glistens on his forehead as he rhythmically chops wood. His face shows peaceful concentration despite his humble circumstances. He is rendered in Cinematic Photorealism with natural skin tones, realistic fabric textures, and authentic lighting.

[VOICEOVER - Narrator, a narrator in their early 50s, with a warm, storytelling voice, calm and engaging tone, neutral American accent, speaks with wise and comforting presence, narrates:]
"The sun is just rising. Soft golden light falls on tall green trees. Birds are chirping gently. Near a quiet river, a poor woodcutter named Mohan is chopping wood. His clothes are old but clean. Sweat shines on his forehead, but his face is peaceful."

The environment is rendered in photorealistic style with detailed bark textures on trees, natural water flow, and volumetric lighting creating god rays through the canopy. Camera slowly pushes in on Mohan as he works. Ambient forest sounds and gentle river flow create peaceful atmosphere.
```

---

### **Generated Veo Prompt (Scene 3)**:

```
BACKGROUND/ENVIRONMENT VISUAL STYLE: Cinematic Photorealism

NARRATOR (VOICEOVER):
- Voice Anchor: Narrator, a narrator in their early 50s, with a warm, storytelling voice, calm and engaging tone, neutral American accent, speaks with wise and comforting presence.
- Narration Text: "He bends near the river, looking into the moving water nervously."
- This is BACKGROUND VOICEOVER

CHARACTER: Mohan
- Visual Style: Cinematic Photorealism
- Visual Traits: Poor woodcutter, old but clean clothes, worried expression
- Voice Anchor: Mohan, a person in their mid-30s, with a weary but honest voice, slow and thoughtful tone, neutral Indian accent, speaks with humble sincerity.
- Dialogue: "Oh no… that axe was the only thing I had to earn food."
- Action: bends near river, then sits on stone looking worried
- Emotion: worried, sad

---

Medium shot reveals Mohan, a person in their mid-30s, with a weary but honest voice, slow and thoughtful tone, neutral Indian accent, speaks with humble sincerity, bending near the riverbank. He peers into the moving water with a nervous, worried expression. His face shows deep concern as he searches for his lost axe.

[VOICEOVER - Narrator, a narrator in their early 50s, with a warm, storytelling voice, calm and engaging tone, neutral American accent, speaks with wise and comforting presence, narrates:]
"He bends near the river, looking into the moving water nervously."

Mohan slowly sits down on a nearby stone, his head dropping low. His eyes fill with worry and despair. He speaks sadly: "Oh no… that axe was the only thing I had to earn food." [TECHNICAL: Lip-sync active for Mohan]

The river continues to flow, indifferent to his plight. The forest environment is rendered in Cinematic Photorealism with natural lighting, realistic water reflections, and detailed stone textures. Camera holds on Mohan's worried face, capturing his emotional state. Soft ambient sounds of flowing water and distant birds.
```

---

## ✅ **Key Features**

### **1. Narrator Voice Consistency** ✅
- Voice Anchor Block for narrator
- IDENTICAL in every scene
- Same voice characteristics throughout

### **2. Narrator + Character Dialogue** ✅
- Narrator provides voiceover
- Characters can also speak
- Both voices present in scene

### **3. Visual Scene Continuity** ✅
- Narrator describes what's shown
- Characters perform actions
- Consistent visual style

### **4. Narrator-Only Mode** ✅
- Only narrator speaks
- Characters shown but silent
- Purely narration-driven

---

## 📊 **Implementation Checklist**

### **Frontend**:
- [ ] Add `isNarrator` state
- [ ] Add narrator checkbox in character modal
- [ ] Add `narratorMode` state
- [ ] Add narrator mode dropdown
- [ ] Save narrator flag with character
- [ ] Send narrator mode when breaking script

### **Backend**:
- [ ] Update `break_script_into_scenes` to detect narrator
- [ ] Separate narrator text from character dialogue
- [ ] Add `narrator_text` field to scenes
- [ ] Update `generate_final_prompt` to include narrator
- [ ] Build narrator Voice Anchor Block
- [ ] Include narrator voiceover in prompts

### **Testing**:
- [ ] Test with narrator character
- [ ] Test narrator + character dialogue
- [ ] Test narrator-only mode
- [ ] Test voice consistency
- [ ] Test with example story (Mohan & River Spirit)

---

## 🎉 **Expected Result**

**Users can**:
- ✅ Add narrator as character
- ✅ Mark character as narrator
- ✅ Define narrator voice characteristics
- ✅ Choose narrator mode
- ✅ Get narrator voiceover in prompts
- ✅ Maintain narrator voice consistency
- ✅ Combine narrator with character dialogue
- ✅ Create narration-driven stories

**System provides**:
- ✅ Auto-detection of narrator text
- ✅ Separation of narrator from dialogue
- ✅ Voice-locked narrator across scenes
- ✅ Professional voiceover prompts
- ✅ Consistent storytelling experience

---

## 📞 **Next Steps**

1. Implement frontend changes (checkbox, dropdown)
2. Implement backend narrator detection
3. Update prompt builder for narrator
4. Test with example story
5. Refine based on results

**This will enable professional narration-driven storytelling with perfect voice consistency!** 🎙️✨🎬
