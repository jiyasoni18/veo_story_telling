# Step-by-Step Refactoring Guide

## IMMEDIATE FIX: Remove Syntax Errors

### Step 1: Fix app.js Line 1556
**Location:** `frontend/js/app.js` around line 1556

**Find this broken code:**
```javascript
let finalPrompt = `<|system|>${systemPrompt}</s>

const response = await fetch('http://localhost:5001/generate', {
```

**Replace with:**
```javascript
let finalPrompt = `<|system|>${systemPrompt}</s>
