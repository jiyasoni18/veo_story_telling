# Task: Working Prototype Baseline Artifact

This document serves as a "Source of Truth" for the current functional state of the VEO Video Prompt Generator (Prototype v1). It encapsulates the logic found in `backend/app.py`, `frontend/index.html`, and `VEO_COMPLETE_GUIDE.md`.

## 📦 Current Project State

### 1. Functional Core
- **Storytelling Mode**: Multi-scene narrative generation with 8-second segments.
- **Talking Character Mode**: Quick prompt generation for animated characters (Apple, Carrot, etc.).
- **Advertisement Mode**: Product-focused scene generation.
- **Character Consistency**: Manual preservation of character traits via "Consistency Rules" and "Stored Character Data" in MongoDB.
- **Gemini Integration**: 
    - **Vision**: Analyzes uploaded character images to extract 12 parameters (skin tone, eyes, clothing, etc.).
    - **Prompt Gen**: Uses Gemini 2.5 Flash to generate technical prompts for Google Veo.

### 2. Technical Stack (Current)
- **Backend**: Flask (running on port 5001).
- **Frontend**: Vanilla HTML/JS/CSS (using standard `<script>` tags).
- **Database**: MongoDB (single collection `user_data` in `veo_prompt_generator` DB).
- **External APIs**: Google Gemini (Direct REST calls), Hugging Face (Optional backup).

### 3. Key Data Structures
- **Story Document**:
    ```json
    {
      "title": "Story Title",
      "scenes": [
        {
          "scene_number": 1,
          "description": "...",
          "generated_prompt": "...",
          "characters": { "name": { "traits": "..." } }
        }
      ],
      "last_updated": "datetime"
    }
    ```

## 🛠️ Logic Snapshots

### Character Consistency (Frontend to Backend)
- **Problem**: How to keep characters looking the same?
- **Current Solution**: 
  1. User uploads image.
  2. Gemini analyzes it into a detailed text paragraph.
  3. This description is saved in the scene.
  4. Subsequent scenes fetch the "latest" character data from MongoDB via `/api/memory` and pre-fill the form.

### Prompt Construction Strategy
The system builds prompts by concatenating:
- **Visual Style** (Photorealistic, 3D, etc.)
- **Character Traits** (from Gemini analysis)
- **Consistency Rules** (manual overrides)
- **Scene Details** (Action, Lighting, Time)

## 🎯 Task Objective (Integrated from User Request)
- **Maintain working features**: Ensure "Talking Vegetables" and "Story Mode" logic is preserved during the transition to FastAPI + React.
- **Reference Guide**: Continuous alignment with `VEO_COMPLETE_GUIDE.md` for architectural target.

## 📂 Artifacts Included
- `c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\app.py` (Flask Logic)
- `c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\frontend\index.html` (UI Layout)
- `c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\VEO_COMPLETE_GUIDE.md` (Design Spec)

---
*Created by Antigravity on 2026-02-03*
