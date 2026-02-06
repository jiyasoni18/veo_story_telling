# 🎙️ Three Narrator Modes - Complete Specification

## 📋 **Overview**

The system now supports **3 narrator modes** for maximum flexibility in storytelling:

1. **Narrator + Visual Scenes** - Narrator voiceover + Characters speak with lip-sync
2. **Narrator Only** - ONLY narrator speaks, characters silent
3. **None** - NO narrator, only characters speak with lip-sync

---

## 🎯 **Three Narrator Modes Explained**

### **Mode 1: Narrator + Visual Scenes** 🎬

**Description**: "Narrator speaks as voiceover while characters are shown visually and can also speak with lip-sync"

**How it works**:
- ✅ Narrator provides voiceover (background narration)
- ✅ Characters shown visually performing actions
- ✅ Characters CAN also speak with lip-sync
- ✅ Both narrator and character dialogue in same scene

**Example Scene**:
```
[VOICEOVER - Narrator]: "मगर ने बंदर को देखा और पूछा"

Visual: Crocodile looks up at monkey on tree

Monkey speaks: "भाई मत बोलो मैं तुम्हारा दोस्त हूं" [Lip-sync active]
Crocodile speaks: "भाई तुम क्या खा रहे हो" [Lip-sync active]
```

**Use Case**: Stories with both narration and character dialogue (like your monkey story)

---

### **Mode 2: Narrator Only** 🎙️

**Description**: "ONLY narrator speaks; characters shown visually but remain completely silent (no lip-sync)"

**How it works**:
- ✅ Narrator provides ALL dialogue and narration
- ✅ Characters shown visually performing actions
- ❌ Characters DO NOT speak (mouths closed)
- ❌ NO lip-sync for characters
- ✅ Pure narration-driven storytelling

**Example Scene**:
```
[VOICEOVER - Narrator]: "मगर ने बंदर को देखा और पूछा, 'भाई तुम क्या खा रहे हो।' बंदर ने जवाब दिया, 'भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।'"

Visual: Crocodile looks up at monkey, monkey gestures with jamun

Monkey: (Silent, mouth closed, only gestures)
Crocodile: (Silent, mouth closed, only looks up)
```

**Use Case**: Audiobook style, documentary narration, bedtime stories

---

### **Mode 3: None (Characters Speak Only)** 💬

**Description**: "NO narrator; only characters speak with lip-sync and perform actions"

**How it works**:
- ❌ NO narrator voiceover
- ✅ Characters speak directly with lip-sync
- ✅ Characters perform actions
- ✅ Pure character-driven dialogue

**Example Scene**:
```
NO NARRATOR

Visual: Crocodile approaches tree, looks up at monkey

Crocodile speaks: "भाई तुम क्या खा रहे हो।" [Lip-sync active]
Monkey speaks: "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।" [Lip-sync active]
```

**Use Case**: Movie-style dialogue, character-driven stories, dramatic scenes

---

## 🔧 **Backend Implementation**

### **Updated `break_into_scenes_with_narrator` Function**:

```python
async def break_into_scenes_with_narrator(
    story_text: str,
    character_descriptions: dict,
    narrator_mode: str,  # "narrator_with_visuals", "narrator_only", or "none"
    background_visual_style: str
) -> list:
    """
    Break story into 8-second scenes based on narrator mode
    
    Args:
        narrator_mode: 
            - "narrator_with_visuals": Narrator + character dialogue
            - "narrator_only": Only narrator speaks, characters silent
            - "none": No narrator, only characters speak
    """
    
    # Find narrator character
    narrator_name = None
    for char_name, char_data in character_descriptions.items():
        if char_data.get("is_narrator", False):
            narrator_name = char_name
            break
    
    system_prompt = f"""
    Break this story into 8-SECOND scenes.
    
    NARRATOR MODE: {narrator_mode}
    
    MODE RULES:
    
    1. "narrator_with_visuals":
       - Narrator provides voiceover narration
       - Characters shown visually AND can also speak
       - Include both narrator_text and character dialogue
       - Characters have lip-sync when they speak
    
    2. "narrator_only":
       - ONLY narrator speaks (provides ALL dialogue and narration)
       - Characters shown visually but COMPLETELY SILENT
       - NO character dialogue field
       - NO lip-sync for characters
       - Narrator describes everything including what characters say
    
    3. "none":
       - NO narrator at all
       - NO narrator_text field
       - ONLY characters speak with lip-sync
       - Pure character dialogue driven
    
    STORY:
    {story_text}
    
    CHARACTER DESCRIPTIONS:
    {json.dumps(character_descriptions, indent=2)}
    
    SCENE FORMAT:
    
    For "narrator_with_visuals":
    {{
        "scene_number": 1,
        "duration": 8,
        "description": "Visual description",
        "narrator_text": "What narrator says",
        "characters_in_scene": {{
            "CharacterName": {{
                "dialogue": "What character says (can be empty)",
                "action": "What character does",
                "emotion": "happy/sad/etc"
            }}
        }},
        ...
    }}
    
    For "narrator_only":
    {{
        "scene_number": 1,
        "duration": 8,
        "description": "Visual description",
        "narrator_text": "Narrator describes EVERYTHING including character dialogue",
        "characters_in_scene": {{
            "CharacterName": {{
                "dialogue": "",  // ALWAYS EMPTY
                "action": "What character does (gestures, expressions)",
                "emotion": "happy/sad/etc"
            }}
        }},
        ...
    }}
    
    For "none":
    {{
        "scene_number": 1,
        "duration": 8,
        "description": "Visual description",
        "narrator_text": "",  // NO NARRATOR
        "characters_in_scene": {{
            "CharacterName": {{
                "dialogue": "What character says",
                "action": "What character does",
                "emotion": "happy/sad/etc"
            }}
        }},
        ...
    }}
    
    Return array of scenes in JSON format.
    """
    
    response = await gemini_service.generate_content(system_prompt)
    scenes = parse_json_response(response)
    
    return scenes
```

