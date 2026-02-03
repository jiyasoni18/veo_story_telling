// Scene memory with consistency rules
let sceneMemory = {
    enabled: true,
    characters: {},
    setting: '',
    lighting: '',
    timeOfDay: '',
    currentSceneDescription: '',
    lastGeneratedPrompt: '',
    storyContext: ''
};

let uploadedImages = {
    primary: null,
    secondary: null
};

// Load/save memory (Database Version)
async function loadMemory() {
    try {
        const response = await fetch('http://localhost:5001/api/memory');
        if (!response.ok) throw new Error('Failed to load memory from DB');

        const data = await response.json();

        if (data) {
            sceneMemory = data; // Note: Loading essentially resets session to the snapshot state
            if (!sceneMemory.storyContext) sceneMemory.storyContext = ''; // Ensure field exists


            // Populate basic fields
            if (data.storyTitle) document.getElementById('storyTitle').value = data.storyTitle;
            if (data.sceneNumber) document.getElementById('sceneNumber').value = data.sceneNumber;

            updateMemoryDisplay();

            // Sync UI toggle with loaded state
            const toggle = document.getElementById('continuityToggle');
            if (sceneMemory.enabled) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    } catch (error) {
        console.error('Error loading memory:', error);
        showStatus('⚠️ Could not connect to Database. Is backend running?', 'warning');
    }
}

async function saveMemory(specificData = null) {
    // If specific data is provided, use it (for scoped history snapshots)
    // Otherwise use the global session memory
    const payload = specificData || sceneMemory;

    try {
        const response = await fetch('http://localhost:5001/api/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to save');

        if (result.storyContext) {
            sceneMemory.storyContext = result.storyContext;
            console.log('Story context updated from DB');
        }

        updateMemoryDisplay();
        console.log('Memory saved to DB');
    } catch (error) {
        console.error('Error saving memory:', error);
        showStatus('⚠️ Failed to save consistency data to DB', 'error');
    }
}

async function clearMemory() {
    if (confirm('Clear all character data from Database? This cannot be undone.')) {
        try {
            const response = await fetch('http://localhost:5001/api/reset', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to reset');

            sceneMemory = {
                enabled: true,
                characters: {},
                setting: '',
                lighting: '',
                timeOfDay: ''
            };
            uploadedImages = { primary: null, secondary: null };

            updateMemoryDisplay();
            showStatus('All character data cleared from Database!', 'success');
        } catch (error) {
            console.error(error);
            showStatus('Error clearing database', 'error');
        }
    }
}

function updateMemoryDisplay() {
    const box = document.getElementById('sceneMemoryBox');
    const content = document.getElementById('memoryContent');

    if (Object.keys(sceneMemory.characters).length > 0) {
        box.style.display = 'block';

        let html = '';
        Object.keys(sceneMemory.characters).forEach(charName => {
            const char = sceneMemory.characters[charName];
            html += `<div class="memory-item">
                <strong style="color: var(--primary);">${charName}</strong><br>
                <span class="memory-label">Voice:</span> ${char.voice}<br>
                <span class="memory-label">Consistency Rules:</span> ${char.consistencyRules ? char.consistencyRules.split('\n').length + ' rules' : 'None'}<br>
                <span class="memory-label">Description:</span> ${char.description ? char.description.substring(0, 80) + '...' : 'None'}
            </div>`;
        });

        content.innerHTML = html;
    } else {
        box.style.display = 'none';
    }
}

function toggleContinuity() {
    const toggle = document.getElementById('continuityToggle');
    sceneMemory.enabled = !sceneMemory.enabled;

    if (sceneMemory.enabled) {
        toggle.classList.add('active');
        showStatus('Consistency Mode ENABLED!', 'success');
    } else {
        toggle.classList.remove('active');
        showStatus('Consistency Mode DISABLED.', 'warning');
    }

    saveMemory();
}

// Counter for extra characters
let extraCharCount = 0;

function addCharacter() {
    extraCharCount++;
    const charId = `extra_char_${extraCharCount}`;
    const container = document.getElementById('extraCharactersContainer');

    const html = `
        <div class="collapsible-section" id="section_${charId}">
            <div class="collapsible-header" onclick="toggleSection(this)">
                <span class="collapsible-title">👤 Character ${extraCharCount + 2} (Optional)</span>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="btn-small" style="color: var(--error); cursor: pointer;" onclick="removeCharacter('${charId}', event)">🗑️</span>
                    <span class="collapsible-toggle">▼</span>
                </div>
            </div>
            <div class="collapsible-content">
                <div class="form-group">
                    <label class="form-label">🎨 Visual Style / Character Type</label>
                    <select id="${charId}_visualStyle" class="form-select">
                        <option value="Cinematic Photorealism">📸 Photorealistic / Cinematic (Default)</option>
                        <option value="3D Animation (Pixar/Disney Style)">🧸 3D Animation (Pixar/Disney Style)</option>
                        <option value="2D Anime Style">🎌 2D Anime / Manga Style</option>
                        <option value="Digital AI Avatar">🤖 Digital Avatar / AI Character</option>
                        <option value="Cyberpunk/Futuristic">🌃 Cyberpunk / Futuristic</option>
                        <option value="Oil Painting Art Style">🎨 Oil Painting / Artistic</option>
                        <option value="Vintage Film (1950s)">🎞️ Vintage Film Look</option>
                    </select>
                </div>
                <!-- Image Upload -->
                <div class="form-group">
                    <label class="form-label">📸 Upload Character Image</label>
                    <div class="image-upload-container" id="${charId}ImageContainer" onclick="document.getElementById('${charId}ImageInput').click()">
                        <img id="${charId}ImagePreview" class="image-preview" alt="Character preview">
                        <div id="${charId}UploadText">
                            <div class="upload-icon">📷</div>
                            <div class="upload-text">Click to upload character image</div>
                            <div class="upload-text" style="font-size: 0.8rem; margin-top: 0.25rem;">Gemini AI will analyze</div>
                        </div>
                    </div>
                    <input type="file" id="${charId}ImageInput" accept="image/*" onchange="handleImageUpload('${charId}')">
                    <button class="btn btn-small" id="${charId}AnalyzeBtn" onclick="analyzeImage('${charId}')" style="display: none; margin-top: 0.5rem;">
                        🔮 Analyze with Gemini
                    </button>
                </div>

                <div class="form-group">
                    <label class="form-label">Character Name</label>
                    <input type="text" id="${charId}_name" class="form-input" placeholder="e.g., General">
                </div>

                <div class="form-group">
                    <label class="form-label">🎤 Voice Type</label>
                    <select id="${charId}_voice" class="form-select">
                        <option value="deep_male">Deep Male Voice</option>
                        <option value="medium_male">Medium Male Voice</option>
                        <option value="soft_male">Soft/Young Male Voice</option>
                        <option value="deep_female">Deep Female Voice</option>
                        <option value="medium_female">Medium Female Voice</option>
                        <option value="soft_female">Soft/Young Female Voice</option>
                        <option value="elderly">Elderly Voice</option>
                        <option value="divine">Divine/Ethereal Voice</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Character Description</label>
                    <textarea id="${charId}_description" class="form-textarea form-char-desc" 
                              placeholder="Will be auto-filled by Gemini or type manually"
                              rows="2"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">🔒 Consistency Rules</label>
                    <textarea id="${charId}_consistency" class="form-textarea" 
                              placeholder="Fixed attributes for this character"
                              rows="2"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">💬 Dialogue</label>
                    <textarea id="${charId}_dialogue" class="form-textarea" 
                              placeholder="Dialogue"
                              rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Emotion/Delivery</label>
                    <select id="${charId}_emotion" class="form-select">
                        <option value="neutral">Neutral/Calm</option>
                        <option value="angry">Angry</option>
                        <option value="happy">Happy</option>
                        <option value="sad">Sad</option>
                        <option value="surprised">Surprised</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = html;
    container.appendChild(div);

    // Initialize upload state
    uploadedImages[charId] = null;
}

function removeCharacter(charId, event) {
    event.stopPropagation();
    const section = document.getElementById(`section_${charId}`);
    if (section) {
        section.remove();
        delete uploadedImages[charId];
    }
}

// Store current scene
function storeCurrentScene(formData, generatedPromptText = null) {
    if (!sceneMemory.enabled) return;

    // Store primary character
    if (formData.primaryChar) {
        sceneMemory.characters[formData.primaryChar] = {
            description: formData.charDescription || '',
            voice: formData.primaryVoice || 'medium_male',
            consistencyRules: formData.primaryConsistencyRules || '',
            imageBase64: uploadedImages.primary || ''
        };
    }

    // Store secondary character
    if (formData.secondaryChar && formData.secondaryCharDescription) {
        sceneMemory.characters[formData.secondaryChar] = {
            description: formData.secondaryCharDescription || '',
            voice: formData.secondaryVoice || 'medium_male',
            consistencyRules: formData.secondaryConsistencyRules || '',
            imageBase64: uploadedImages.secondary || ''
        };
    }

    if (formData.setting) sceneMemory.setting = formData.setting;
    if (formData.lighting) sceneMemory.lighting = formData.lighting;
    if (formData.timeOfDay) sceneMemory.timeOfDay = formData.timeOfDay;

    // Store metadata about this specific generation
    if (formData.sceneDescription) sceneMemory.currentSceneDescription = formData.sceneDescription;
    if (generatedPromptText) sceneMemory.lastGeneratedPrompt = generatedPromptText;

    // Store extra characters in memory
    if (formData.extraCharacters) {
        formData.extraCharacters.forEach(char => {
            if (char.name) {
                sceneMemory.characters[char.name] = {
                    description: char.description || '',
                    voice: char.voice || 'medium_male',
                    consistencyRules: char.consistency || '',
                    imageBase64: ''
                };
            }
        });
    }

    // 2. Create Scoped Snapshot for Database (Strictly relevant to this prompt)
    const activeCharNames = new Set();
    if (formData.primaryChar) activeCharNames.add(formData.primaryChar);
    if (formData.secondaryChar) activeCharNames.add(formData.secondaryChar);
    if (formData.extraCharacters) {
        formData.extraCharacters.forEach(c => {
            if (c.name) activeCharNames.add(c.name);
        });
    }

    const scopedCharacters = {};
    activeCharNames.forEach(name => {
        if (sceneMemory.characters[name]) {
            scopedCharacters[name] = sceneMemory.characters[name];
        }
    });

    const snapshotData = {
        enabled: sceneMemory.enabled,
        storyTitle: document.getElementById('storyTitle') ? document.getElementById('storyTitle').value : '',
        sceneNumber: document.getElementById('sceneNumber') ? document.getElementById('sceneNumber').value : '1',
        currentSceneDescription: formData.sceneDescription || '',
        lastGeneratedPrompt: generatedPromptText || '',
        setting: formData.setting || '',
        lighting: formData.lighting || '',
        timeOfDay: formData.timeOfDay || '',
        characters: scopedCharacters // ONLY saving active characters
    };

    saveMemory(snapshotData);
}

// UI functions
function toggleSection(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.collapsible-toggle');

    content.classList.toggle('open');
    toggle.classList.toggle('open');
}

function toggleApiSettings() {
    const content = document.getElementById('apiContent');
    const icon = document.getElementById('apiToggleIcon');

    content.classList.toggle('open');
    icon.textContent = content.classList.contains('open') ? '▲' : '▼';
}

// Image upload handling
function handleImageUpload(type) {
    const input = document.getElementById(`${type}ImageInput`);
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Store image
            uploadedImages[type] = e.target.result;

            // Show preview
            const preview = document.getElementById(`${type}ImagePreview`);
            preview.src = e.target.result;
            preview.classList.add('visible');

            // Update container
            const container = document.getElementById(`${type}ImageContainer`);
            container.classList.add('has-image');

            // Hide upload text
            document.getElementById(`${type}UploadText`).style.display = 'none';

            // Show analyze button
            document.getElementById(`${type}AnalyzeBtn`).style.display = 'inline-flex';

            showStatus('Image uploaded! Click "Analyze with Gemini" to generate description.', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// AI Image Analysis with Gemini
async function analyzeImage(type) {
    const geminiKey = document.getElementById('geminiKey').value.trim();

    if (!geminiKey) {
        showStatus('Please enter your Google Gemini API key first! Get it free at: aistudio.google.com/app/apikey', 'error');
        toggleApiSettings();
        return;
    }

    if (!uploadedImages[type]) {
        showStatus('Please upload an image first!', 'error');
        return;
    }

    const analyzeBtn = document.getElementById(`${type}AnalyzeBtn`);
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🔄 Analyzing with Gemini...';

    try {
        const response = await fetch('http://localhost:5001/analyze_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gemini_key: geminiKey,
                image: uploadedImages[type]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            let errorMsg = data.error || 'Analysis failed';

            // Handle specific Gemini errors
            if (errorMsg.includes('API_KEY_INVALID')) {
                errorMsg = 'Invalid Gemini API key. Please check your key at aistudio.google.com/app/apikey';
            } else if (errorMsg.includes('PERMISSION_DENIED')) {
                errorMsg = 'Gemini API not enabled. Visit console.cloud.google.com to enable it.';
            } else if (errorMsg.includes('QUOTA_EXCEEDED')) {
                errorMsg = 'Daily quota exceeded (1500 free requests). Try again tomorrow.';
            }

            throw new Error(errorMsg);
        }

        const description = data.description || 'No description generated';
        const visualStyle = data.visual_style || 'Cinematic Photorealism';

        // Fill description field
        let descField;
        if (type === 'primary') {
            descField = 'charDescription';
        } else if (type === 'secondary') {
            descField = 'secondaryCharDescription';
        } else {
            descField = `${type}_description`;
        }

        const descElement = document.getElementById(descField);
        if (descElement) {
            descElement.value = description;
        }

        // Auto-set visual style dropdown based on detected style
        if (visualStyle) {
            let selectId;
            if (type === 'primary') {
                selectId = 'visualStyle';
            } else if (type === 'secondary') {
                selectId = 'secondaryVisualStyle';
            } else {
                selectId = `${type}_visualStyle`;
            }

            const visualStyleSelect = document.getElementById(selectId);

            // Map detected style to dropdown options
            const styleMapping = {
                'Cinematic Photorealism': 'Cinematic Photorealism',
                '3D Animation (Pixar/Disney Style)': '3D Animation (Pixar/Disney Style)',
                '2D Anime Style': '2D Anime Style',
                'Digital AI Avatar': 'Digital AI Avatar',
                'Cyberpunk/Futuristic': 'Cyberpunk/Futuristic',
                'Oil Painting Art Style': 'Oil Painting Art Style',
                'Vintage Film (1950s)': 'Vintage Film (1950s)'
            };

            // Find matching option or use closest match
            let matchedStyle = styleMapping[visualStyle] || 'Cinematic Photorealism';

            // Try partial matching if exact match not found
            if (!styleMapping[visualStyle]) {
                for (const [key, value] of Object.entries(styleMapping)) {
                    if (visualStyle.toLowerCase().includes(key.toLowerCase()) ||
                        key.toLowerCase().includes(visualStyle.toLowerCase())) {
                        matchedStyle = value;
                        break;
                    }
                }
            }

            if (visualStyleSelect) {
                visualStyleSelect.value = matchedStyle;
            }

            showStatus(`✨ Gemini analysis complete! Detected style: ${visualStyle}`, 'success');
        } else {
            showStatus(`✨ Gemini analysis complete! Description added.`, 'success');
        }

    } catch (error) {
        console.error('Error:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔮 Analyze with Gemini';
    }
}

// Helper to generating Lip Sync Data JSON
function generateLipSyncData(formData) {
    let entries = [];
    let currentTime = 0;
    const avgSecPerChar = 0.08; // Roughly 12 chars per second
    const minDuration = 2;

    function processDialogue(text, speakerId, voiceParams, isNarrator = false) {
        if (!text) return;

        // Split by major punctuation or newlines
        // Regex looks for periods, question marks, exclamation marks, hindi danda (|)
        const sentences = text.split(/([?!.|।\n]+)/).filter(Boolean);
        let currentChunk = "";

        // Re-assemble into chunks
        for (let i = 0; i < sentences.length; i++) {
            let part = sentences[i].trim();
            if (!part) continue;

            // If it's just punctuation, append to current chunk and push
            if (/^[?!.|।\n]+$/.test(part)) {
                currentChunk += part;
                // End of chunk
                if (currentChunk.trim()) {
                    addEntry(currentChunk, speakerId, voiceParams, isNarrator);
                    currentChunk = "";
                }
            } else {
                // It's text
                if (currentChunk.length > 50) { // If current chunk is already long, push it
                    addEntry(currentChunk, speakerId, voiceParams, isNarrator);
                    currentChunk = part;
                } else {
                    currentChunk += (currentChunk ? " " : "") + part;
                }
            }
        }
        if (currentChunk.trim()) {
            addEntry(currentChunk, speakerId, voiceParams, isNarrator);
        }
    }

    function addEntry(text, speakerId, voiceParams, isNarrator) {
        // Calculate duration
        let duration = Math.max(minDuration, Math.ceil(text.length * avgSecPerChar));
        let startTime = currentTime;
        let endTime = currentTime + duration;
        currentTime = endTime;

        let voiceType = voiceParams.voice || 'neutral';
        // Swap deep_male to male_deep if needed
        if (voiceType.includes('_')) {
            const parts = voiceType.split('_');
            if (parts.length === 2) {
                voiceType = `${parts[1]}_${parts[0]}`;
            }
        }

        let voiceId = isNarrator
            ? `narrator_${voiceParams.gender || 'neutral'}_01`
            : `${speakerId}_${voiceType}_01`;

        // Sanitize IDs
        voiceId = voiceId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        let cleanSpeakerId = speakerId.toLowerCase().replace(/[^a-z0-9_]/g, '_');

        let entry = {
            "time": `${startTime}s-${endTime}s`,
            "speaker_id": cleanSpeakerId,
            "voice_id": voiceId,
            "lip_sync_target": isNarrator ? null : `${cleanSpeakerId}_face_mesh`,
            "viseme_mode": isNarrator ? undefined : "accurate", // Only for characters
            "text": text
        };

        // Remove undefined keys
        if (isNarrator) delete entry.viseme_mode;

        entries.push(entry);
    }

    // 1. Primary Character
    if (formData.primaryDialogue) {
        processDialogue(formData.primaryDialogue,
            formData.primaryChar || 'primary_character',
            { voice: formData.primaryVoice });
    }

    // 2. Secondary Character
    if (formData.secondaryDialogue) {
        processDialogue(formData.secondaryDialogue,
            formData.secondaryChar || 'secondary_character',
            { voice: formData.secondaryVoice });
    }

    // 3. Extra Characters
    if (formData.extraCharacters) {
        formData.extraCharacters.forEach((char, index) => {
            if (char.dialogue) {
                processDialogue(char.dialogue,
                    char.name || `character_${index + 3}`,
                    { voice: char.voice });
            }
        });
    }

    // 4. Narrator
    if (formData.narratorText) {
        processDialogue(formData.narratorText,
            'narrator',
            { gender: formData.narratorGender, tone: formData.narratorTone },
            true);
    }

    return entries.map(e =>
        `${e.time}
Speaker: ${e.speaker_id}
Voice ID: ${e.voice_id}
Lip Sync Target: ${e.lip_sync_target || 'None'}
Text: "${e.text}"`).join('\n\n');
}

// Main generate function
async function generatePrompt() {
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!apiKey) {
        showStatus('Please enter your Hugging Face API token!', 'error');
        toggleApiSettings();
        return;
    }

    // Validation: Story Title is REQUIRED for generation
    const storyTitleVal = document.getElementById('storyTitle') ? document.getElementById('storyTitle').value.trim() : '';
    if (!storyTitleVal) {
        showStatus('⚠️ Story Title is REQUIRED to generate a prompt!', 'error');
        return;
    }

    // Get form data
    const formData = {
        sceneDescription: document.getElementById('sceneDescription').value,
        duration: document.getElementById('duration').value,
        sceneNumber: document.getElementById('sceneNumber').value,
        sceneType: document.getElementById('sceneType').value,
        visualStyle: document.getElementById('visualStyle').value,
        primaryChar: document.getElementById('primaryChar').value,
        charDescription: document.getElementById('charDescription').value,
        primaryVoice: document.getElementById('primaryVoice').value,
        primaryConsistencyRules: document.getElementById('primaryConsistencyRules').value,
        primaryDialogue: document.getElementById('primaryDialogue').value,
        primaryEmotion: document.getElementById('primaryEmotion').value,
        secondaryChar: document.getElementById('secondaryChar').value,
        secondaryCharDescription: document.getElementById('secondaryCharDescription').value,
        secondaryVoice: document.getElementById('secondaryVoice').value,
        secondaryConsistencyRules: document.getElementById('secondaryConsistencyRules').value,
        secondaryDialogue: document.getElementById('secondaryDialogue').value,
        secondaryEmotion: document.getElementById('secondaryEmotion').value,
        extraCharacters: [],
        narratorGender: document.getElementById('narratorGender').value,
        narratorTone: document.getElementById('narratorTone').value,
        narratorText: document.getElementById('narratorText').value,
        setting: document.getElementById('setting').value,
        timeOfDay: document.getElementById('timeOfDay').value,
        lighting: document.getElementById('lighting').value,
        storyTitle: document.getElementById('storyTitle') ? document.getElementById('storyTitle').value : ''
    };


    // Collect extra characters data
    for (let i = 1; i <= extraCharCount; i++) {
        const charId = `extra_char_${i}`;
        const nameInput = document.getElementById(`${charId}_name`);

        // Only include if element exists (wasn't deleted)
        if (nameInput) {
            formData.extraCharacters.push({
                name: nameInput.value,
                description: document.getElementById(`${charId}_description`).value,
                voice: document.getElementById(`${charId}_voice`).value,
                consistency: document.getElementById(`${charId}_consistency`).value,
                dialogue: document.getElementById(`${charId}_dialogue`).value,
                emotion: document.getElementById(`${charId}_emotion`).value
            });
        }
    }

    if (!formData.sceneDescription) {
        showStatus('Please fill in Scene Description!', 'error');
        return;
    }

    // Build consistency instructions
    let consistencyInstructions = '';
    if (sceneMemory.enabled && Object.keys(sceneMemory.characters).length > 0) {
        consistencyInstructions = `\n\nCRITICAL CONSISTENCY ENFORCEMENT:\n`;

        Object.keys(sceneMemory.characters).forEach(charName => {
            const char = sceneMemory.characters[charName];
            consistencyInstructions += `\n${charName}:\n`;
            consistencyInstructions += `Description: ${char.description}\n`;
            consistencyInstructions += `Voice: ${char.voice}\n`;
            if (char.consistencyRules) {
                consistencyInstructions += `FIXED ATTRIBUTES (NEVER CHANGE):\n${char.consistencyRules}\n`;
            }
        });

        consistencyInstructions += `\n⚠️ THESE ATTRIBUTES MUST REMAIN IDENTICAL IN ALL SCENES!\n`;
    }

    // Build extra characters string
    let extraCharsPrompt = '';
    formData.extraCharacters.forEach((char, index) => {
        if (char.name || char.description) {
            extraCharsPrompt += `\nCHARACTER ${index + 3}:\n`;
            extraCharsPrompt += `Name: ${char.name || 'Unknown'}\n`;
            extraCharsPrompt += `Description: ${char.description || 'None'}\n`;
            extraCharsPrompt += `Voice: ${char.voice}\n`;
            extraCharsPrompt += `Consistency Rules: ${char.consistency || 'None'}\n`;
            extraCharsPrompt += `Dialogue: ${char.dialogue || 'None'}\n`;
            extraCharsPrompt += `Emotion: ${char.emotion}\n`;
        }
    });

    // Transition logic
    const transitionMap = {
        'dialogue': 'SEAMLESS CONTINUE - No transition, scene flows naturally from previous',
        'scene_change': 'FADE TO BLACK - Scene ends with 2sec fade to black, next begins with fade in',
        'action': 'SEAMLESS CONTINUE - Continuous action sequence'
    };
    const transitionInst = transitionMap[formData.sceneType];

    // Show loading
    document.getElementById('outputPlaceholder').style.display = 'none';
    document.getElementById('outputText').classList.remove('visible');
    document.getElementById('loading').classList.add('visible');
    document.getElementById('copyBtn').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('veoBtn').style.display = 'none';

    try {
        const model = document.getElementById('modelSelect').value;

        const systemPrompt = `You are an expert Veo 3 prompt generator. Create detailed prompts with STRICT character consistency and visual style adherence.

Structure:
[SCENE METADATA]
Duration: 8 seconds (STRICT LIMIT) | Scene: {number}

[GLOBAL AUDIO RULE]
Narrator voice must always remain off-screen and never attach to any character or face mesh.
Lip-sync must be strictly applied ONLY to the speaking character. When the Narrator speaks, NO character lips should move.

[VISUAL STYLE]
{Enforce the selected visual style throughout the entire scene}

[CHARACTER SETUP]
{Include full character details with voice type and consistency rules}

[ENVIRONMENT]
{Setting, lighting, time}

[SHOT SPECIFICATION]
{Detailed camera angles (Wide, Medium, Close-up) synced with timestamp}

[VISUAL FOCUS & TIMELINE]
{Provide a granular second-by-second breakdown (e.g., 00.00 - 00.03: Description) of the scene action, camera movement, and character blocking. MAXIMUM 8 SECONDS.}

[DIALOGUE & AUDIO]
{Character dialogues with voice type and lip-sync targets}

[NARRATOR]
{Voiceover details - OFF SCREEN ONLY}

[CHARACTER EMOTION]
{Emotions and body language}

[TECHNICAL]
1080p | 16:9 | 24fps

${consistencyInstructions}

CRITICAL: 
1. Follow consistency rules EXACTLY. Never deviate from fixed attributes.
2. ENFORCE the visual style in EVERY aspect of the scene - characters, environment, lighting, and overall aesthetic.
3. The visual style must be consistent across all scenes in the story.
4. NARRATOR IS ALWAYS OFF-SCREEN.
5. STRICT TIMING: The entire scene MUST fit within 8 seconds. Timeline must end by 00:08.`;

        const userPrompt = `Scene: ${formData.sceneDescription}
Duration: 8 seconds (Strict Limit)
Type: ${formData.sceneType}

VISUAL STYLE: ${formData.visualStyle}
⚠️ CRITICAL: ALL elements (characters, environment, props, lighting) MUST match this visual style!

[GLOBAL AUDIO RULE]
Narrator voice must always remain off-screen and never attach to any character or face mesh.

The generated script and timeline MUST NOT exceed 8 seconds. All action must conclude by 00:08.

[PREVIOUS STORY CONTEXT]
${sceneMemory.storyContext || 'No previous scenes.'}
Use this context to ensure smooth continuity from previous scenes.


PRIMARY CHARACTER:
Name: ${formData.primaryChar || 'Not specified'}
Description: ${formData.charDescription || 'Use stored'}
Voice: ${formData.primaryVoice}
Consistency Rules: ${formData.primaryConsistencyRules || 'None'}
Dialogue: ${formData.primaryDialogue || 'None'}
Emotion: ${formData.primaryEmotion}

SECONDARY CHARACTER:
Name: ${formData.secondaryChar || 'None'}
Description: ${formData.secondaryCharDescription || 'None'}
Voice: ${formData.secondaryVoice || 'N/A'}
Consistency Rules: ${formData.secondaryConsistencyRules || 'None'}
Dialogue: ${formData.secondaryDialogue || 'None'}
${extraCharsPrompt}
NARRATOR / VOICEOVER:
Text: ${formData.narratorText || 'None'}
Voice Gender: ${formData.narratorGender}
Voice Tone: ${formData.narratorTone}

[TIMELINE & LIP SYNC DATA]
${generateLipSyncData(formData)}

ENVIRONMENT:
Setting: ${formData.setting || sceneMemory.setting || 'Appropriate'}
Lighting: ${formData.lighting}
Time: ${formData.timeOfDay}

TRANSITION: ${transitionInst}

Generate complete Veo 3 prompt with PERFECT consistency and ${formData.visualStyle} visual style.
Ensure the [VISUAL FOCUS & TIMELINE] provides a specific breakdown like "00.00 - 00.03: Description..." with detailed camera angles (e.g., Low angle, Dutch tilt, Close-up) for each segment.
STRICTLY END TIMELINE AT 00:08.`;

        // Call backend
        const response = await fetch('http://localhost:5001/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: apiKey,
                model: model,
                prompt: `<|system|>${systemPrompt}</s><|user|>${userPrompt}</s><|assistant|>`
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Generation failed');
        }

        const data = await response.json();
        let generatedPrompt = '';

        if (Array.isArray(data) && data[0]?.generated_text) {
            generatedPrompt = data[0].generated_text;
        } else if (data.generated_text) {
            generatedPrompt = data.generated_text;
        } else {
            throw new Error('Unexpected response');
        }

        generatedPrompt = generatedPrompt.trim();

        // Store scene data with the generated result
        storeCurrentScene(formData, generatedPrompt);

        // Show output
        document.getElementById('loading').classList.remove('visible');
        document.getElementById('outputText').textContent = generatedPrompt;
        document.getElementById('outputText').classList.add('visible');
        document.getElementById('copyBtn').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'inline-flex';
        document.getElementById('veoBtn').style.display = 'inline-flex';

        showStatus('✨ Prompt generated with perfect consistency!', 'success');

        // Scroll to the output card so the user sees the header and start of prompt
        const outputCard = document.getElementById('outputCard');
        if (outputCard) {
            outputCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').classList.remove('visible');
        document.getElementById('outputPlaceholder').style.display = 'block';

        let errorMessage = error.message;
        if (errorMessage.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to backend. Make sure Flask server is running on port 5001.';
        }

        showStatus(`Error: ${errorMessage}`, 'error');
    }
}

// Utility functions
function copyPrompt() {
    const text = document.getElementById('outputText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy', 2000);
    });
}

function downloadPrompt() {
    const text = document.getElementById('outputText').textContent;
    const sceneNum = document.getElementById('sceneNumber').value.replace(/\s/g, '_');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veo_prompt_scene_${sceneNum}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function openVeo() {
    window.open('https://veo.google', '_blank');
}

function clearForm() {
    if (confirm('Clear for next scene? (Character data preserved)')) {
        document.getElementById('sceneDescription').value = '';
        document.getElementById('primaryDialogue').value = '';
        document.getElementById('secondaryDialogue').value = '';
        document.getElementById('narratorText').value = '';

        // Remove extra characters
        document.getElementById('extraCharactersContainer').innerHTML = '';
        extraCharCount = 0;
        // Clear extra uploaded images from memory object (keep primary/secondary)
        Object.keys(uploadedImages).forEach(key => {
            if (key.startsWith('extra_char_')) {
                delete uploadedImages[key];
            }
        });

        // Auto-increment scene
        const sceneNumInput = document.getElementById('sceneNumber');
        const match = sceneNumInput.value.match(/(\d+)\s+of\s+(\d+)/);
        if (match) {
            const current = parseInt(match[1]);
            const total = parseInt(match[2]);
            if (current < total) {
                sceneNumInput.value = `${current + 1} of ${total}`;
            }
        }

        showStatus('Ready for next scene!', 'success');
    }
}

function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message visible ${type}`;

    setTimeout(() => {
        statusEl.classList.remove('visible');
    }, 7000);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Load Hugging Face key
    const savedApiKey = localStorage.getItem('hf_api_key');
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }

    // Load Gemini key
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    if (savedGeminiKey) {
        document.getElementById('geminiKey').value = savedGeminiKey;
    }

    // Save keys when changed
    document.getElementById('apiKey').addEventListener('change', (e) => {
        localStorage.setItem('hf_api_key', e.target.value);
    });

    document.getElementById('geminiKey').addEventListener('change', (e) => {
        localStorage.setItem('gemini_api_key', e.target.value);
    });

    loadMemory();
    // Initialize veggie options (in case browser cached selection)
    if (document.getElementById('vegTopic')) {
        updateVegOptions();
        document.getElementById('vegTopic').addEventListener('change', updateVegOptions);
    }
});

