// ============================================
// ADVERTISEMENT MODE MODULE
// Handles product advertisement prompt generation
// ============================================

/**
 * Generates an 8-second advertisement scene prompt
 * @returns {Promise<void>}
 */
async function generateAdvertisementPrompt() {
    const productName = document.getElementById('adProductName').value.trim();
    const productDesc = document.getElementById('adProductDesc').value.trim();
    const style = document.getElementById('adStyle').value;
    const totalScenes = parseInt(document.getElementById('adDuration').value);
    const sceneNum = document.getElementById('adSceneNum').value;

    // Validation
    if (!productName) {
        showStatus('Please enter a product name!', 'error');
        return;
    }

    // Reset UI
    document.getElementById('btnNextAdScene').style.display = 'none';
    document.getElementById('outputPlaceholder').style.display = 'none';
    document.getElementById('outputText').classList.remove('visible');
    document.getElementById('loading').classList.add('visible');
    document.getElementById('copyBtn').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('veoBtn').style.display = 'none';

    try {
        const model = document.getElementById('modelSelect').value;

        // Build scene-specific context
        const sceneContext = buildAdSceneContext(sceneNum, totalScenes);

        // Build prompts
        const systemPrompt = buildAdSystemPrompt(productName, sceneNum, totalScenes, sceneContext, style);
        const userPrompt = buildAdUserPrompt(productName, productDesc, sceneNum, totalScenes, style);

        // Get API credentials
        const geminiKey = document.getElementById('geminiKey').value.trim();
        const hfKey = document.getElementById('apiKey').value.trim();

        // Format prompt based on provider
        const { finalPrompt, token, provider } = formatPromptForProvider(
            systemPrompt,
            userPrompt,
            geminiKey,
            hfKey
        );

        if (!token) {
            showStatus('Please enter either a Gemini API Key or Hugging Face Token!', 'error');
            toggleApiSettings();
            document.getElementById('loading').classList.remove('visible');
            return;
        }

        // Call API
        const generatedPrompt = await callGenerateAPI(finalPrompt, model, token, provider);

        // Display results
        displayGeneratedPrompt(generatedPrompt);

        // Handle "Next Scene" button
        updateNextSceneButton(sceneNum, totalScenes, 'btnNextAdScene');

        showStatus(`📺 Advertisement Scene ${sceneNum}/${totalScenes} Generated!`, 'success');
        document.getElementById('outputCard').scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').classList.remove('visible');
        document.getElementById('outputPlaceholder').style.display = 'block';
        showStatus(`Error: ${error.message}`, 'error');
    }
}

/**
 * Advances to the next advertisement scene
 */
function nextAdScene() {
    const sceneSelect = document.getElementById('adSceneNum');
    const totalScenes = parseInt(document.getElementById('adDuration').value);
    let current = parseInt(sceneSelect.value);

    if (current < totalScenes) {
        current++;

        // Add option if it doesn't exist
        if (!sceneSelect.querySelector(`option[value="${current}"]`)) {
            const opt = document.createElement("option");
            opt.value = current;
            opt.text = `Scene ${current}`;
            sceneSelect.add(opt);
        }

        sceneSelect.value = current.toString();
        generateAdvertisementPrompt();
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Builds scene-specific context based on scene number
 */
function buildAdSceneContext(sceneNum, totalScenes) {
    if (sceneNum === "1") {
        return `SCENE 1 of ${totalScenes} (OPENING). 
        Content: Product reveal with ingredients appearing around it. Establish the premium visual composition.
        Focus: Center the product, introduce key ingredients in orbit.`;
    } else if (sceneNum == totalScenes) {
        return `SCENE ${sceneNum} of ${totalScenes} (CLOSING). 
        Content: Final product shot with all benefits highlighted. Strong call-to-action.
        Focus: Product prominence, tagline display, brand message.`;
    } else {
        return `SCENE ${sceneNum} of ${totalScenes} (INGREDIENT SPOTLIGHT). 
        Content: Highlight specific ingredients and their benefits. Smooth camera movement around product.
        Focus: Individual ingredient close-ups with benefit callouts.`;
    }
}

/**
 * Builds the system prompt for advertisement generation
 */
function buildAdSystemPrompt(productName, sceneNum, totalScenes, sceneContext, style) {
    return `You are an expert product advertisement scriptwriter and visual director.

Task: Create Scene ${sceneNum} of ${totalScenes} for a product advertisement video for "${productName}".

${sceneContext}

ADVERTISEMENT STRUCTURE:
1. Extract/Identify the key ingredients or components of the product.
2. Create a visual composition showing:
   - The product in the CENTER (hero shot, prominently displayed)
   - Key ingredients/components arranged in a CIRCLE or ORBIT around the product
   - Each ingredient should be clearly visible with its name labeled
   - Visual connections (glowing lines, particles, or energy flows) from ingredients to the product

VISUAL STYLE: ${style}
Aspect Ratio: 9:16 (Vertical)
Duration: 8 seconds (STRICT)

CRITICAL REQUIREMENTS:
1. Extract SPECIFIC ingredients from the product name/description.
2. For each ingredient, provide a SPECIFIC health benefit.
3. The composition should feel PREMIUM, SCIENTIFIC, and TRUSTWORTHY.
4. Use smooth camera movements (slow 360° rotation around product, gentle zoom, ingredient spotlight sequences).
5. Background should be clean and professional (white studio, soft gradient, or nature-inspired).
6. Lighting should be cinematic with soft shadows and highlights on the product.

TRANSITION/CONTINUITY:
- Scene 1: Establish the product and ingredient layout
- Scene 2+: Smoothly continue from previous scene (camera continues rotating, ingredients remain visible)
- NEVER abruptly cut. Show smooth camera movement and scene flow.

OUTPUT FORMAT:
Visual Prompt: [Detailed 8-second scene description with camera movements, lighting, and ingredient arrangement]

Ingredient Focus (for this scene):
- [Ingredient highlighted in this scene]: [Specific Health Benefit]

Text Overlays:
- Product Name: "${productName}"
${sceneNum == totalScenes ? '- Tagline: [Create compelling tagline]' : ''}
- Benefit Callout: [Key benefit for this scene]

Scene Metadata:
Duration: 8 seconds
Scene: ${sceneNum}/${totalScenes}
Aspect Ratio: 9:16
`;
}

/**
 * Builds the user prompt for advertisement generation
 */
function buildAdUserPrompt(productName, productDesc, sceneNum, totalScenes, style) {
    return `Product: ${productName}
${productDesc ? `Description: ${productDesc}` : ''}
Scene: ${sceneNum} of ${totalScenes}
Visual Style: ${style}

Generate Scene ${sceneNum} for this advertisement. Each scene is 8 seconds.
${sceneNum === "1" ? 'This is the opening - introduce the product and ingredients.' : ''}
${sceneNum == totalScenes ? 'This is the closing - final product shot with call-to-action.' : ''}

Intelligently extract ingredients based on the product type and create a premium, scientific visual.`;
}
