# Project Constitution

## 📜 Mission Statement
To provide a seamless, AI-powered experience for generating high-quality video prompts for Google's Veo platform, ensuring narrative consistency and creative flexibility.

## 🛠️ Core Principles

### 1. Spec-Driven Development
- Every major feature must be documented in the Project Spec before implementation.
- The Specification is the "Single Source of Truth."
- AI Agents must refer to the Spec before suggesting or making changes.

### 2. Character Consistency
- Character traits (Visual & Audio) are immutable at the project level.
- Dynamic attributes (Emotion, Costume, Action) are scene-specific.
- Always prioritize maintaining the "identity" of the character across scenes.

### 3. AI First, Gemini Only
- Use Google Gemini (2.5 Flash) for all AI operations.
- Avoid multi-provider complexity.
- Optimize prompts for the highest quality extraction and generation.

### 4. Code Quality & Maintainability
- **Clean Code**: Follow PEP 8 for Python and ESLint/Prettier standards for React/JS.
- **Modularity**: Components and backend logic should be decoupled and reusable.
- **Explicit over Implicit**: Prefer clear, readable logic over "clever" but obscure code.

### 5. Seamless UX/UI
- Prioritize "Wow" aesthetics.
- Use modern typography, gradients, and smooth transitions.
- Ensure the interface is responsive and intuitive.

## 🚫 Governance & Constraints
- **No Placeholders**: Never use placeholder images or text in production.
- **Security**: Never commit API keys or sensitive secrets. Use `.env`.
- **Validation**: All user inputs must be validated on both frontend and backend.

## 🔄 Evolutionary Process
This Constitution is a living document. It can be updated as the project scales, but changes must be deliberate and reflected across the entire specification suite.
