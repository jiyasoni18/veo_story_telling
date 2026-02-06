# VEO Video Prompt Generator - Project Specification

## 1. Executive Summary
VEO is a full-stack platform designed to automate and enhance the creation of prompts for Google's Veo AI video generation. It bridges the gap between raw scripts and technical prompts by leveraging Gemini 2.5 Flash for scene breaking, character analysis, and prompt engineering.

## 2. System Architecture

### Frontend
- **Framework**: React 18 (Vite)
- **Navigation**: React Router DOM
- **State Management**: React Context API
- **Styling**: Modern CSS (Modules or Tailwind as requested)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (via Motor async driver)
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini 2.5 Flash API

## 3. Functional Modules

### A. Storytelling Mode
- **Script Analysis**: Automatic breaking of long stories into 8-second scenes.
- **Character Persistence**: Global character library per project to ensure visual consistency.
- **Narrative Context**: Scene-to-scene memory to maintain plot continuity.

### B. Talking Character Mode
- **Template-Based**: Quick selection of characters (e.g., Apple, Carrot).
- **Topic Generation**: Auto-generation of benefits or side effects in multiple languages (Hindi/English).

### C. UGC / Advertisement (Future)
- Product-centric prompt generation for marketing videos.

## 4. Data Models

### Project
- `project_id`, `user_id`, `name`, `type`, `characters` (Array), `settings`, `created_at`.

### Scene
- `scene_id`, `project_id`, `scene_number`, `description`, `characters_in_scene` (Overrides), `generated_prompt`, `story_context`.

### User
- `user_id`, `email`, `password_hash`, `api_keys` (Encrypted).

## 5. Implementation Roadmap

### Phase 1: Foundation
- Auth system and Project CRUD.

### Phase 2: AI Core
- Script breaking and character analysis logic.

### Phase 3: Prompt Engine
- Multi-scene generation and continuity management.

### Phase 4: Polish
- Advanced UI/UX and mobile responsiveness.

---
**Related Documents:**
- [Project Constitution](./Constitution.md)
- [VEO_COMPLETE_GUIDE](../../VEO_COMPLETE_GUIDE.md)