// --- NEW FUNCTIONALITY: VEGETABLE MODE ---

function updateVegOptions() {
    const topic = document.getElementById('vegTopic').value;
    const sceneSelect = document.getElementById('vegSceneNum');

    if (topic === 'side_effects') {
        sceneSelect.options[0].text = "Part 1: Deceptive Hook (Intro)";
        sceneSelect.options[1].text = "Part 2: Internal Body Damage (The Visual)";
        sceneSelect.options[2].text = "Part 3: The Consequence (Mocking)";
    } else {
        sceneSelect.options[0].text = "Part 1: Intro & First Benefit";
        sceneSelect.options[1].text = "Part 2: More Benefits & Humor";
        sceneSelect.options[2].text = "Part 3: Conclusion & Call to Action";
    }
}

function switchMode(mode) {
    const storyContainer = document.getElementById('storyModeContainer');
    const vegContainer = document.getElementById('vegetableModeContainer');
    const adContainer = document.getElementById('advertisementModeContainer');
    const btnStory = document.getElementById('btn-mode-story');
    const btnVeg = document.getElementById('btn-mode-vegetable');
    const btnAd = document.getElementById('btn-mode-ad');

    const mainGrid = document.querySelector('.main-grid');

    if (mode === 'story') {
        storyContainer.style.display = 'block';
        vegContainer.style.display = 'none';
        adContainer.style.display = 'none';
        btnStory.classList.add('active');
        btnVeg.classList.remove('active');
        btnAd.classList.remove('active');
        mainGrid.classList.remove('full-width'); // Side-by-side for Story
        showStatus('📖 Switched to Story Mode', 'info');
    } else if (mode === 'vegetable') {
        if (document.getElementById('btnNextVegPartOutput')) {
            document.getElementById('btnNextVegPartOutput').style.display = 'none';
        }
        storyContainer.style.display = 'none';
        vegContainer.style.display = 'block';
        adContainer.style.display = 'none';
        btnStory.classList.remove('active');
        btnVeg.classList.add('active');
        btnAd.classList.remove('active');
        mainGrid.classList.add('full-width'); // Full width (stacked) for Veggie
        showStatus('🥦 Switched to Talking Vegetable Mode', 'success');
    } else if (mode === 'advertisement') {
        storyContainer.style.display = 'none';
        vegContainer.style.display = 'none';
        adContainer.style.display = 'block';
        btnStory.classList.remove('active');
        btnVeg.classList.remove('active');
        btnAd.classList.add('active');
        mainGrid.classList.add('full-width'); // Full width for Advertisement
        showStatus('📺 Switched to Advertisement Mode', 'info');
    }
}

