# Talking Veggies Update: Health & Multi-Scene

## ✅ Feature Updated

### 🎯 What Was Changed

The **Talking Veggies** project type has been significantly upgraded to match the robust **Educational Content Generator** logic.

---

## 📋 New Requirements Implemented

1.  **Topic of Speech**: Now a **Dropdown** with 2 options:
    - 💚 **Health Benefit** (Friendly tone)
    - ⚠️ **Side Effect** (Angry/Warning tone)

2.  **Duration**: Added **Dropdown** with scene splitting:
    - 8s (1 Scene)
    - 16s (2 Scenes)
    - 24s (3 Scenes)
    - ... up to 56s

3.  **Removed Fields**:
    - ❌ Personality (Replaced by automatic Tone based on Topic) (User can still override Tone)

4.  **Scene Navigation**:
    - Added **Next / Previous** buttons to navigate through generated scenes.

5.  **Output Format**:
    - Full structured format with Visual Prompt, Dialogue, Metadata, Audio, and Lip Sync.

---

## 🎨 Interface Changes

### **Configuration Panel:**

```
[Character Name]  (e.g., Sugar)

[Topic Type]
( ) Health Benefit    (•) Side Effect

[Language]            [Voice Tone]
(Hindi)               (Angry / Warning)

[Duration]
(24 seconds (3 Scenes))

[GENERATE SCENES]
```

### **Output Panel:**

```
✨ Generated Scene
Scene 2 of 3   [< Prev]   [Next >]

Visual Prompt:
...

Dialogue (HINDI):
...

[SCENE METADATA]
...

[Copy Scene Prompt]
```

---

## 🔧 Technical Details

- **Frontend**: Updated `TalkingVeggiesProject.jsx` to use the new form fields and scene navigation state.
- **Backend Integration**: Switched API call to `/api/v1/educational/generate-prompt` to leverage the multi-scene logic and structured output.
- **Scene Handling**: Frontend now stores an array of scenes and displays them one by one, allowing the user to copy them individually.

---

## 🚀 How to Use

1.  Create a **Talking Veggies** project.
2.  Enter **Character Name** (e.g., "Sugar").
3.  Select **Topic** (e.g., "Side Effect" -> Auto-selects "Angry").
4.  Select **Duration** (e.g., "24 seconds").
5.  Click **Generate Scenes**.
6.  Use **Next/Prev** buttons to view Scene 1, Scene 2, Scene 3.
7.  Copy each scene prompt to Veo!

**This provides a consistent, high-quality prompting experience for character-driven health content!** 🎬🥦
