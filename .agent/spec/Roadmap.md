# Project Roadmap

This roadmap tracks the high-level implementation phases for the VEO Video Prompt Generator.

## 🏁 Phase 1: Foundation (Current Priority)
Goals: Establish the core architecture and user authentication.

- [ ] **Infrastructure**: FastAPI & React project structure.
- [ ] **Database**: MongoDB connection and initial collections (`users`, `projects`).
- [ ] **Authentication**: JWT-based login, signup, and protected routes.
- [ ] **State**: Centralized AuthContext for the frontend.

## 🧠 Phase 2: AI Core Integration
Goals: Connect Gemini 2.5 Flash and implement core prompt logic.

- [ ] **Gemini Client**: Secure API integration on the backend.
- [ ] **Vision**: Character image analysis and trait extraction.
- [ ] **Text Analytics**: Script breathing logic (splitting long text into 8s scenes).
- [ ] **Storage**: Saving character profiles at the project level.

## 🎬 Phase 3: Storytelling Engine
Goals: Build the multi-scene prompt builder.

- [ ] **Scene Management**: CRUD for individual scenes within projects.
- [ ] **Continuity Memory**: Logic to summarize previous scenes for the next prompt.
- [ ] **Prompt Engineering**: The final engine that combines traits + emotion + context.

## 🗣️ Phase 4: Talking Character Mode
Goals: Implement the standalone character video mode.

- [ ] **Templates**: Pre-defined characters (Apple, Carrot, etc.).
- [ ] **Dialogue Gen**: Benefit/Side-effect logic in Hindi/English.
- [ ] **UI**: Simplified 1-page generator for quick content.

## ✨ Phase 5: Polish & UX
Goals: "Wow" the user with aesthetics.

- [ ] **Styling**: Global CSS cleanup, gradients, and micro-animations.
- [ ] **Errors**: User-friendly handling for API timeouts or invalid inputs.
- [ ] **UGC Preview**: Landing page/UI for the upcoming Advertisement mode.

---
*Last Updated: 2026-02-03*