async function generateVegetablePrompt() {


    const name = document.getElementById('vegName').value.trim();
    // const expression = document.getElementById('vegExpression').value; // Hidden now
    const scenario = document.getElementById('vegScenario').value.trim();
    const style = document.getElementById('vegStyle').value;
    const sceneNum = document.getElementById('vegSceneNum').value;
    const topic = document.getElementById('vegTopic').value;

    // Auto-Set Emotion based on Topic
    let expression = 'happy';
    if (topic === 'side_effects') {
        expression = 'angry'; // Side effects are aggressive/warning
    } else {
        expression = 'happy'; // Benefits are cheerful
    }

    if (!name) {
        showStatus('Please give your vegetable a name!', 'error');
        return;
    }

    // Reset Next Button
    document.getElementById('btnNextVegPart').style.display = 'none';
    if (document.getElementById('btnNextVegPartOutput')) {
        document.getElementById('btnNextVegPartOutput').style.display = 'none';
    }

    // UI Loading State
    document.getElementById('outputPlaceholder').style.display = 'none';
    document.getElementById('outputText').classList.remove('visible');
    document.getElementById('loading').classList.add('visible');
    document.getElementById('copyBtn').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('veoBtn').style.display = 'none';

    try {
        const model = document.getElementById('modelSelect').value;

        // Dynamic Tone & Style Definitions based on Expression
        let toneDesc = "";
        let dialogueStyle = "";
        let hindiExample = "";

        switch (expression) {
            case 'happy':
                toneDesc = "Ecstatic, joyful, high energy, upbeat, very positive.";
                dialogueStyle = "Dialogue should be extremely enthusiastic. Focus on the joy of being healthy/tasty.";
                hindiExample = "Arre waah! Main toh superfood hoon! Mujhe khaoge toh superman ban jaoge!";
                break;
            case 'funny':
                toneDesc = "Witty, sarcastic, pun-filled, comedic, cheeky.";
                dialogueStyle = "Dialogue MUST be a joke, a pun, or a roast. Make it laugh-out-loud funny.";
                hindiExample = "Main itna cool hoon ki fridge bhi mujhe dekh ke jal jaata hai!";
                break;
            case 'angry':
                toneDesc = "Stern, Serious, Warning, Dark, Authoritative.";
                dialogueStyle = "The character warns the human about their poor choices. It speaks with INTENSITY and AUTHORITY, but not uncontrollable screaming. Like a strict teacher or villain.";
                hindiExample = "Main hoon Karela. Darta kyu hai? Meri kadwahat hi tera ilaaj hai.";
                break;
            case 'sad':
                toneDesc = "Tragic, weeping, depressed, emotional, melodramatic.";
                dialogueStyle = "Dialogue MUST be sorrowful. Crying about its fate. Begging not to be cut/eaten. Use 'Haye Ram' or similar.";
                hindiExample = "Haye... meri kismat toh dekho... bas ab soup banna hi likha hai... (sobbing)";
                break;
            case 'scared':
                toneDesc = "Terrified, trembling, panic-stricken, stammering.";
                dialogueStyle = "Dialogue should show panic. Stuttering, asking for mercy.";
                hindiExample = "N-n-nahi! Wo... wo chaku neeche rakho! Mujhe dar lag raha hai!";
                break;
            case 'wise':
                toneDesc = "Old, slow, philosophical, grand, grandmotherly/grandfatherly.";
                dialogueStyle = "Dialogue should sound like an old wise person giving advice.";
                hindiExample = "Beta, meri baat suno... jo hari sabzi khata hai, wahi lambi umar paata hai.";
                break;
            case 'surprised':
                toneDesc = "Shocked, gasping, disbelief, wide-eyed.";
                dialogueStyle = "Dialogue should express total disbelief at a fact or situation.";
                hindiExample = "Hain?? Sach mein?? Mujhe toh pata hi nahi tha main itna faydemand hoon!";
                break;
            default:
                toneDesc = "Friendly, engaging, nice, witty.";
                dialogueStyle = "Standard friendly explanation.";
        }

        // Context for the specific part of the 24s video
        // Context for the specific part of the 24s video


        // Context for the specific part of the 24s video
        // Determine Total Parts
        const totalParts = document.getElementById('vegDuration').value;

        // Context for the specific part
        let partContext = "";

        // --- TOPIC: BENEFITS (Classic Mode) ---
        if (topic === 'benefits') {
            if (sceneNum === "1") {
                partContext = `PART 1 of ${totalParts} (INTRO). 
                Content: The character MUST start by saying "Main hoon ${name}" (I am ${name}). Then grab attention.
                Constraint: Do NOT list all benefits yet. Establish identity first.
                Context: ${dialogueStyle}`;
            } else if (sceneNum == totalParts) {
                partContext = `PART ${sceneNum} of ${totalParts} (CONCLUSION). 
                Content: Final ultimatum. "Eat me or else!" or "Please pick me!".
                Constraint: Do NOT start a new topic. Wrap up the rant/speech with a strong punchline.
                Context: ${toneDesc}`;
            } else {
                const transitionNote = sceneNum === "2"
                    ? "TRANSITION: The scene smoothly transitions from the intro setting. The character may move/float/zoom into the new environment."
                    : "TRANSITION: Continue from previous part's environment.";

                partContext = `PART ${sceneNum} of ${totalParts} (VALUE & CONFLICT). 
                ${transitionNote}
                Content: The character mentions a SPECIFIC weird benefit (e.g. 'I clean your insides') or compares to junk food.
                Constraint: Do NOT re-introduce the character. Move the story forward.
                Context: ${toneDesc}`;
            }

            // --- TOPIC: SIDE EFFECTS (Warning Mode) ---
        } else {
            // Side Effects Logic
            if (sceneNum === "1") {
                partContext = `PART 1 of ${totalParts} (DECEPTIVE HOOK). 
                Content: The character MUST start by saying "Main hoon ${name}" (I am ${name}). Then hint at danger.
                Constraint: Introduce the item as a temptation/danger.
                Context: ${dialogueStyle}`;
            } else if (sceneNum == totalParts) {
                partContext = `PART ${sceneNum} of ${totalParts} (CONSEQUENCE). 
                Content: The character mocks the user for the long-term consequences (obesity, diabetes).
                Constraint: A final warning or mocking laugh.
                Context: ${toneDesc}`;
            } else {
                const transitionNote = sceneNum === "2"
                    ? "TRANSITION: The character ENTERS the human body. Show a smooth zoom/dive transition from external to internal view (e.g., camera follows character shrinking and entering through mouth/skin, traveling through throat into bloodstream)."
                    : "TRANSITION: Continue inside the body from previous organ/system. Character moves to a different internal location.";

                partContext = `PART ${sceneNum} of ${totalParts} (INTERNAL BODY DAMAGE). 
                ${transitionNote}
                Content: The character (${name}) is depicted INSIDE the human body, actively causing damage.
                VISUAL REQUIREMENT: 
                - SETTING: Microscopic view inside a human organ (veins, heart, brain, liver) affected by ${name}.
                - ACTION: Show ${name} particles or the character physically harming cells (e.g., Sugar crystals cutting veins, Fat blocking arteries, Salt drying out cells). 
                - CHARACTER: The main ${name} character is floating in this internal space, commanding the destruction or laughing at the damage.
                - STYLE: Medical Animation / realistic biological texture mixed with the character's style.
                Context: Describing the immediate physiological harm.`;
            }
        }

        // Determine Language
        const languageMode = document.getElementById('vegLanguage').value;
        const languageName = (languageMode === 'english') ? "ENGLISH" : "HINDI (Devanagari)";
        const dialoguePlaceholder = (languageMode === 'english') ? "[English Dialogue Here]" : "[Hindi Dialogue Here]";
        const styleExample = (languageMode === 'english')
            ? "Hey! Put down those flavorless chips! I am standing right here!"
            : hindiExample;

        // Determine Voice
        const voiceType = document.getElementById('vegVoice').value;
        const voiceDescMap = {
            'male_deep': "Deep, resonant, strong MALE voice",
            'male_medium': "Casual, conversational MALE voice",
            'male_soft': "Gentle, soft-spoken MALE voice",
            'female_deep': "Mature, deep FEMALE voice",
            'female_medium': "Casual, conversational FEMALE voice",
            'female_soft': "Sweet, soft-spoken FEMALE voice",
            'child_male': "Young BOY voice",
            'child_female': "Young GIRL voice",
            'cartoon_squeaky': "High-pitched, funny CARTOON squeaky voice"
        };
        const voiceDescription = voiceDescMap[voiceType] || "Distinctive voice";

        // Construct Voice ID based on selection to ensure consistency
        const voiceIdPrefix = `${name.toLowerCase().replace(/\s/g, '_')}_${voiceType}`;

        const systemPrompt = `You are a creative scriptwriter for animated shorts.
Task: Create a script for Part ${sceneNum} of a ${totalParts}-part series.
Character: ${name} (A living, talking ingredient).
Emotion: ${expression} (Strictly enforced).

IMPORTANT: Return PLAIN TEXT. Do not wrap the entire response in \`\`\`json or \`\`\` code blocks.

DEEP CHARACTER ANALYSIS REQUIRED:
1. Combine the INGREDIENT (${name}) with the EMOTION (${expression}).
   - Example: An 'Angry Chili' burns with rage. An 'Angry Banana' might slip up or go bruised/mushy with anger.
   - Example: A 'Happy Ice Cream' melts with joy. A 'Happy Broccoli' feels fresh and crunchy.
2. The dialogue MUST reflect this specific combination.
   - Do NOT just write generic angry/happy lines. Write lines that ONLY a ${name} would say.

CRITICAL REQUIREMENTS:
1. Aspect Ratio: 9:16 (Vertical).
2. Language: Dialogue MUST be in Simple, Conversational ${languageName}.
   - USE: Everyday phrases, slang, and simple words (like friends talking).
   - AVOID: Formal/Pure Hindi (Shuddh Hindi), poetic words, or dramatic book language (e.g., words like 'kahar', 'ragon', 'lubhavni', 'kshan').
   - Keep it CASUAL and PUNCHY. 
3. Tone: ${toneDesc}
4. Context: ${dialogueStyle}

[REQUIRED OUTPUT FORMAT]
Visual Prompt: CINEMATIC DIRECTING - EXPRESSION & ENVIRONMENT ONLY.

CRITICAL: DO NOT describe the character's physical appearance (shape, color, texture, features). The character is already defined as "${name}".

ONLY DESCRIBE:
1. BACKGROUND/SETTING: ${topic === 'side_effects' ? 'Dark, ominous, medical/internal body environment (veins, organs, cells).' : 'Bright, clean kitchen or abstract healthy glow/aura.'}
2. EMOTIONAL EXPRESSION: How the character's body language shows ${expression} emotion (e.g., trembling with rage, bouncing with joy, slumping sadly).
3. ACTION/GESTURE: Specific movements that MATCH the dialogue (e.g., pointing accusingly, making warning gestures, celebrating, threatening).
4. TRANSITION/CONTINUITY: 
   - For Part 1: Establish the starting environment.
   - For Part 2+: Describe HOW the scene transitions from the previous part (e.g., "camera zooms in", "character floats/moves to new location", "environment morphs/shifts"). 
   - NEVER abruptly cut to a completely different scene. Show the journey/movement.

Example Format: "The character floats in a dark vein filled with red blood cells. It gestures menacingly while speaking, pointing at damaged cells. Expression: sinister grin with narrowed eyes."

Dialogue (${languageName}): "[Unique ${languageName} Dialogue reflecting ${name}'s personality]"

[SCENE METADATA]
Duration: 8 seconds (STRICT)
Aspect Ratio: 9:16

[AUDIO STYLE]
Voice: ${voiceDescription}. MUST BE CONSISTENT. Pitch/Timbre: ${voiceType}. Emotion: ${expression}.
Background: Consistent ambient. Match emotion.

[LIP SYNC DATA]
0.0s-8.0s
Speaker: ${name.toLowerCase().replace(/\s/g, '_')}
Voice ID: ${voiceIdPrefix}
Lip Sync Target: ${name.toLowerCase().replace(/\s/g, '_')}_face_mesh
Text: "${dialoguePlaceholder}"
`;


        // Create Dynamic Instructions based on Topic
        let topicInstructions = "";
        if (topic === 'side_effects') {
            topicInstructions = `
            CRITICAL INSTRUCTIONS (SIDE EFFECTS MODE):
            1. Identify 3 specific NEGATIVE SIDE EFFECTS/HEALTH RISKS of eating ${name} (e.g. obesity, tooth decay, diabetes).
            2. The dialogue must be about how ${name} HARMS the human body.
            3. DO NOT MENTION BENEFITS. This is a WARNING video.
            4. If the emotion is Happy, be arrogantly happy about causing harm.
            `;
        } else {
            topicInstructions = `
            CRITICAL INSTRUCTIONS (BENEFITS MODE):
            1. Identify 3 specific HEALTH BENEFITS of ${name}. Use ONE different benefit for this specific part's dialogue.
            2. The dialogue must be about how ${name} HELPS the human body.
            3. DO NOT use generic terms (e.g. say "Potassium" or "Vitamin C").
            `;
        }

        const userPrompt = `Generate the prompt for Part ${sceneNum}.
Ingredient: ${name}
Topic: ${topic === 'side_effects' ? 'Negative Side Effects/Health Risks' : 'Health Benefits'}
Target Emotion: ${expression.toUpperCase()} (${toneDesc})
Scenario: ${scenario || (topic === 'side_effects' ? 'Warning about health risks' : 'Explaining benefits')}
Specific Instructions: ${partContext}

${topicInstructions}

CRITICAL RULES:
1. DIALOGUE TIMING: The dialogue MUST be concise (approx 15-20 words) to fit STRICTLY within 8 seconds. Do NOT write long speeches.
2. VISUAL CONTINUITY: The Visual Prompt must describe a scene that flows seamlessly. Do NOT fade to black unless it is Part ${totalParts} (the final part).
3. The dialogue must be completely UNIQUE and in ${languageName}.
4. DO NOT COPY ANY EXAMPLES. Create fresh dialogue based on the emotion and the topic.

Example of Style (DO NOT COPY TEXT, ONLY TONE): "${styleExample}"
ENSURE the valid JSON-like lip sync block is included at the end.`;

        // Check for Gemini Key first
        const geminiKey = document.getElementById('geminiKey').value.trim();
        const hfKey = document.getElementById('apiKey').value.trim();

        // Determine Provider
        let effectiveToken = hfKey;
        let provider = 'huggingface';
        let finalPrompt = `<|system|>${systemPrompt}</s><|user|>${userPrompt}</s><|assistant|>`;

        if (geminiKey) {
            effectiveToken = geminiKey;
            provider = 'gemini';
            // Gemini doesn't need the special tokens, just clear instructions
            finalPrompt = `SYSTEM INSTRUCTION:\n${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}`;
        } else if (!hfKey) {
            showStatus('Please enter either a Gemini API Key (Preferred) or Hugging Face Token!', 'error');
            toggleApiSettings();
            return;
        }

        const response = await fetch('http://localhost:5001/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: effectiveToken,
                model: model,
                prompt: finalPrompt,
                provider: provider
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Generation failed');
        }

        const data = await response.json();
        let generatedPrompt = '';

        if (Array.isArray(data) && data[0]?.generated_text) {
            generatedPrompt = data[0].generated_text;
        } else if (data.generated_text) {
            generatedPrompt = data.generated_text;
        }

        // Clean up Markdown code blocks if Gemini wraps the response
        generatedPrompt = generatedPrompt.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

        document.getElementById('loading').classList.remove('visible');
        document.getElementById('outputText').textContent = generatedPrompt;
        document.getElementById('outputText').classList.add('visible');
        document.getElementById('copyBtn').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'inline-flex';
        document.getElementById('veoBtn').style.display = 'inline-flex';

        showStatus(`🥦 Part ${sceneNum} Prompt Generated!`, 'success');

        // Scroll to output
        document.getElementById('outputCard').scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Handle Next Part Button Logic
        // Handle Next Part Button Logic
        const nextBtn = document.getElementById('btnNextVegPart');
        const nextBtnOutput = document.getElementById('btnNextVegPartOutput');
        const currentPart = parseInt(sceneNum);
        const maxParts = parseInt(totalParts);

        if (currentPart < maxParts) {
            const btnText = `Next Part (${currentPart + 1}/${maxParts}) ➡️`;

            nextBtn.style.display = 'inline-flex';
            nextBtn.textContent = btnText;

            nextBtnOutput.style.display = 'inline-flex';
            nextBtnOutput.textContent = btnText;
        } else {
            nextBtn.style.display = 'none';
            nextBtnOutput.style.display = 'none';
            showStatus(`🥦 Complete ${maxParts}-Part Series Generated!`, 'success');
        }

    } catch (error) {
        console.error(error);
        document.getElementById('loading').classList.remove('visible');
        showStatus(`Error: ${error.message} `, 'error');
    }
}

