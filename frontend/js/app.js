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
