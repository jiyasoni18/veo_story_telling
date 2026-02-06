import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Copy,
    Check,
    User,
    Globe,
    Mic,
    Loader2,
    MessageSquare,
    ArrowLeft
} from 'lucide-react';

const TalkingVeggiesProject = ({ project }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [scenes, setScenes] = useState([]);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    // Talking Veggies form data
    const [formData, setFormData] = useState({
        character_name: 'Sugar',
        topic_type: 'side_effect',
        language: 'Hindi',
        voice_tone: 'male_deep', // Default to a specific voice
        duration: 8,
        visual_style: '3d_cartoon',
        scenario: ''
    });

    // Update voice tone when topic changes
    const handleTopicChange = (e) => {
        const newTopic = e.target.value;
        // Auto-set voice/tone based on topic strictly for defaults, but allow user change
        const newVoice = newTopic === 'side_effect' ? 'male_deep' : 'female_medium';
        setFormData({
            ...formData,
            topic_type: newTopic,
            voice_tone: newVoice
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setScenes([]);
        setCurrentSceneIndex(0);

        try {
            const response = await axios.post('/api/v1/educational/generate-prompt', {
                character_name: formData.character_name,
                voice_tone: formData.voice_tone,
                topic_type: formData.topic_type,
                language: formData.language,
                duration: formData.duration,
                visual_style: formData.visual_style,
                scenario: formData.scenario
            });

            if (response.data.scenes) {
                setScenes(response.data.scenes);
            }
        } catch (error) {
            console.error(error);
            alert("Generation failed. Please check your API key.");
        } finally {
            setLoading(false);
        }
    };

    const formatSceneOutput = (scene) => {
        if (!scene) return '';
        return `Visual Prompt:
${scene.visual_prompt}

Dialogue (${scene.language.toUpperCase()}):
${scene.dialogue}

[SCENE METADATA]
Duration: ${scene.metadata.duration} seconds
Aspect Ratio: ${scene.metadata.aspect_ratio}

[AUDIO STYLE]
Voice: ${scene.audio_style.voice}
Background: ${scene.audio_style.background}

[LIP SYNC DATA]
${scene.lip_sync_data.timing}
Speaker: ${scene.lip_sync_data.speaker}
Voice ID: ${scene.lip_sync_data.voice_id}
Lip Sync Target: ${scene.lip_sync_data.target}
Text: "${scene.lip_sync_data.text}"`;
    };

    const copyToClipboard = () => {
        const textToCopy = formatSceneOutput(scenes[currentSceneIndex]);
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                        <span className="badge">🥦 TALKING VEGGIES</span>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{project.name}</h1>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', marginTop: '32px' }}>
                {/* Configuration Panel */}
                <div className="glass" style={{ padding: '32px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={20} color="var(--primary)" /> Configuration
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label className="label">Character Name</label>
                            <div style={{ position: 'relative' }}>
                                <MessageSquare style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.5 }} size={18} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '45px' }}
                                    placeholder="e.g. Sugar, Salt, Vitamin C"
                                    value={formData.character_name}
                                    onChange={(e) => setFormData({ ...formData, character_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label className="label">Topic Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button
                                    type="button"
                                    className={`mode-btn ${formData.topic_type === 'benefits' ? 'active' : ''}`}
                                    onClick={() => handleTopicChange({ target: { value: 'benefits' } })}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: formData.topic_type === 'benefits' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: formData.topic_type === 'benefits' ? '#10b981' : 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    Health Benefit
                                </button>
                                <button
                                    type="button"
                                    className={`mode-btn ${formData.topic_type === 'side_effect' ? 'active' : ''}`}
                                    onClick={() => handleTopicChange({ target: { value: 'side_effect' } })}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: formData.topic_type === 'side_effect' ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: formData.topic_type === 'side_effect' ? '#ef4444' : 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    Side Effect
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label className="label">Visual Style</label>
                            <select
                                className="input-field"
                                value={formData.visual_style}
                                onChange={(e) => setFormData({ ...formData, visual_style: e.target.value })}
                            >
                                <option value="3d_cartoon">3D Cartoon (Pixar Style)</option>
                                <option value="realistic">Cinematic Realistic (Medical/Macro)</option>
                                <option value="claymation">Aardman / Claymation</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label className="label">Language</label>
                                <select
                                    className="input-field"
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                >
                                    <option>Hindi</option>
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Voice Tone</label>
                                <select
                                    className="input-field"
                                    value={formData.voice_tone}
                                    onChange={(e) => setFormData({ ...formData, voice_tone: e.target.value })}
                                >
                                    <option value="male_deep">Deep Male (Strong)</option>
                                    <option value="male_medium">Medium Male (Casual)</option>
                                    <option value="male_soft">Soft Male (Young/Gentle)</option>
                                    <option value="female_deep">Deep Female (Mature)</option>
                                    <option value="female_medium">Medium Female (Casual)</option>
                                    <option value="female_soft">Soft Female (Young/Sweet)</option>
                                    <option value="child_male">Child Boy</option>
                                    <option value="child_female">Child Girl</option>
                                    <option value="cartoon_squeaky">Cartoon Squeaky (Comic)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label className="label">Duration (Seconds)</label>
                            <select
                                className="input-field"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            >
                                <option value={8}>8 seconds (1 Scene)</option>
                                <option value={16}>16 seconds (2 Scenes)</option>
                                <option value={24}>24 seconds (3 Scenes)</option>
                                <option value={32}>32 seconds (4 Scenes)</option>
                                <option value={40}>40 seconds (5 Scenes)</option>
                                <option value={48}>48 seconds (6 Scenes)</option>
                                <option value={56}>56 seconds (7 Scenes)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label className="label">Scenario (Optional)</label>
                            <textarea
                                className="input-field"
                                style={{ minHeight: '60px', resize: 'vertical' }}
                                placeholder="E.g. He just found out he is going into a salad"
                                value={formData.scenario}
                                onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                            />
                        </div>



                        <button className="btn-primary" style={{ width: '100%', height: '50px' }} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                            {loading ? 'Generating Scenes...' : 'Generate Scenes'}
                        </button>
                    </form>
                </div>

                {/* Output Panel */}
                <div className="glass" style={{ padding: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Sparkles size={20} color="var(--primary)" />
                            {scenes.length > 1 ? `Generated Scenes (${currentSceneIndex + 1}/${scenes.length})` : 'Generated Scene'}
                        </h3>

                        {scenes.length > 1 && (
                            <div className="scene-nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
                                    disabled={currentSceneIndex === 0}
                                    style={{ padding: '8px 12px', opacity: currentSceneIndex === 0 ? 0.5 : 1 }}
                                >
                                    <ArrowLeft size={16} /> Prev
                                </button>
                                <span style={{ padding: '0 8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {currentSceneIndex + 1} / {scenes.length}
                                </span>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setCurrentSceneIndex(Math.min(scenes.length - 1, currentSceneIndex + 1))}
                                    disabled={currentSceneIndex === scenes.length - 1}
                                    style={{ padding: '8px 12px', opacity: currentSceneIndex === scenes.length - 1 ? 0.5 : 1 }}
                                >
                                    Next <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                                </button>
                            </div>
                        )}
                    </div>

                    {scenes.length > 0 && (
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={copyToClipboard} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied Scene!' : 'Copy Scene Prompt'}
                            </button>
                        </div>
                    )}

                    <div style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid var(--border)',
                        color: scenes.length > 0 ? 'var(--text-main)' : 'var(--text-dim)',
                        lineHeight: '1.8',
                        fontSize: '0.95rem',
                        whiteSpace: 'pre-wrap',
                        overflowY: 'auto',
                        maxHeight: '600px'
                    }}>
                        {scenes.length > 0 ? formatSceneOutput(currentScene) : `Configure your Talking Veggie (Character Name, Topic, etc.) and click Generate.
                        
Each scene will be exactly 8 seconds.
Multiple scenes will be generated for longer durations.`}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .label {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--text-dim);
                    margin-bottom: 8px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
};

export default TalkingVeggiesProject;
