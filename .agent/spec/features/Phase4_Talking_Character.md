# Feature Specification: Phase 4 - Talking Character Mode

## 1. Objective
Implement a specialized mode for generating quick, educational, and fun personality-driven videos of talking vegetables or characters, highlighting their health benefits or side effects in multiple languages.

## 2. Technical Strategy
- **Template System**: Define a set of "Character Personalities" (e.g., "Grumpy Broccoli", "Wise Apple") to make the AI output more consistent.
- **Personality Prompts**: Use specific system prompts to guide Gemini in generating dialogue that matches the character's "vibe."
- **Language Support**: Explicitly support Hindi and English outputs with proper transliteration where needed.
- **Dynamic Scenarios**: Allow users to specify a topic (Benefits vs. Side Effects) which changes the narrative direction of the prompt.

## 3. Impact Assessment
- **Files Modified**:
  - `backend/app/api/v1/endpoints/ai.py` (Add specialized prompt endpoint).
  - `backend/app/services/gemini.py` (Add Talking Character logic).
- **New Files**:
  - `frontend-react/src/pages/TalkingCharacter.jsx` (New UI).

## 4. API Endpoints (Phase 4)
- `POST /api/v1/ai/generate-talking-character`: 
  - Input: `character_type`, `topic`, `language`, `personality`.
  - Output: Refined Veo prompt with lip-sync and dialogue cues.

## 5. Success Criteria
1.  AI generates dialogue specifically in the chosen language (Hindi/English).
2.  The prompt includes instructions for "Lip-sync synchronized with dialogue."
3.  The "Benefit" vs "Side Effect" logic correctly steers the content of the dialogue.

---
*Related Tasks: Phase 4 Implementation Plan*
