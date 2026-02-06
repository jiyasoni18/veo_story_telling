# Feature Specification: Phase 3 - Storytelling Engine & Scene Management

## 1. Objective
Implement the logic for creating and managing individual scenes within a project, ensuring narrative continuity and consistent prompt generation across the entire story.

## 2. Technical Strategy
- **Scene Storage**: Scenes will be stored as individual documents in a dedicated `scenes` collection, linked via `project_id`.
- **Scene Continuity**: Implement "Story Context" memory. When generating a prompt for Scene N, the system will summarize Scenes 1 to N-1.
- **Dynamic Overrides**: Allow characters to have scene-specific attributes (Emotion, Costume, Action) while maintaining their project-level visual traits.
- **Prompt Engineering**: Technical generator that combines:
    - Global Visual Style.
    - Character Persistent Traits.
    - Scene Overrides.
    - Story Context.

## 3. Impact Assessment
- **Files Modified**:
  - `backend/app/main.py` (Register scenes router).
- **New Files**:
  - `backend/app/models/scene.py` (Scene schema).
  - `backend/app/api/v1/endpoints/scenes.py` (CRUD for scenes).
  - `backend/app/services/prompt_builder.py` (Prompt concatenation logic).

## 4. API Endpoints (Phase 3)
### Scene Management
- `GET /api/v1/projects/:id/scenes`: List all scenes in order.
- `POST /api/v1/projects/:id/scenes`: Add a new scene (manual or via script-breaker).
- `PUT /api/v1/scenes/:id`: Update scene details.
- `DELETE /api/v1/scenes/:id`: Remove a scene.

### Prompt Generation
- `POST /api/v1/ai/generate-scene-prompt`: Build the final prompt for a specific scene using context memory.

## 5. Success Criteria
1.  A user can add multiple scenes to a project.
2.  Generated prompts for later scenes mention "Continuing from [Previous Scene Context]".
3.  Character consistency is maintained even if they change costumes/emotions between scenes.

---
*Related Tasks: Phase 3 Implementation Plan*
