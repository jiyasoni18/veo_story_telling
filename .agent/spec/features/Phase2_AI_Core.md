# Feature Specification: Phase 2 - AI Core Integration (Gemini-Only)

## 1. Objective
Integrate Google Gemini 2.5 Flash as the sole AI provider to handle character analysis and script breaking, ensuring project-level character consistency.

## 2. Technical Strategy
- **Gemini Service**: Create a dedicated service class for interacting with Gemini API.
- **Vision Integration**: Implement character analysis from images using Gemini 2.5 Flash to extract 12 key visual traits.
- **Script Breaker**: Implement logic to split long stories into optimal 8-second video scenes with identified characters and dialogue.
- **Character Storage**: Store character profiles at the `project` level in MongoDB to allow re-use across all scenes.

## 3. Impact Assessment
- **Files Modified**: 
  - `backend/app/main.py` (Register routers)
  - `backend/app/models/project.py` (Update character schema)
- **New Files**:
  - `backend/app/services/gemini.py` (Gemini API handling)
  - `backend/app/api/v1/endpoints/ai.py` (AI endpoints)
- **Database Changes**: The `projects` collection will now store a `characters` map with detailed visual traits.

## 4. API Endpoints (Phase 2)
### AI Operations
- `POST /api/v1/ai/analyze-character`: Send base64 image → Get visual traits JSON.
- `POST /api/v1/ai/break-script`: Send full text → Get list of scene objects.

## 5. Success Criteria
1.  Frontend can send a base64 image and receive a structured JSON of character traits.
2.  Backend can take a long story and return a JSON structure compatible with the `Scene` model.
3.  Character data is persisted correctly at the project level.

---
*Related Tasks: Implementation Plan (Next Step)*
