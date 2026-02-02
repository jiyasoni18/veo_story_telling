// --- SCENE SCRIPT ANALYSIS ---

let scriptScenes = [];
let scriptTitle = "";
let currentScriptSceneIndex = 0;

async function analyzeRawScript() {
    const script = document.getElementById('rawScript').value;
    const hfToken = document.getElementById('apiKey').value;

    if (!script) { showStatus('Please enter a script!', 'error'); return; }
    if (!hfToken) { showStatus('Hugging Face Token required (in API Settings)!', 'error'); toggleApiSettings(); return; }

    const btn = document.getElementById('analyzeScriptBtn');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = '🔮 AI Analyzing & Breaking Down...';

    try {
        const response = await fetch('http://localhost:5001/api/analyze_script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                script: script,
                token: hfToken,
                model: document.getElementById('modelSelect').value
            })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error);
        if (!data.scenes || data.scenes.length === 0) throw new Error('No scenes generated');

        scriptScenes = data.scenes;
        scriptTitle = data.story_title || data.StoryTitle || data.title || "Untitled Story";
        currentScriptSceneIndex = 0;

        document.getElementById('sceneNavigation').style.display = 'block';
        showStatus(`Summary: ${scriptTitle}. Broken into ${scriptScenes.length} scenes.`, 'success');

        // CLEAR existing character mapping so new characters can be assigned
        document.getElementById('primaryChar').value = '';
        document.getElementById('secondaryChar').value = '';

        // Also clear any previous extra characters to prevent ghost characters
        document.getElementById('extraCharactersContainer').innerHTML = '';

        loadSceneIntoForm(0);

    } catch (error) {
        console.error(error);
        showStatus(`Analysis Failed: ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

function navigateScene(direction) {
    const newIndex = currentScriptSceneIndex + direction;
    if (newIndex >= 0 && newIndex < scriptScenes.length) {
        currentScriptSceneIndex = newIndex;
        loadSceneIntoForm(newIndex);
    }
}

function loadSceneIntoForm(index) {
    const scene = scriptScenes[index];
    if (!scene) return;

    // Update UI Counter
    document.getElementById('sceneCounter').innerText = `Scene ${index + 1} of ${scriptScenes.length}`;
    document.getElementById('sceneCounter').style.color = (index === scriptScenes.length - 1) ? 'var(--highlight)' : 'var(--primary)';

    // 1. Fill Metadata
    if (scriptTitle && document.getElementById('storyTitle')) {
        document.getElementById('storyTitle').value = scriptTitle;
    }
    document.getElementById('sceneDescription').value = scene.description || scene.location || '';
    document.getElementById('sceneNumber').value = scene.scene_number || (index + 1);

    // Setting / Location
    const setVal = scene.setting || scene.location || scene.environment || '';
    if (setVal) document.getElementById('setting').value = setVal;

    // Smart dropdown matching
    const lightVal = scene.lighting || scene.Lighting || '';
    const timeVal = scene.time_of_day || scene.time || scene.TimeOD || '';

    if (lightVal) setDropdownByText('lighting', lightVal);
    if (timeVal) setDropdownByText('timeOfDay', timeVal);

    // 2. Clear Dialogues/Emotions (PREPARE FOR NEW VALUES)
    document.getElementById('primaryDialogue').value = '';
    document.getElementById('secondaryDialogue').value = '';
    document.getElementById('primaryEmotion').selectedIndex = 0;
    document.getElementById('secondaryEmotion').selectedIndex = 0;

    // 3. Smart Character Mapping
    if (scene.characters && Array.isArray(scene.characters)) {
        scene.characters.forEach(char => {
            const charName = char.name || char.Name || 'Unknown';
            const dialogue = char.dialogue || char.Dialogue || '';
            const emotion = char.emotion || char.Emotion || '';
            const desc = char.description || char.Description || '';
            const voice = char.voice_type || char.voice || char.Voice || '';

            // Get inputs
            const pInput = document.getElementById('primaryChar');
            const sInput = document.getElementById('secondaryChar');

            let matched = false;

            // 3a. CHECK EXISTING MAPPING (Case-insensitive)
            if (pInput.value && charName.toLowerCase().includes(pInput.value.toLowerCase())) {
                updateCharacterFields('primary', dialogue, emotion, desc, voice);
                matched = true;
            } else if (sInput.value && charName.toLowerCase().includes(sInput.value.toLowerCase())) {
                updateCharacterFields('secondary', dialogue, emotion, desc, voice);
                matched = true;
            }

            // 3b. ASSIGN TO EMPTY SLOTS
            if (!matched) {
                if (!pInput.value) {
                    pInput.value = charName;
                    updateCharacterFields('primary', dialogue, emotion, desc, voice);
                } else if (!sInput.value) {
                    sInput.value = charName;
                    updateCharacterFields('secondary', dialogue, emotion, desc, voice);
                    expandSection('secondary');
                } else {
                    // Start adding extra characters if both slots full (basic implementation)
                    console.log(`No slot for ${charName}, active slots full.`);
                }
            }
        });
    }

    showStatus(`Loaded information for Scene ${index + 1}`, 'success');
}

function updateCharacterFields(type, dialogue, emotion, description, voice) {
    document.getElementById(`${type}Dialogue`).value = dialogue;

    if (emotion) setDropdownByText(`${type}Emotion`, emotion);
    if (voice) setDropdownByText(`${type}Voice`, voice);

    if (description) {
        const descId = (type === 'primary') ? 'charDescription' : `${type}CharDescription`;
        const el = document.getElementById(descId);
        if (el) el.value = description;
    }
}

function setDropdownByText(selectId, text) {
    const select = document.getElementById(selectId);
    if (!select || !text) return;

    // Normalize text (remove underscores, etc if needed, but for now strict-ish match)
    const lowerText = text.toLowerCase();

    for (let i = 0; i < select.options.length; i++) {
        const opt = select.options[i];
        if (opt.value.toLowerCase().includes(lowerText) || opt.text.toLowerCase().includes(lowerText)) {
            select.selectedIndex = i;
            return;
        }
    }
}

function expandSection(type) {
    // Quick hack to find the header and click it if not open
    // Assuming structure: Header -> Content
    // Primary is hard to target by type alone without ID, but secondary has ID 'secondaryChar' inside
    const input = document.getElementById(`${type}Char`);
    if (input) {
        const content = input.closest('.collapsible-content');
        if (content && !content.classList.contains('open')) {
            content.classList.add('open');
            content.previousElementSibling.querySelector('.collapsible-toggle').classList.add('open');
        }
    }
}