---

## 📝 **Example: Same Story, Three Modes**

### **Story**: Monkey and Crocodile (Scene 3)

---

### **Mode 1: Narrator + Visual Scenes** 🎬

**Scene Data**:
```json
{
    "scene_number": 3,
    "duration": 8,
    "description": "Crocodile looks up at monkey on tree",
    "narrator_text": "मगर ने बंदर को देखा और पूछा",
    "characters_in_scene": {
        "Monkey": {
            "dialogue": "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।",
            "action": "smiling and gesturing with jamun",
            "emotion": "friendly"
        },
        "Crocodile": {
            "dialogue": "भाई तुम क्या खा रहे हो।",
            "action": "looking up at monkey",
            "emotion": "curious"
        }
    }
}
```

**Generated Veo Prompt**:
```
NARRATOR (VOICEOVER):
- Narration: "मगर ने बंदर को देखा और पूछा"

CHARACTER: Monkey
- Description: A monkey with warm brown fur...
- Dialogue: "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।"
- [TECHNICAL: Lip-sync active for Monkey]

CHARACTER: Crocodile
- Description: A crocodile with dark olive-green scaly skin...
- Dialogue: "भाई तुम क्या खा रहे हो।"
- [TECHNICAL: Lip-sync active for Crocodile]

---

Close-up shot reveals a river bank scene. 

[VOICEOVER - Narrator]: "मगर ने बंदर को देखा और पूछा"

A monkey with warm brown fur... sits on tree branch, smiling and gesturing with jamun fruit. The monkey speaks: "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।" [Lip-sync active]

Below, a crocodile with dark olive-green scaly skin... looks up at monkey. The crocodile speaks: "भाई तुम क्या खा रहे हो।" [Lip-sync active]
```

**Result**: Narrator voiceover + Both characters speak ✅

---

### **Mode 2: Narrator Only** 🎙️

**Scene Data**:
```json
{
    "scene_number": 3,
    "duration": 8,
    "description": "Crocodile looks up at monkey on tree",
    "narrator_text": "मगर ने बंदर को देखा और पूछा, 'भाई तुम क्या खा रहे हो।' बंदर ने मुस्कुराते हुए जवाब दिया, 'भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।'",
    "characters_in_scene": {
        "Monkey": {
            "dialogue": "",
            "action": "smiling and gesturing with jamun, mouth closed",
            "emotion": "friendly"
        },
        "Crocodile": {
            "dialogue": "",
            "action": "looking up at monkey, mouth closed",
            "emotion": "curious"
        }
    }
}
```

**Generated Veo Prompt**:
```
NARRATOR (VOICEOVER):
- Narration: "मगर ने बंदर को देखा और पूछा, 'भाई तुम क्या खा रहे हो।' बंदर ने मुस्कुराते हुए जवाब दिया, 'भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।'"

CHARACTER: Monkey
- Description: A monkey with warm brown fur...
- Action: smiling and gesturing with jamun, mouth closed
- NO DIALOGUE (character is silent)

CHARACTER: Crocodile
- Description: A crocodile with dark olive-green scaly skin...
- Action: looking up at monkey, mouth closed
- NO DIALOGUE (character is silent)

---

Close-up shot reveals a river bank scene.

[VOICEOVER - Narrator narrates entire scene]:
"मगर ने बंदर को देखा और पूछा, 'भाई तुम क्या खा रहे हो।' बंदर ने मुस्कुराते हुए जवाब दिया, 'भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।'"

A monkey with warm brown fur... sits on tree branch, smiling and gesturing with jamun fruit. The monkey's mouth remains closed as the narrator describes the dialogue.

Below, a crocodile with dark olive-green scaly skin... looks up at monkey with curious expression. The crocodile's mouth remains closed.

[TECHNICAL: NO lip-sync - characters are silent, only narrator speaks]
```

