# Code Refactoring Plan - Veo Prompt Generator

## Current Issues
1. **XML code remnants** in app.js causing syntax errors
2. **Monolithic app.js file** (1600+ lines) - hard to maintain
3. **Duplicate code** across different modes
4. **No clear separation** of concerns

## Proposed Clean Structure

```
frontend/
├── js/
│   ├── app.js                  # Main entry point & initialization
│   ├── story-mode.js           # Story mode logic
│   ├── vegetable-mode.js       # Talking vegetables logic  
│   ├── advertisement-mode.js   # Advertisement logic
│   ├── shared-utils.js         # Shared utilities
│   └── api-client.js           # API call handlers
├── index.html
└── css/
    └── styles.css
```

## Module Breakdown

### 1. **app.js** (Main Entry - ~200 lines)
- Scene memory management
- Mode switching
- UI initialization
- Image upload handling
- Gemini image analysis

### 2. **story-mode.js** (~300 lines)
- `generatePrompt()` - Main story generation
- Character management
- Lip sync data generation
- Story-specific prompt building

### 3. **vegetable-mode.js** (~250 lines)
- `generateVegetablePrompt()` - Vegetable scene generation
- `nextVegPart()` - Scene progression
- Emotion/topic logic
- Vegetable-specific prompts

### 4. **advertisement-mode.js** (~200 lines)
- `generateAdvertisementPrompt()` - Ad scene generation
- `nextAdScene()` - Scene progression
- Ingredient extraction logic
- Ad-specific prompts

### 5. **shared-utils.js** (~150 lines)
```javascript
// API Formatting
- formatPromptForProvider(systemPrompt, userPrompt, geminiKey, hfKey)

// API Calls
- callGenerateAPI(prompt, model, token, provider)

// UI Updates
- displayGeneratedPrompt(text)
- updateNextSceneButton(currentScene, totalScenes, buttonId)
- showStatus(message, type)

// Validation
- validateAPIKeys()
```

### 6. **api-client.js** (~100 lines)
```javascript
- async function callGenerateAPI(prompt, model, token, provider)
- async function analyzeImageWithGemini(imageData, apiKey)
- function handleAPIError(error)
```

## Benefits of This Structure

### ✅ **Maintainability**
- Each file has a single responsibility
- Easy to find and fix bugs
- Clear code organization

### ✅ **Readability**
- Well-documented functions
- Logical grouping
- Consistent naming conventions

### ✅ **Reusability**
- Shared utilities prevent code duplication
- Easy to add new modes
- Common patterns extracted

### ✅ **Debugging**
- Easier to isolate issues
- Clear error messages
- Better stack traces

## Implementation Steps

### Step 1: Fix Current Syntax Errors
- Remove all XML remnants from app.js
- Fix unterminated template literals
- Ensure all functions are properly closed

### Step 2: Extract Shared Utilities
- Create `shared-utils.js`
- Move common functions
- Update references in app.js

### Step 3: Extract Mode-Specific Code
- Create `story-mode.js`
- Create `vegetable-mode.js`  
- Create `advertisement-mode.js`
- Move respective functions

### Step 4: Create API Client
- Create `api-client.js`
- Centralize all API calls
- Add error handling

### Step 5: Update HTML
- Add script tags for new modules
- Maintain correct load order
- Test all functionality

## File Loading Order in index.html

```html
<!-- Load in this exact order -->
<script src="js/shared-utils.js"></script>
<script src="js/api-client.js"></script>
<script src="js/story-mode.js"></script>
<script src="js/vegetable-mode.js"></script>
<script src="js/advertisement-mode.js"></script>
<script src="js/app.js"></script> <!-- Main entry last -->
```

## Next Actions

Would you like me to:
1. **Fix the current syntax errors first** (quick fix)
2. **Implement the full refactoring** (clean, professional solution)
3. **Create a hybrid approach** (fix errors + partial refactoring)

The full refactoring will take some time but will result in much cleaner, more maintainable code.