function nextVegPart() {
    const sceneSelect = document.getElementById('vegSceneNum');
    const totalParts = parseInt(document.getElementById('vegDuration').value);
    let current = parseInt(sceneSelect.value);

    if (current < totalParts) {
        current++;
        // If the sceneSelect dropdown doesn't have enough options (since it might be hardcoded 1-3), 
        // we just conceptually rely on the value being set, even if it's not in the visible list (it's hidden anyway).
        // But for safety, we should add options dynamically if needed, Or since it's hidden, we can just assume `value` holds state.
        // However, standard HTML select might not accept values not in option list.
        // Since we hid the dropdown, let's just make sure we are not restricted by its options.
        // Better yet, just create the option if missing to avoid errors.
        if (!sceneSelect.querySelector(`option[value="${current}"]`)) {
            const opt = document.createElement("option");
            opt.value = current;
            opt.text = `Part ${current}`;
            sceneSelect.add(opt);
        }

        sceneSelect.value = current.toString();
        generateVegetablePrompt();
    }
}
// Scene memory with consistency rules
let sceneMemory = {
    enabled: true,
    characters: {},
    setting: '',
    lighting: '',
    timeOfDay: '',
    currentSceneDescription: '',
    lastGeneratedPrompt: ''
};

let uploadedImages = {
    primary: null,
    secondary: null
};