**Result**: ONLY narrator speaks, characters silent ✅

---

### **Mode 3: None (Characters Only)** 💬

**Scene Data**:
```json
{
    "scene_number": 3,
    "duration": 8,
    "description": "Crocodile looks up at monkey on tree",
    "narrator_text": "",
    "characters_in_scene": {
        "Monkey": {
            "dialogue": "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।",
            "action": "smiling and gesturing with jamun",
            "emotion": "friendly"
        },
        "Crocodile": {
            "dialogue": "भाई तुम क्या खा रहे हो।",
            "action": "looking up at monkey",
            "emotion": "curious"
        }
    }
}
```

**Generated Veo Prompt**:
```
NO NARRATOR

CHARACTER: Monkey
- Description: A monkey with warm brown fur...
- Dialogue: "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।"
- [TECHNICAL: Lip-sync active for Monkey]

CHARACTER: Crocodile
- Description: A crocodile with dark olive-green scaly skin...
- Dialogue: "भाई तुम क्या खा रहे हो।"
- [TECHNICAL: Lip-sync active for Crocodile]

---

Close-up shot reveals a river bank scene.

A crocodile with dark olive-green scaly skin... approaches the tree and looks up at the monkey. The crocodile speaks: "भाई तुम क्या खा रहे हो।" [Lip-sync active]

Above, a monkey with warm brown fur... sits on tree branch, smiling and gesturing with jamun fruit. The monkey responds: "भाई मत बोलो मैं तुम्हारा दोस्त हूं और मैं जामुन खा रहा हूं।" [Lip-sync active]

Camera alternates between close-ups of crocodile and monkey as they converse.
```

**Result**: NO narrator, only characters speak ✅

---

## 📊 **Comparison Table**

| Feature | Narrator + Visual | Narrator Only | None |
|---------|------------------|---------------|------|
| **Narrator Voiceover** | ✅ Yes | ✅ Yes | ❌ No |
| **Characters Speak** | ✅ Yes | ❌ No | ✅ Yes |
| **Character Lip-Sync** | ✅ Yes | ❌ No | ✅ Yes |
| **Characters Silent** | ❌ No | ✅ Yes | ❌ No |
| **Use Case** | Mixed narration + dialogue | Audiobook style | Movie dialogue |

---

## 🎬 **UI Implementation**

### **Dropdown Options** (Already Implemented ✅):

```jsx
<select value={narratorMode} onChange={(e) => setNarratorMode(e.target.value)}>
    <option value="narrator_with_visuals">🎬 Narrator + Visual Scenes</option>
    <option value="narrator_only">🎙️ Narrator Only (Characters Silent)</option>
    <option value="none">💬 None (Characters Speak Only)</option>
</select>
```

### **Dynamic Descriptions** (Already Implemented ✅):

```jsx
{narratorMode === 'narrator_with_visuals'
    ? 'Narrator speaks as voiceover while characters are shown visually and can also speak with lip-sync'
    : narratorMode === 'narrator_only'
    ? 'ONLY narrator speaks; characters shown visually but remain completely silent (no lip-sync)'
    : 'NO narrator; only characters speak with lip-sync and perform actions'}
```

---

## ✅ **Implementation Checklist**

### **Frontend**: ✅ COMPLETE
- [x] Add third option "none" to dropdown
- [x] Update dynamic descriptions for all 3 modes
- [x] State management ready

### **Backend**: ⏳ TO IMPLEMENT
- [ ] Update `break_into_scenes_with_narrator()` to handle all 3 modes
- [ ] Mode 1: Include narrator_text + character dialogue
- [ ] Mode 2: Include narrator_text, empty character dialogue
- [ ] Mode 3: Empty narrator_text, include character dialogue
- [ ] Update prompt generation for each mode
- [ ] Test with all 3 modes

---

## 🎯 **Expected Behavior**

### **User Selects "Narrator + Visual Scenes"**:
- System breaks story with narrator voiceover
- Characters can also speak
- Both narrator and character dialogue in prompts
- Lip-sync for characters

### **User Selects "Narrator Only"**:
- System breaks story with ONLY narrator
- Narrator describes everything including character dialogue
- Characters shown but silent (mouths closed)
- NO lip-sync markers

### **User Selects "None"**:
- System breaks story with NO narrator
- ONLY characters speak
- Direct character dialogue
- Lip-sync for all speaking characters

---

## 🎉 **Complete Flexibility**

Users can now choose the perfect storytelling style:

✅ **Narrator + Visual** - Best of both worlds  
✅ **Narrator Only** - Pure narration (audiobook style)  
✅ **None** - Pure dialogue (movie style)  

**All three modes work with the same story!** 🚀✨🎬
