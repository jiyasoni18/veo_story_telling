import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TalkingVeggiesProject from './TalkingVeggiesProject';
import {
    Plus,
    Image as ImageIcon,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Save,
    Play,
    Loader2,
    CheckCircle2,
    AlertCircle,
    UserCircle,
    ArrowLeft,
    Trash2,
    Type,
    Film,
    X,
    Copy,
    Check
} from 'lucide-react';

const StoryProject = () => {
    const { id } = useParams();
    const projectId = id;
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [scenes, setScenes] = useState([]);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Character Management State
    const [showCharModal, setShowCharModal] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState(false);
    const [savingChar, setSavingChar] = useState(false);
    const [characterName, setCharacterName] = useState('');
    const [voiceId, setVoiceId] = useState('');
    const [voiceTone, setVoiceTone] = useState('');
    const [characterTraits, setCharacterTraits] = useState('');
    const [characterImage, setCharacterImage] = useState(null);

    // Voice Lock Characteristics
    const [ageRange, setAgeRange] = useState('early 30s');
    const [vocalQuality, setVocalQuality] = useState('');
    const [speakingStyle, setSpeakingStyle] = useState('');
    const [accent, setAccent] = useState('neutral American accent');
    const [emotionalBaseline, setEmotionalBaseline] = useState('');

    // Visual Style
    const [characterVisualStyle, setCharacterVisualStyle] = useState('Cinematic Photorealism');
    const [backgroundVisualStyle, setBackgroundVisualStyle] = useState('Cinematic Photorealism');
    const [isNarrator, setIsNarrator] = useState(false);
    const [narratorMode, setNarratorMode] = useState('narrator_with_visuals');

    // Script Breaker State
    const [scriptText, setScriptText] = useState('');
    const [breakingScript, setBreakingScript] = useState(false);

    // Prompt Generation State
    const [generatingPrompt, setGeneratingPrompt] = useState(null);
    const [copiedPrompt, setCopiedPrompt] = useState(null);

    useEffect(() => {
        if (projectId) {
            fetchProjectData();
        }
    }, [projectId]);

    const fetchProjectData = async () => {
        setLoading(true);
        try {
            const [projRes, scenesRes] = await Promise.all([
                axios.get(`/api/v1/projects/${projectId}`),
                axios.get(`/api/v1/projects/${projectId}/scenes`)
            ]);
            setProject(projRes.data);
            setScenes(scenesRes.data);
        } catch (error) {
            console.error("Failed to fetch project data:", error);
            setError("Project not found or server error.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result;
            setCharacterImage(base64);
            setAnalyzingImage(true);

            try {
                const response = await axios.post('/api/v1/ai/analyze-character', {
                    image_base64: base64
                });
                setCharacterTraits(response.data.traits);
            } catch (error) {
                console.error("Analysis failed:", error);
            } finally {
                setAnalyzingImage(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSaveCharacter = async () => {
        if (!characterName) {
            alert("Please enter a character name");
            return;
        }

        try {
            setSavingChar(true);

            // Ensure project and characters exist
            const currentChars = (project && project.characters) || {};

            const updatedChars = {
                ...currentChars,
                [characterName]: {
                    traits: characterTraits,
                    voice_id: voiceId || "V1_Standard",
                    voice_tone: voiceTone || "Professional",
                    image: characterImage,
                    // Voice Lock Characteristics
                    age_range: ageRange,
                    vocal_quality: vocalQuality,
                    speaking_style: speakingStyle,
                    accent: accent,
                    emotional_baseline: emotionalBaseline,
                    // Visual Style
                    visual_style: characterVisualStyle,
                    // Narrator flag
                    is_narrator: isNarrator
                }
            };

            const response = await axios.put(`/api/v1/projects/${projectId}`, {
                name: project.name || "Untitled Project",
                project_type: project.project_type || "storytelling",
                characters: updatedChars,
                settings: project.settings || { visual_style: "Cinematic Photorealism", default_duration: 8 }
            });

            if (response.data) {
                setProject(response.data);
                setShowCharModal(false);
                resetCharModal();
                alert("Character saved successfully!");
            }
        } catch (error) {
            console.error("Save failed:", error);
            const msg = error.response?.data?.detail || "Failed to save character. Check connection.";
            alert(msg);
        } finally {
            setSavingChar(false);
        }
    };

    const handleDeleteCharacter = async (name) => {
        if (!window.confirm(`Delete ${name}?`)) return;

        try {
            const updatedChars = { ...project.characters };
            delete updatedChars[name];

            const response = await axios.put(`/api/v1/projects/${projectId}`, {
                name: project.name,
                project_type: project.project_type,
                characters: updatedChars,
                settings: project.settings
            });
            setProject(response.data);
        } catch (error) {
            alert("Failed to delete character");
        }
    };

    const resetCharModal = () => {
        setCharacterName('');
        setVoiceId('');
        setVoiceTone('');
        setCharacterTraits('');
        setCharacterImage(null);
        // Reset voice characteristics
        setAgeRange('early 30s');
        setVocalQuality('');
        setSpeakingStyle('');
        setAccent('neutral American accent');
        setEmotionalBaseline('');
        // Reset visual style
        setCharacterVisualStyle('Cinematic Photorealism');
        // Reset narrator flag
        setIsNarrator(false);
    };

    const handleBreakScript = async () => {
        if (!scriptText.trim()) return;
        setBreakingScript(true);
        try {
            // First, update project settings with background visual style
            await axios.put(`/api/v1/projects/${projectId}`, {
                name: project.name || "Untitled Project",
                project_type: project.project_type || "storytelling",
                characters: project.characters || {},
                settings: {
                    ...project.settings,
                    background_visual_style: backgroundVisualStyle,
                    narrator_mode: narratorMode
                }
            });

            const cleanText = scriptText.replace(/[\x00-\x1F\x7F-\x9F]/g, " ").trim();
            const response = await axios.post('/api/v1/ai/break-script', {
                story_text: cleanText,
                characters: project.characters || {},  // Send full character data
                background_visual_style: backgroundVisualStyle,  // Send background style
                narrator_mode: narratorMode  // Send narrator mode
            });

            await axios.delete(`/api/v1/projects/${projectId}/scenes`);

            for (const scene of response.data.scenes) {
                await axios.post(`/api/v1/projects/${projectId}/scenes`, {
                    scene_number: scene.scene_number,
                    description: scene.description,
                    scene_type: scene.scene_type || "action",
                    dialogue: scene.dialogue || "",
                    camera_angle: scene.camera_angle || "Eye level",
                    transition_type: scene.transition_type || "Cut",
                    characters_in_scene: scene.characters ? scene.characters.reduce((acc, char) => ({ ...acc, [char.name]: { dialogue: char.dialogue || "" } }), {}) : {},
                    emotion: scene.emotion || "neutral"
                });
            }

            const scenesRes = await axios.get(`/api/v1/projects/${projectId}/scenes`);
            setScenes(scenesRes.data);
            setCurrentSceneIndex(0);
            alert("Script broken into scenes successfully!");
        } catch (error) {
            console.error("Script break failed:", error);
            alert("Failed to break script. Check your internet and API key.");
        } finally {
            setBreakingScript(false);
        }
    };

    const generateTechnicalPrompt = async (sceneId) => {
        setGeneratingPrompt(sceneId);
        try {
            const response = await axios.post('/api/v1/ai/generate-scene-prompt', {
                project_id: projectId,
                scene_id: sceneId
            });

            setScenes(scenes.map(s =>
                s.id === sceneId ? { ...s, generated_prompt: response.data.generated_prompt } : s
            ));
        } catch (error) {
            console.error("Prompt generation failed:", error);
            alert("Failed to generate prompt.");
        } finally {
            setGeneratingPrompt(null);
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm("Delete this entire project? This cannot be undone.")) return;
        try {
            await axios.delete(`/api/v1/projects/${projectId}`);
            navigate('/');
        } catch (error) {
            alert("Failed to delete project");
        }
    };

    const handleCopyPrompt = async (sceneId, promptText) => {
        try {
            await navigator.clipboard.writeText(promptText);
            setCopiedPrompt(sceneId);
            setTimeout(() => setCopiedPrompt(null), 2000); // Reset after 2 seconds
        } catch (error) {
            console.error("Failed to copy:", error);
            alert("Failed to copy to clipboard");
        }
    };

    if (loading) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '20px' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            <p>Loading Cinematic Project...</p>
        </div>
    );

    if (error) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column' }}>
            <AlertCircle size={48} color="#ef4444" />
            <h2 style={{ mt: '20px' }}>{error}</h2>
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/dashboard')}>
                Back to Dashboard
            </button>
        </div>
    );

    // If project type is talking_character, show Talking Veggies interface
    if (project && project.project_type === 'talking_character') {
        return <TalkingVeggiesProject project={project} />;
    }

    const currentScene = scenes[currentSceneIndex];

    return (
        <div className="project-container animate-fade-in">
            {/* Header */}
            <header className="story-header glass">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="badge">STORYTELLING ARCHIVE</span>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{project.name}</h1>
                    </div>
                </div>
                <button
                    className="btn-secondary"
                    onClick={handleDeleteProject}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px'
                    }}
                >
                    <Trash2 size={16} />
                    Delete Project
                </button>
            </header>

            {/* Step 1: Configuration */}
            <section className="setup-grid">
                <div className="setup-card glass">
                    <div className="card-header">
                        <Type size={20} color="var(--primary)" />
                        <h3>1. The Script</h3>
                    </div>
                    <textarea
                        className="script-input"
                        placeholder="Paste your raw story here... Rohan enters the room looking tired. Maa smiles and says 'Welcome home'..."
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                    />
                </div>

                <div className="setup-card glass">
                    <div className="card-header">
                        <UserCircle size={20} color="var(--accent)" />
                        <h3>2. Character Library</h3>
                    </div>
                    <div className="char-mini-grid">
                        {Object.entries(project.characters || {}).map(([name, data]) => (
                            <div key={name} className="char-bubble">
                                <div className="bubble-avatar">
                                    {data.image ? <img src={data.image} alt={name} /> : name[0]}
                                </div>
                                <div className="bubble-info">
                                    <span className="name">{name}</span>
                                    <span className="voice">{data.voice_id}</span>
                                </div>
                                <button className="delete-char" onClick={() => handleDeleteCharacter(name)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button className="add-char-btn" onClick={() => setShowCharModal(true)}>
                            <Plus size={20} />
                            <span>Add Character</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Background Visual Style Section */}
            <section className="setup-grid" style={{ marginTop: '30px' }}>
                <div className="setup-card glass">
                    <div className="card-header">
                        <Film size={20} color="var(--accent)" />
                        <h3>3. Background / Environment Visual Style</h3>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <label className="input-label">🌍 Environment Visual Style</label>
                        <select
                            className="input-field"
                            value={backgroundVisualStyle}
                            onChange={(e) => setBackgroundVisualStyle(e.target.value)}
                            style={{ cursor: 'pointer', maxWidth: '500px' }}
                        >
                            <option value="Cinematic Photorealism">📸 Photorealistic / Cinematic (Default)</option>
                            <option value="3D Rendered Environment">🎮 3D Rendered Environment (Game-like)</option>
                            <option value="2D Anime Background">🎌 2D Anime Background Style</option>
                            <option value="Oil Painting Background">🎨 Oil Painting / Artistic Background</option>
                            <option value="Watercolor Background">🖌️ Watercolor / Painterly Background</option>
                            <option value="Minimalist/Abstract">⚪ Minimalist / Abstract Background</option>
                            <option value="Cyberpunk/Neon Environment">🌃 Cyberpunk / Neon Environment</option>
                            <option value="Vintage Film Background">🎞️ Vintage Film Background</option>
                            <option value="Fantasy/Magical Environment">✨ Fantasy / Magical Environment</option>
                            <option value="Sci-Fi/Futuristic">🚀 Sci-Fi / Futuristic Environment</option>
                        </select>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '12px' }}>
                            This style will be applied to all backgrounds and environments across all scenes
                        </p>
                    </div>
                </div>

                <div className="setup-card glass">
                    <div className="card-header">
                        <UserCircle size={20} color="var(--primary)" />
                        <h3>4. Narrator Mode</h3>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <label className="input-label">🎙️ Narrator Behavior</label>
                        <select
                            className="input-field"
                            value={narratorMode}
                            onChange={(e) => setNarratorMode(e.target.value)}
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="narrator_with_visuals">🎬 Narrator + Visual Scenes</option>
                            <option value="narrator_only">🎙️ Narrator Only (Characters Silent)</option>
                            <option value="none">💬 None (Characters Speak Only)</option>
                        </select>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '12px' }}>
                            {narratorMode === 'narrator_with_visuals'
                                ? 'Narrator speaks as voiceover while characters are shown visually and can also speak with lip-sync'
                                : narratorMode === 'narrator_only'
                                    ? 'ONLY narrator speaks; characters shown visually but remain completely silent (no lip-sync)'
                                    : 'NO narrator; only characters speak with lip-sync and perform actions'}
                        </p>
                        <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            background: 'rgba(138, 43, 226, 0.1)',
                            border: '1px solid rgba(138, 43, 226, 0.3)',
                            borderRadius: '8px'
                        }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0 }}>
                                💡 <strong>Tip:</strong> Mark a character as "Narrator" in Character Library to enable voiceover
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Break Button */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                <button
                    className="btn-mega"
                    onClick={handleBreakScript}
                    disabled={breakingScript || !scriptText.trim()}
                >
                    {breakingScript ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <Sparkles size={24} />
                    )}
                    {breakingScript ? 'Artificial Intelligence Dividing Script...' : 'Split into 8-Second Scenes'}
                </button>
            </div>

            {/* Step 2: Review (Horizontal Stepper) */}
            {scenes.length > 0 && (
                <section className="scene-review-section animate-slide-up">
                    <div className="section-divider">
                        <span>PREVIEW & PROMPT GENERATION</span>
                    </div>

                    <div className="scene-carousel-container">
                        <button
                            className="nav-arrow left"
                            disabled={currentSceneIndex === 0}
                            onClick={() => setCurrentSceneIndex(i => i - 1)}
                        >
                            <ChevronLeft size={32} />
                        </button>

                        <div className="scene-display-card glass">
                            <div className="scene-card-header">
                                <span className="scene-tag">SCENE {currentScene.scene_number} OF {scenes.length}</span>
                                <div className="scene-meta">
                                    <span>{currentScene.duration}s</span>
                                    <span className="dot"></span>
                                    <span>{currentScene.scene_type}</span>
                                </div>
                            </div>

                            <div className="scene-body">
                                <div className="scene-visual-desc">
                                    <h4>Visual Direction</h4>
                                    <p>{currentScene.description}</p>

                                    <div className="mini-meta-grid">
                                        <div className="m-item"><strong>Camera:</strong> {currentScene.camera_angle}</div>
                                        <div className="m-item"><strong>Transition:</strong> {currentScene.transition_type}</div>
                                        <div className="m-item"><strong>Emotion:</strong> {currentScene.emotion}</div>
                                    </div>
                                </div>

                                {currentScene.dialogue && (
                                    <div className="scene-dialogue-box">
                                        <h4>Dialogue</h4>
                                        <p>"{currentScene.dialogue}"</p>
                                    </div>
                                )}

                                <div className="technical-prompt-area">
                                    {currentScene.generated_prompt ? (
                                        <div className="generated-prompt glass">
                                            <div className="prompt-header">
                                                <Film size={16} />
                                                <span>GOOGLE VEO TECHNICAL PROMPT</span>
                                            </div>
                                            <p>{currentScene.generated_prompt}</p>
                                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => handleCopyPrompt(currentScene.id, currentScene.generated_prompt)}
                                                    style={{ flex: 1 }}
                                                >
                                                    {copiedPrompt === currentScene.id ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedPrompt === currentScene.id ? 'Copied!' : 'Copy Prompt'}
                                                </button>
                                                <button
                                                    className="btn-regenerate"
                                                    onClick={() => generateTechnicalPrompt(currentScene.id)}
                                                    disabled={generatingPrompt === currentScene.id}
                                                    style={{ flex: 1 }}
                                                >
                                                    {generatingPrompt === currentScene.id ? <Loader2 className="animate-spin" /> : <Sparkles size={14} />}
                                                    Regenerate
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn-primary generate-btn"
                                            onClick={() => generateTechnicalPrompt(currentScene.id)}
                                            disabled={generatingPrompt === currentScene.id}
                                        >
                                            {generatingPrompt === currentScene.id ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                            Construct Veo Prompt
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            className="nav-arrow right"
                            disabled={currentSceneIndex === scenes.length - 1}
                            onClick={() => setCurrentSceneIndex(i => i + 1)}
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>

                    <div className="carousel-dots">
                        {scenes.map((_, idx) => (
                            <div
                                key={idx}
                                className={`dot ${idx === currentSceneIndex ? 'active' : ''}`}
                                onClick={() => setCurrentSceneIndex(idx)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Character Modal */}
            {showCharModal && (
                <div className="modal-overlay">
                    <div className="glass modal-content animate-pop" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <div>
                                <h3>Character Training</h3>
                                <p style={{ color: 'var(--text-dim)', margin: '8px 0 0 0', fontSize: '0.95rem' }}>
                                    Define visual identity once - AI will maintain consistency across all scenes
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCharModal(false);
                                    resetCharModal();
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    color: 'white',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label className="input-label">Character Name (Must match script)</label>
                            <input
                                className="input-field"
                                placeholder="e.g. Rohan"
                                value={characterName}
                                onChange={(e) => setCharacterName(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label className="input-label">🎨 Character Visual Style</label>
                            <select
                                className="input-field"
                                value={characterVisualStyle}
                                onChange={(e) => setCharacterVisualStyle(e.target.value)}
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="Cinematic Photorealism">📸 Photorealistic / Cinematic (Default)</option>
                                <option value="3D Animation (Pixar/Disney Style)">🧸 3D Animation (Pixar/Disney Style)</option>
                                <option value="2D Anime Style">🎌 2D Anime / Manga Style</option>
                                <option value="Oil Painting Art Style">🎨 Oil Painting / Artistic</option>
                                <option value="Watercolor Art Style">🖌️ Watercolor / Painterly</option>
                                <option value="Digital AI Avatar">🤖 Digital Avatar / AI Character</option>
                                <option value="Cyberpunk/Futuristic">🌃 Cyberpunk / Futuristic</option>
                                <option value="Vintage Film (1950s)">🎞️ Vintage Film Look</option>
                                <option value="Claymation/Stop-Motion">🎭 Claymation / Stop-Motion</option>
                            </select>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                                This style will be applied to this character in all scenes
                            </p>
                        </div>

                        <div className="char-upload-zone">
                            {characterImage ? (
                                <img src={characterImage} className="char-preview" onClick={() => document.getElementById('comp-upload').click()} />
                            ) : (
                                <label htmlFor="comp-upload" className="upload-placeholder">
                                    {analyzingImage ? <Loader2 className="animate-spin" size={32} /> : <ImageIcon size={32} />}
                                    <span>{analyzingImage ? 'AI Analyzing Traits...' : 'Upload Reference Image'}</span>
                                </label>
                            )}
                            <input type="file" id="comp-upload" hidden onChange={handleImageUpload} accept="image/*" />
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label className="input-label">Visual Traits (Auto-generated or Manual)</label>
                            <textarea
                                className="input-field"
                                style={{ minHeight: '120px', resize: 'vertical' }}
                                placeholder="Deep set eyes, tired expression, wearing a brown jacket..."
                                value={characterTraits}
                                onChange={(e) => setCharacterTraits(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="col">
                                <label className="input-label">Voice ID</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Male_Deep_01"
                                    value={voiceId}
                                    onChange={(e) => setVoiceId(e.target.value)}
                                />
                            </div>
                            <div className="col">
                                <label className="input-label">Voice Tone</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Weary, Monotone"
                                    value={voiceTone}
                                    onChange={(e) => setVoiceTone(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Voice Lock Characteristics Section */}
                        <div style={{
                            marginTop: '24px',
                            padding: '20px',
                            background: 'rgba(138, 43, 226, 0.05)',
                            border: '2px solid rgba(138, 43, 226, 0.3)',
                            borderRadius: '12px'
                        }}>
                            <h4 style={{
                                margin: '0 0 16px 0',
                                color: 'var(--primary)',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🔒 Voice Characteristics (For Perfect Consistency)
                            </h4>
                            <p style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-dim)',
                                marginBottom: '20px'
                            }}>
                                These settings ensure the character's voice remains identical across all scenes
                            </p>

                            <div style={{ marginBottom: '16px' }}>
                                <label className="input-label">Age Range</label>
                                <select
                                    className="input-field"
                                    value={ageRange}
                                    onChange={(e) => setAgeRange(e.target.value)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="early 20s">Early 20s</option>
                                    <option value="mid-20s">Mid 20s</option>
                                    <option value="late 20s">Late 20s</option>
                                    <option value="early 30s">Early 30s</option>
                                    <option value="mid-30s">Mid 30s</option>
                                    <option value="late 30s">Late 30s</option>
                                    <option value="early 40s">Early 40s</option>
                                    <option value="mid-40s">Mid 40s</option>
                                    <option value="late 40s">Late 40s</option>
                                    <option value="early 50s">Early 50s</option>
                                    <option value="mid-50s">Mid 50s</option>
                                    <option value="late 50s">Late 50s</option>
                                    <option value="60s">60s</option>
                                    <option value="70s">70s</option>
                                    <option value="80s">80s</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label className="input-label">Vocal Quality</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g., clear alto voice, deep baritone"
                                    value={vocalQuality}
                                    onChange={(e) => setVocalQuality(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label className="input-label">Speaking Style</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g., steady and purposeful tone"
                                    value={speakingStyle}
                                    onChange={(e) => setSpeakingStyle(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label className="input-label">Accent</label>
                                <select
                                    className="input-field"
                                    value={accent}
                                    onChange={(e) => setAccent(e.target.value)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="neutral American accent">Neutral American</option>
                                    <option value="neutral Indian accent">Neutral Indian</option>
                                    <option value="soft Irish accent">Soft Irish</option>
                                    <option value="refined British accent">Refined British</option>
                                    <option value="Southern American accent">Southern American</option>
                                    <option value="Eastern European accent">Eastern European</option>
                                    <option value="Australian accent">Australian</option>
                                    <option value="Scottish accent">Scottish</option>
                                    <option value="no discernible accent">No Discernible Accent</option>
                                </select>
                            </div>

                            <div>
                                <label className="input-label">Emotional Baseline</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g., quiet courage and underlying vulnerability"
                                    value={emotionalBaseline}
                                    onChange={(e) => setEmotionalBaseline(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowCharModal(false);
                                    resetCharModal();
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSaveCharacter}
                                disabled={savingChar || !characterName}
                            >
                                {savingChar ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Character
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .project-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-bottom: 100px;
                }
                .story-header {
                    padding: 20px 30px;
                    border-radius: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }
                .back-btn {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .back-btn:hover { background: var(--primary); transform: translateX(-5px); }
                
                .badge {
                    font-size: 0.7rem;
                    background: rgba(138,43,226,0.2);
                    color: var(--primary);
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .setup-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 30px;
                }
                .setup-card {
                    padding: 30px;
                    border-radius: 24px;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .card-header h3 { margin: 0; font-size: 1.3rem; }

                .script-input {
                    width: 100%;
                    min-height: 250px;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 20px;
                    color: var(--text);
                    font-family: 'Inter', sans-serif;
                    font-size: 1.05rem;
                    line-height: 1.6;
                    resize: vertical;
                }

                .char-mini-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .char-bubble {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border);
                    padding: 12px;
                    border-radius: 16px;
                    position: relative;
                }
                .bubble-avatar {
                    width: 45px;
                    height: 45px;
                    border-radius: 12px;
                    background: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    overflow: hidden;
                }
                .bubble-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .bubble-info { display: flex; flex-direction: column; }
                .bubble-info .name { font-weight: 600; font-size: 1rem; }
                .bubble-info .voice { font-size: 0.75rem; color: var(--text-dim); }
                
                .delete-char {
                    position: absolute;
                    right: 15px;
                    background: none;
                    border: none;
                    color: #4b5563;
                    cursor: pointer;
                    transition: color 0.3s;
                }
                .delete-char:hover { color: #ef4444; }

                .add-char-btn {
                    border: 2px dashed var(--border);
                    background: none;
                    color: var(--text-dim);
                    padding: 15px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .add-char-btn:hover { border-color: var(--primary); color: var(--primary); background: rgba(138,43,226,0.05); }

                .btn-mega {
                    padding: 20px 50px;
                    font-size: 1.2rem;
                    font-weight: 800;
                    border-radius: 50px;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    cursor: pointer;
                    box-shadow: 0 10px 30px rgba(138,43,226,0.3);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .btn-mega:hover:not(:disabled) { transform: translateY(-5px) scale(1.05); box-shadow: 0 15px 40px rgba(138,43,226,0.5); }
                .btn-mega:disabled { opacity: 0.5; cursor: not-allowed; }

                .section-divider {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 60px 0 40px;
                    position: relative;
                }
                .section-divider::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 1px;
                    background: linear-gradient(to right, transparent, var(--border), transparent);
                }
                .section-divider span {
                    background: #0f172a;
                    padding: 0 20px;
                    position: relative;
                    color: var(--text-dim);
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                }

                .scene-review-section { margin-top: 40px; }
                .scene-carousel-container {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .nav-arrow {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    color: white;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .nav-arrow:hover:not(:disabled) { background: var(--primary); border-color: var(--primary); color: white; }
                .nav-arrow:disabled { opacity: 0.1; cursor: not-allowed; }

                .scene-display-card {
                    flex: 1;
                    padding: 40px;
                    border-radius: 32px;
                    min-height: 400px;
                }
                .scene-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .scene-tag { font-weight: 800; font-size: 0.9rem; color: var(--accent); letter-spacing: 1px; }
                .scene-meta { display: flex; align-items: center; gap: 10px; color: var(--text-dim); font-weight: 600; }
                .dot { width: 4px; height: 4px; border-radius: 50%; background: var(--border); }

                .scene-body { display: flex; flex-direction: column; gap: 30px; }
                .scene-visual-desc h4, .scene-dialogue-box h4 { 
                    font-size: 0.8rem; 
                    text-transform: uppercase; 
                    color: var(--primary); 
                    margin-bottom: 10px; 
                    letter-spacing: 1px; 
                }
                .scene-visual-desc p { font-size: 1.3rem; line-height: 1.5; font-weight: 500; }
                
                .mini-meta-grid { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 15px; 
                    margin-top: 20px; 
                }
                .m-item { font-size: 0.85rem; color: var(--text-dim); }
                .m-item strong { color: white; display: block; margin-bottom: 2px; font-size: 0.75rem; text-transform: uppercase; }

                .scene-dialogue-box {
                    background: rgba(138,43,226,0.1);
                    border-left: 4px solid var(--primary);
                    padding: 20px;
                    border-radius: 0 12px 12px 0;
                }
                .scene-dialogue-box p { font-style: italic; font-size: 1.1rem; color: #e2e8f0; }

                .technical-prompt-area { margin-top: 20px; }
                .generated-prompt {
                    padding: 25px;
                    border-radius: 16px;
                    border: 1px dashed var(--primary);
                    background: rgba(0,0,0,0.2);
                    position: relative;
                }
                .prompt-header { 
                    display: flex; 
                    align-items: center; 
                    gap: 8px; 
                    font-size: 0.75rem; 
                    font-weight: 700; 
                    color: var(--primary); 
                    margin-bottom: 15px; 
                }
                .generated-prompt p { font-family: monospace; font-size: 0.95rem; line-height: 1.6; color: #d1d5db; }
                
                .btn-regenerate {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .generate-btn {
                    width: 100%;
                    padding: 18px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    border-radius: 12px;
                }

                .carousel-dots {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 30px;
                }
                .carousel-dots .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--border);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .carousel-dots .dot.active {
                    background: var(--primary);
                    transform: scale(1.3);
                    box-shadow: 0 0 10px var(--primary);
                }

                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
                
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(10px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 5000;
                    overflow-y: auto;
                    padding: 40px 20px;
                }
                .modal-content {
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    padding: 40px;
                    border: 1px solid var(--border);
                    position: relative;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    overflow-y: auto;
                    margin: auto;
                }
                .modal-header {
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--border);
                    position: sticky;
                    top: 0;
                    background: var(--bg-card);
                    z-index: 10;
                }
                .modal-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: white;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid var(--border);
                    position: sticky;
                    bottom: 0;
                    background: var(--bg-card);
                    z-index: 10;
                }
                `
            }} />
        </div>
    );
};

export default StoryProject;