// Load/save memory (Database Version)
async function loadMemory() {
    try {
        const response = await fetch('http://localhost:5001/api/memory');
        if (!response.ok) throw new Error('Failed to load memory from DB');

        const data = await response.json();

        if (data) {
            sceneMemory = data; // Note: Loading essentially resets session to the snapshot state

            // Populate basic fields
            if (data.storyTitle) document.getElementById('storyTitle').value = data.storyTitle;
            if (data.sceneNumber) document.getElementById('sceneNumber').value = data.sceneNumber;

            updateMemoryDisplay();

            // Sync UI toggle with loaded state
            const toggle = document.getElementById('continuityToggle');
            if (sceneMemory.enabled) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    } catch (error) {
        console.error('Error loading memory:', error);
        showStatus('⚠️ Could not connect to Database. Is backend running?', 'warning');
    }
}

async function saveMemory(specificData = null) {
    // If specific data is provided, use it (for scoped history snapshots)
    // Otherwise use the global session memory
    const payload = specificData || sceneMemory;

    try {
        const response = await fetch('http://localhost:5001/api/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to save');

        updateMemoryDisplay();
        console.log('Memory saved to DB');
    } catch (error) {
        console.error('Error saving memory:', error);
        showStatus('⚠️ Failed to save consistency data to DB', 'error');
    }
}

async function clearMemory() {
    if (confirm('Clear all character data from Database? This cannot be undone.')) {
        try {
            const response = await fetch('http://localhost:5001/api/reset', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to reset');

            sceneMemory = {
                enabled: true,
                characters: {},
                setting: '',
                lighting: '',
                timeOfDay: ''
            };
            uploadedImages = { primary: null, secondary: null };

            updateMemoryDisplay();
            showStatus('All character data cleared from Database!', 'success');
        } catch (error) {
            console.error(error);
            showStatus('Error clearing database', 'error');
        }
    }
}

function updateMemoryDisplay() {
    const box = document.getElementById('sceneMemoryBox');
    const content = document.getElementById('memoryContent');

    if (Object.keys(sceneMemory.characters).length > 0) {
        box.style.display = 'block';

        let html = '';
        Object.keys(sceneMemory.characters).forEach(charName => {
            const char = sceneMemory.characters[charName];
            html += `<div class="memory-item">
                <strong style="color: var(--primary);">${charName}</strong><br>
                <span class="memory-label">Voice:</span> ${char.voice}<br>
                <span class="memory-label">Consistency Rules:</span> ${char.consistencyRules ? char.consistencyRules.split('\n').length + ' rules' : 'None'}<br>
                <span class="memory-label">Description:</span> ${char.description ? char.description.substring(0, 80) + '...' : 'None'}
            </div>`;
        });

        content.innerHTML = html;
    } else {
        box.style.display = 'none';
    }
}

function toggleContinuity() {
    const toggle = document.getElementById('continuityToggle');
    sceneMemory.enabled = !sceneMemory.enabled;

    if (sceneMemory.enabled) {
        toggle.classList.add('active');
        showStatus('Consistency Mode ENABLED!', 'success');
    } else {
        toggle.classList.remove('active');
        showStatus('Consistency Mode DISABLED.', 'warning');
    }

    saveMemory();
}

// Counter for extra characters
let extraCharCount = 0;

function addCharacter() {
    extraCharCount++;
    const charId = `extra_char_${extraCharCount}`;
    const container = document.getElementById('extraCharactersContainer');

    const html = `
        <div class="collapsible-section" id="section_${charId}">
            <div class="collapsible-header" onclick="toggleSection(this)">
                <span class="collapsible-title">👤 Character ${extraCharCount + 2} (Optional)</span>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="btn-small" style="color: var(--error); cursor: pointer;" onclick="removeCharacter('${charId}', event)">🗑️</span>
                    <span class="collapsible-toggle">▼</span>
                </div>
            </div>
            <div class="collapsible-content">
                <div class="form-group">
                    <label class="form-label">🎨 Visual Style / Character Type</label>
                    <select id="${charId}_visualStyle" class="form-select">
                        <option value="Cinematic Photorealism">📸 Photorealistic / Cinematic (Default)</option>
                        <option value="3D Animation (Pixar/Disney Style)">🧸 3D Animation (Pixar/Disney Style)</option>
                        <option value="2D Anime Style">🎌 2D Anime / Manga Style</option>
                        <option value="Digital AI Avatar">🤖 Digital Avatar / AI Character</option>
                        <option value="Cyberpunk/Futuristic">🌃 Cyberpunk / Futuristic</option>
                        <option value="Oil Painting Art Style">🎨 Oil Painting / Artistic</option>
                        <option value="Vintage Film (1950s)">🎞️ Vintage Film Look</option>
                    </select>
                </div>
                <!-- Image Upload -->
                <div class="form-group">
                    <label class="form-label">📸 Upload Character Image</label>
                    <div class="image-upload-container" id="${charId}ImageContainer" onclick="document.getElementById('${charId}ImageInput').click()">
                        <img id="${charId}ImagePreview" class="image-preview" alt="Character preview">
                        <div id="${charId}UploadText">
                            <div class="upload-icon">📷</div>
                            <div class="upload-text">Click to upload character image</div>
                            <div class="upload-text" style="font-size: 0.8rem; margin-top: 0.25rem;">Gemini AI will analyze</div>
                        </div>
                    </div>
                    <input type="file" id="${charId}ImageInput" accept="image/*" onchange="handleImageUpload('${charId}')">
                    <button class="btn btn-small" id="${charId}AnalyzeBtn" onclick="analyzeImage('${charId}')" style="display: none; margin-top: 0.5rem;">
                        🔮 Analyze with Gemini
                    </button>
                </div>

                <div class="form-group">
                    <label class="form-label">Character Name</label>
                    <input type="text" id="${charId}_name" class="form-input" placeholder="e.g., General">
                </div>

                <div class="form-group">
                    <label class="form-label">🎤 Voice Type</label>
                    <select id="${charId}_voice" class="form-select">
                        <option value="deep_male">Deep Male Voice</option>
                        <option value="medium_male">Medium Male Voice</option>
                        <option value="soft_male">Soft/Young Male Voice</option>
                        <option value="deep_female">Deep Female Voice</option>
                        <option value="medium_female">Medium Female Voice</option>
                        <option value="soft_female">Soft/Young Female Voice</option>
                        <option value="elderly">Elderly Voice</option>
                        <option value="divine">Divine/Ethereal Voice</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Character Description</label>
                    <textarea id="${charId}_description" class="form-textarea form-char-desc" 
                              placeholder="Will be auto-filled by Gemini or type manually"
                              rows="2"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">🔒 Consistency Rules</label>
                    <textarea id="${charId}_consistency" class="form-textarea" 
                              placeholder="Fixed attributes for this character"
                              rows="2"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">💬 Dialogue</label>
                    <textarea id="${charId}_dialogue" class="form-textarea" 
                              placeholder="Dialogue"
                              rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Emotion/Delivery</label>
                    <select id="${charId}_emotion" class="form-select">
                        <option value="neutral">Neutral/Calm</option>
                        <option value="angry">Angry</option>
                        <option value="happy">Happy</option>
                        <option value="sad">Sad</option>
                        <option value="surprised">Surprised</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = html;
    container.appendChild(div);

    // Initialize upload state
    uploadedImages[charId] = null;
}

function removeCharacter(charId, event) {
    event.stopPropagation();
    const section = document.getElementById(`section_${charId}`);
    if (section) {
        section.remove();
        delete uploadedImages[charId];
    }
}

// Store current scene
function storeCurrentScene(formData, generatedPromptText = null) {
    if (!sceneMemory.enabled) return;

    // Store primary character
    if (formData.primaryChar) {
        sceneMemory.characters[formData.primaryChar] = {
            description: formData.charDescription || '',
            voice: formData.primaryVoice || 'medium_male',
            consistencyRules: formData.primaryConsistencyRules || '',
            imageBase64: uploadedImages.primary || ''
        };
    }

    // Store secondary character
    if (formData.secondaryChar && formData.secondaryCharDescription) {
        sceneMemory.characters[formData.secondaryChar] = {
            description: formData.secondaryCharDescription || '',
            voice: formData.secondaryVoice || 'medium_male',
            consistencyRules: formData.secondaryConsistencyRules || '',
            imageBase64: uploadedImages.secondary || ''
        };
    }

    if (formData.setting) sceneMemory.setting = formData.setting;
    if (formData.lighting) sceneMemory.lighting = formData.lighting;
    if (formData.timeOfDay) sceneMemory.timeOfDay = formData.timeOfDay;

    // Store metadata about this specific generation
    if (formData.sceneDescription) sceneMemory.currentSceneDescription = formData.sceneDescription;
    if (generatedPromptText) sceneMemory.lastGeneratedPrompt = generatedPromptText;

    // Store extra characters in memory
    if (formData.extraCharacters) {
        formData.extraCharacters.forEach(char => {
            if (char.name) {
                sceneMemory.characters[char.name] = {
                    description: char.description || '',
                    voice: char.voice || 'medium_male',
                    consistencyRules: char.consistency || '',
                    imageBase64: ''
                };
            }
        });
    }

    // 2. Create Scoped Snapshot for Database (Strictly relevant to this prompt)
    const activeCharNames = new Set();
    if (formData.primaryChar) activeCharNames.add(formData.primaryChar);
    if (formData.secondaryChar) activeCharNames.add(formData.secondaryChar);
    if (formData.extraCharacters) {
        formData.extraCharacters.forEach(c => {
            if (c.name) activeCharNames.add(c.name);
        });
    }

    const scopedCharacters = {};
    activeCharNames.forEach(name => {
        if (sceneMemory.characters[name]) {
            scopedCharacters[name] = sceneMemory.characters[name];
        }
    });

    const snapshotData = {
        enabled: sceneMemory.enabled,
        storyTitle: document.getElementById('storyTitle') ? document.getElementById('storyTitle').value : '',
        sceneNumber: document.getElementById('sceneNumber') ? document.getElementById('sceneNumber').value : '1',
        currentSceneDescription: formData.sceneDescription || '',
        lastGeneratedPrompt: generatedPromptText || '',
        setting: formData.setting || '',
        lighting: formData.lighting || '',
        timeOfDay: formData.timeOfDay || '',
        characters: scopedCharacters // ONLY saving active characters
    };

    saveMemory(snapshotData);
}

// UI functions
function toggleSection(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.collapsible-toggle');

    content.classList.toggle('open');
    toggle.classList.toggle('open');
}

function toggleApiSettings() {
    const content = document.getElementById('apiContent');
    const icon = document.getElementById('apiToggleIcon');

    content.classList.toggle('open');
    icon.textContent = content.classList.contains('open') ? '▲' : '▼';
}

// Image upload handling
function handleImageUpload(type) {
    const input = document.getElementById(`${type}ImageInput`);
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Store image
            uploadedImages[type] = e.target.result;

            // Show preview
            const preview = document.getElementById(`${type}ImagePreview`);
            preview.src = e.target.result;
            preview.classList.add('visible');

            // Update container
            const container = document.getElementById(`${type}ImageContainer`);
            container.classList.add('has-image');

            // Hide upload text
            document.getElementById(`${type}UploadText`).style.display = 'none';

            // Show analyze button
            document.getElementById(`${type}AnalyzeBtn`).style.display = 'inline-flex';

            showStatus('Image uploaded! Click "Analyze with Gemini" to generate description.', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// AI Image Analysis with Gemini
async function analyzeImage(type) {
    const geminiKey = document.getElementById('geminiKey').value.trim();

    if (!geminiKey) {
        showStatus('Please enter your Google Gemini API key first! Get it free at: aistudio.google.com/app/apikey', 'error');
        toggleApiSettings();
        return;
    }

    if (!uploadedImages[type]) {
        showStatus('Please upload an image first!', 'error');
        return;
    }

    const analyzeBtn = document.getElementById(`${type}AnalyzeBtn`);
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🔄 Analyzing with Gemini...';

    try {
        const response = await fetch('http://localhost:5001/analyze_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gemini_key: geminiKey,
                image: uploadedImages[type]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            let errorMsg = data.error || 'Analysis failed';

            // Handle specific Gemini errors
            if (errorMsg.includes('API_KEY_INVALID')) {
                errorMsg = 'Invalid Gemini API key. Please check your key at aistudio.google.com/app/apikey';
            } else if (errorMsg.includes('PERMISSION_DENIED')) {
                errorMsg = 'Gemini API not enabled. Visit console.cloud.google.com to enable it.';
            } else if (errorMsg.includes('QUOTA_EXCEEDED')) {
                errorMsg = 'Daily quota exceeded (1500 free requests). Try again tomorrow.';
            }

            throw new Error(errorMsg);
        }

        const description = data.description || 'No description generated';
        const visualStyle = data.visual_style || 'Cinematic Photorealism';

        // Fill description field
        let descField;
        if (type === 'primary') {
            descField = 'charDescription';
        } else if (type === 'secondary') {
            descField = 'secondaryCharDescription';
        } else {
            descField = `${type}_description`;
        }

        const descElement = document.getElementById(descField);
        if (descElement) {
            descElement.value = description;
        }

        // Auto-set visual style dropdown based on detected style
        if (visualStyle) {
            let selectId;
            if (type === 'primary') {
                selectId = 'visualStyle';
            } else if (type === 'secondary') {
                selectId = 'secondaryVisualStyle';
            } else {
                selectId = `${type}_visualStyle`;
            }

            const visualStyleSelect = document.getElementById(selectId);

            // Map detected style to dropdown options
            const styleMapping = {
                'Cinematic Photorealism': 'Cinematic Photorealism',
                '3D Animation (Pixar/Disney Style)': '3D Animation (Pixar/Disney Style)',
                '2D Anime Style': '2D Anime Style',
                'Digital AI Avatar': 'Digital AI Avatar',
                'Cyberpunk/Futuristic': 'Cyberpunk/Futuristic',
                'Oil Painting Art Style': 'Oil Painting Art Style',
                'Vintage Film (1950s)': 'Vintage Film (1950s)'
            };

            // Find matching option or use closest match
            let matchedStyle = styleMapping[visualStyle] || 'Cinematic Photorealism';

            // Try partial matching if exact match not found
            if (!styleMapping[visualStyle]) {
                for (const [key, value] of Object.entries(styleMapping)) {
                    if (visualStyle.toLowerCase().includes(key.toLowerCase()) ||
                        key.toLowerCase().includes(visualStyle.toLowerCase())) {
                        matchedStyle = value;
                        break;
                    }
                }
            }

            if (visualStyleSelect) {
                visualStyleSelect.value = matchedStyle;
            }

            showStatus(`✨ Gemini analysis complete! Detected style: ${visualStyle}`, 'success');
        } else {
            showStatus(`✨ Gemini analysis complete! Description added.`, 'success');
        }

    } catch (error) {
        console.error('Error:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔮 Analyze with Gemini';
    }
}

// Helper to generating Lip Sync Data JSON
function generateLipSyncData(formData) {
    let entries = [];
    let currentTime = 0;
    const avgSecPerChar = 0.08; // Roughly 12 chars per second
    const minDuration = 2;

    function processDialogue(text, speakerId, voiceParams, isNarrator = false) {
        if (!text) return;

        // Split by major punctuation or newlines
        // Regex looks for periods, question marks, exclamation marks, hindi danda (|)
        const sentences = text.split(/([?!.|।\n]+)/).filter(Boolean);
        let currentChunk = "";

        // Re-assemble into chunks
        for (let i = 0; i < sentences.length; i++) {
            let part = sentences[i].trim();
            if (!part) continue;

            // If it's just punctuation, append to current chunk and push
            if (/^[?!.|।\n]+$/.test(part)) {
                currentChunk += part;
                // End of chunk
                if (currentChunk.trim()) {
                    addEntry(currentChunk, speakerId, voiceParams, isNarrator);
                    currentChunk = "";
                }
            } else {
                // It's text
                if (currentChunk.length > 50) { // If current chunk is already long, push it
                    addEntry(currentChunk, speakerId, voiceParams, isNarrator);
                    currentChunk = part;
                } else {
                    currentChunk += (currentChunk ? " " : "") + part;
                }
            }
        }
        if (currentChunk.trim()) {
            addEntry(currentChunk, speakerId, voiceParams, isNarrator);
        }
    }

    function addEntry(text, speakerId, voiceParams, isNarrator) {
        // Calculate duration
        let duration = Math.max(minDuration, Math.ceil(text.length * avgSecPerChar));
        let startTime = currentTime;
        let endTime = currentTime + duration;
        currentTime = endTime;

        let voiceType = voiceParams.voice || 'neutral';
        // Swap deep_male to male_deep if needed
        if (voiceType.includes('_')) {
            const parts = voiceType.split('_');
            if (parts.length === 2) {
                voiceType = `${parts[1]}_${parts[0]}`;
            }
        }

        let voiceId = isNarrator
            ? `narrator_${voiceParams.gender || 'neutral'}_01`
            : `${speakerId}_${voiceType}_01`;

        // Sanitize IDs
        voiceId = voiceId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        let cleanSpeakerId = speakerId.toLowerCase().replace(/[^a-z0-9_]/g, '_');

        let entry = {
            "time": `${startTime}s-${endTime}s`,
            "speaker_id": cleanSpeakerId,
            "voice_id": voiceId,
            "lip_sync_target": isNarrator ? null : `${cleanSpeakerId}_face_mesh`,
            "viseme_mode": isNarrator ? undefined : "accurate", // Only for characters
            "text": text
        };

        // Remove undefined keys
        if (isNarrator) delete entry.viseme_mode;

        entries.push(entry);
    }

    // 1. Primary Character
    if (formData.primaryDialogue) {
        processDialogue(formData.primaryDialogue,
            formData.primaryChar || 'primary_character',
            { voice: formData.primaryVoice });
    }

    // 2. Secondary Character
    if (formData.secondaryDialogue) {
        processDialogue(formData.secondaryDialogue,
            formData.secondaryChar || 'secondary_character',
            { voice: formData.secondaryVoice });
    }

    // 3. Extra Characters
    if (formData.extraCharacters) {
        formData.extraCharacters.forEach((char, index) => {
            if (char.dialogue) {
                processDialogue(char.dialogue,
                    char.name || `character_${index + 3}`,
                    { voice: char.voice });
            }
        });
    }

    // 4. Narrator
    if (formData.narratorText) {
        processDialogue(formData.narratorText,
            'narrator',
            { gender: formData.narratorGender, tone: formData.narratorTone },
            true);
    }

    return entries.map(e =>
        `${e.time}
Speaker: ${e.speaker_id}
Voice ID: ${e.voice_id}
Lip Sync Target: ${e.lip_sync_target || 'None'}
Text: "${e.text}"`).join('\n\n');
}

// Main generate function
async function generatePrompt() {
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!apiKey) {
        showStatus('Please enter your Hugging Face API token!', 'error');
        toggleApiSettings();
        return;
    }

    // Validation: Story Title is REQUIRED for generation
    const storyTitleVal = document.getElementById('storyTitle') ? document.getElementById('storyTitle').value.trim() : '';
    if (!storyTitleVal) {
        showStatus('⚠️ Story Title is REQUIRED to generate a prompt!', 'error');
        return;
    }

    // Get form data
    const formData = {
        sceneDescription: document.getElementById('sceneDescription').value,
        duration: document.getElementById('duration').value,
        sceneNumber: document.getElementById('sceneNumber').value,
        sceneType: document.getElementById('sceneType').value,
        visualStyle: document.getElementById('visualStyle').value,
        primaryChar: document.getElementById('primaryChar').value,
        charDescription: document.getElementById('charDescription').value,
        primaryVoice: document.getElementById('primaryVoice').value,
        primaryConsistencyRules: document.getElementById('primaryConsistencyRules').value,
        primaryDialogue: document.getElementById('primaryDialogue').value,
        primaryEmotion: document.getElementById('primaryEmotion').value,
        secondaryChar: document.getElementById('secondaryChar').value,
        secondaryCharDescription: document.getElementById('secondaryCharDescription').value,
        secondaryVoice: document.getElementById('secondaryVoice').value,
        secondaryConsistencyRules: document.getElementById('secondaryConsistencyRules').value,
        secondaryDialogue: document.getElementById('secondaryDialogue').value,
        secondaryEmotion: document.getElementById('secondaryEmotion').value,
        extraCharacters: [],
        narratorGender: document.getElementById('narratorGender').value,
        narratorTone: document.getElementById('narratorTone').value,
        narratorText: document.getElementById('narratorText').value,
        setting: document.getElementById('setting').value,
        timeOfDay: document.getElementById('timeOfDay').value,
        lighting: document.getElementById('lighting').value,
        storyTitle: document.getElementById('storyTitle') ? document.getElementById('storyTitle').value : ''
    };


    // Collect extra characters data
    for (let i = 1; i <= extraCharCount; i++) {
        const charId = `extra_char_${i}`;
        const nameInput = document.getElementById(`${charId}_name`);

        // Only include if element exists (wasn't deleted)
        if (nameInput) {
            formData.extraCharacters.push({
                name: nameInput.value,
                description: document.getElementById(`${charId}_description`).value,
                voice: document.getElementById(`${charId}_voice`).value,
                consistency: document.getElementById(`${charId}_consistency`).value,
                dialogue: document.getElementById(`${charId}_dialogue`).value,
                emotion: document.getElementById(`${charId}_emotion`).value
            });
        }
    }

    if (!formData.sceneDescription) {
        showStatus('Please fill in Scene Description!', 'error');
        return;
    }

    // Build consistency instructions
    let consistencyInstructions = '';
    if (sceneMemory.enabled && Object.keys(sceneMemory.characters).length > 0) {
        consistencyInstructions = `\n\nCRITICAL CONSISTENCY ENFORCEMENT:\n`;

        Object.keys(sceneMemory.characters).forEach(charName => {
            const char = sceneMemory.characters[charName];
            consistencyInstructions += `\n${charName}:\n`;
            consistencyInstructions += `Description: ${char.description}\n`;
            consistencyInstructions += `Voice: ${char.voice}\n`;
            if (char.consistencyRules) {
                consistencyInstructions += `FIXED ATTRIBUTES (NEVER CHANGE):\n${char.consistencyRules}\n`;
            }
        });

        consistencyInstructions += `\n⚠️ THESE ATTRIBUTES MUST REMAIN IDENTICAL IN ALL SCENES!\n`;
    }

    // Build extra characters string
    let extraCharsPrompt = '';
    formData.extraCharacters.forEach((char, index) => {
        if (char.name || char.description) {
            extraCharsPrompt += `\nCHARACTER ${index + 3}:\n`;
            extraCharsPrompt += `Name: ${char.name || 'Unknown'}\n`;
            extraCharsPrompt += `Description: ${char.description || 'None'}\n`;
            extraCharsPrompt += `Voice: ${char.voice}\n`;
            extraCharsPrompt += `Consistency Rules: ${char.consistency || 'None'}\n`;
            extraCharsPrompt += `Dialogue: ${char.dialogue || 'None'}\n`;
            extraCharsPrompt += `Emotion: ${char.emotion}\n`;
        }
    });

    // Transition logic
    const transitionMap = {
        'dialogue': 'SEAMLESS CONTINUE - No transition, scene flows naturally from previous',
        'scene_change': 'FADE TO BLACK - Scene ends with 2sec fade to black, next begins with fade in',
        'action': 'SEAMLESS CONTINUE - Continuous action sequence'
    };
    const transitionInst = transitionMap[formData.sceneType];

    // Show loading
    document.getElementById('outputPlaceholder').style.display = 'none';
    document.getElementById('outputText').classList.remove('visible');
    document.getElementById('loading').classList.add('visible');
    document.getElementById('copyBtn').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('veoBtn').style.display = 'none';

    try {
        const model = document.getElementById('modelSelect').value;

        const systemPrompt = `You are an expert Veo 3 prompt generator. Create detailed prompts with STRICT character consistency and visual style adherence.

Structure:
[SCENE METADATA]
Duration: 8 seconds (STRICT LIMIT) | Scene: {number}

[GLOBAL AUDIO RULE]
Narrator voice must always remain off-screen and never attach to any character or face mesh.
Lip-sync must be strictly applied ONLY to the speaking character. When the Narrator speaks, NO character lips should move.

[VISUAL STYLE]
{Enforce the selected visual style throughout the entire scene}

[CHARACTER SETUP]
{Include full character details with voice type and consistency rules}

[ENVIRONMENT]
{Setting, lighting, time}

[SHOT SPECIFICATION]
{Detailed camera angles (Wide, Medium, Close-up) synced with timestamp}

[VISUAL FOCUS & TIMELINE]
{Provide a granular second-by-second breakdown (e.g., 00.00 - 00.03: Description) of the scene action, camera movement, and character blocking. MAXIMUM 8 SECONDS.}

[DIALOGUE & AUDIO]
{Character dialogues with voice type and lip-sync targets}

[NARRATOR]
{Voiceover details - OFF SCREEN ONLY}

[CHARACTER EMOTION]
{Emotions and body language}

[TECHNICAL]
1080p | 16:9 | 24fps

${consistencyInstructions}

CRITICAL: 
1. Follow consistency rules EXACTLY. Never deviate from fixed attributes.
2. ENFORCE the visual style in EVERY aspect of the scene - characters, environment, lighting, and overall aesthetic.
3. The visual style must be consistent across all scenes in the story.
4. NARRATOR IS ALWAYS OFF-SCREEN.
5. STRICT TIMING: The entire scene MUST fit within 8 seconds. Timeline must end by 00:08.`;

        const userPrompt = `Scene: ${formData.sceneDescription}
Duration: 8 seconds (Strict Limit)
Type: ${formData.sceneType}

VISUAL STYLE: ${formData.visualStyle}
⚠️ CRITICAL: ALL elements (characters, environment, props, lighting) MUST match this visual style!

[GLOBAL AUDIO RULE]
Narrator voice must always remain off-screen and never attach to any character or face mesh.

[TIMING CONSTRAINT]
The generated script and timeline MUST NOT exceed 8 seconds. All action must conclude by 00:08.

PRIMARY CHARACTER:
Name: ${formData.primaryChar || 'Not specified'}
Description: ${formData.charDescription || 'Use stored'}
Voice: ${formData.primaryVoice}
Consistency Rules: ${formData.primaryConsistencyRules || 'None'}
Dialogue: ${formData.primaryDialogue || 'None'}
Emotion: ${formData.primaryEmotion}

SECONDARY CHARACTER:
Name: ${formData.secondaryChar || 'None'}
Description: ${formData.secondaryCharDescription || 'None'}
Voice: ${formData.secondaryVoice || 'N/A'}
Consistency Rules: ${formData.secondaryConsistencyRules || 'None'}
Dialogue: ${formData.secondaryDialogue || 'None'}
${extraCharsPrompt}
NARRATOR / VOICEOVER:
Text: ${formData.narratorText || 'None'}
Voice Gender: ${formData.narratorGender}
Voice Tone: ${formData.narratorTone}

[TIMELINE & LIP SYNC DATA]
${generateLipSyncData(formData)}

ENVIRONMENT:
Setting: ${formData.setting || sceneMemory.setting || 'Appropriate'}
Lighting: ${formData.lighting}
Time: ${formData.timeOfDay}

TRANSITION: ${transitionInst}

Generate complete Veo 3 prompt with PERFECT consistency and ${formData.visualStyle} visual style.
Ensure the [VISUAL FOCUS & TIMELINE] provides a specific breakdown like "00.00 - 00.03: Description..." with detailed camera angles (e.g., Low angle, Dutch tilt, Close-up) for each segment.
STRICTLY END TIMELINE AT 00:08.`;

        // Call backend
        const response = await fetch('http://localhost:5001/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: apiKey,
                model: model,
                prompt: `<|system|>${systemPrompt}</s><|user|>${userPrompt}</s><|assistant|>`
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Generation failed');
        }

        const data = await response.json();
        let generatedPrompt = '';

        if (Array.isArray(data) && data[0]?.generated_text) {
            generatedPrompt = data[0].generated_text;
        } else if (data.generated_text) {
            generatedPrompt = data.generated_text;
        } else {
            throw new Error('Unexpected response');
        }

        generatedPrompt = generatedPrompt.trim();

        // Store scene data with the generated result
        storeCurrentScene(formData, generatedPrompt);

        // Show output
        document.getElementById('loading').classList.remove('visible');
        document.getElementById('outputText').textContent = generatedPrompt;
        document.getElementById('outputText').classList.add('visible');
        document.getElementById('copyBtn').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'inline-flex';
        document.getElementById('veoBtn').style.display = 'inline-flex';

        showStatus('✨ Prompt generated with perfect consistency!', 'success');

        // Scroll to the output card so the user sees the header and start of prompt
        const outputCard = document.getElementById('outputCard');
        if (outputCard) {
            outputCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').classList.remove('visible');
        document.getElementById('outputPlaceholder').style.display = 'block';

        let errorMessage = error.message;
        if (errorMessage.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to backend. Make sure Flask server is running on port 5001.';
        }

        showStatus(`Error: ${errorMessage}`, 'error');
    }
}

// Utility functions
function copyPrompt() {
    const text = document.getElementById('outputText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy', 2000);
    });
}

function downloadPrompt() {
    const text = document.getElementById('outputText').textContent;
    const sceneNum = document.getElementById('sceneNumber').value.replace(/\s/g, '_');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veo_prompt_scene_${sceneNum}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function openVeo() {
    window.open('https://veo.google', '_blank');
}

function clearForm() {
    if (confirm('Clear for next scene? (Character data preserved)')) {
        document.getElementById('sceneDescription').value = '';
        document.getElementById('primaryDialogue').value = '';
        document.getElementById('secondaryDialogue').value = '';
        document.getElementById('narratorText').value = '';

        // Remove extra characters
        document.getElementById('extraCharactersContainer').innerHTML = '';
        extraCharCount = 0;
        // Clear extra uploaded images from memory object (keep primary/secondary)
        Object.keys(uploadedImages).forEach(key => {
            if (key.startsWith('extra_char_')) {
                delete uploadedImages[key];
            }
        });

        // Auto-increment scene
        const sceneNumInput = document.getElementById('sceneNumber');
        const match = sceneNumInput.value.match(/(\d+)\s+of\s+(\d+)/);
        if (match) {
            const current = parseInt(match[1]);
            const total = parseInt(match[2]);
            if (current < total) {
                sceneNumInput.value = `${current + 1} of ${total}`;
            }
        }

        showStatus('Ready for next scene!', 'success');
    }
}

function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message visible ${type}`;

    setTimeout(() => {
        statusEl.classList.remove('visible');
    }, 7000);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Load Hugging Face key
    const savedApiKey = localStorage.getItem('hf_api_key');
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }

    // Load Gemini key
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    if (savedGeminiKey) {
        document.getElementById('geminiKey').value = savedGeminiKey;
    }

    // Save keys when changed
    document.getElementById('apiKey').addEventListener('change', (e) => {
        localStorage.setItem('hf_api_key', e.target.value);
    });

    document.getElementById('geminiKey').addEventListener('change', (e) => {
        localStorage.setItem('gemini_api_key', e.target.value);
    });

    loadMemory();
});
