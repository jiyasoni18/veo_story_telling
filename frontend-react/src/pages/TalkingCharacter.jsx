import React, { useState } from 'react';
import axios from 'axios';
import {
    Sparkles,
    Copy,
    Check,
    Heart,
    AlertTriangle,
    User,
    Globe,
    Clock,
    Mic,
    Loader2,
    MessageSquare,
    Smile
} from 'lucide-react';

const TalkingCharacter = () => {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [mode, setMode] = useState('educational'); // 'educational' or 'veggies'

    // Educational mode form data
    const [educationalData, setEducationalData] = useState({
        character_name: 'Sugar',
        voice_tone: 'angry',
        topic_type: 'side_effect',
        language: 'Hindi',
        duration: 8
    });

    // Talking Veggies mode form data
    const [veggiesData, setVeggiesData] = useState({
        character_type: 'Funny Tomato',
        topic: 'Space Exploration',
        language: 'English',
        personality: 'Grumpy but lovable'
    });


    const handleEducationalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/api/v1/educational/generate-prompt', educationalData);

            // Check if multi-scene response
            if (response.data.scenes && response.data.scenes.length > 1) {
                // Format multiple scenes
                let formatted = `TOTAL DURATION: ${response.data.total_duration} seconds\n`;
                formatted += `NUMBER OF SCENES: ${response.data.num_scenes}\n`;
                formatted += `\n${'='.repeat(80)}\n\n`;

                response.data.scenes.forEach((scene, index) => {
                    formatted += `SCENE ${scene.scene_number} of ${response.data.num_scenes}\n`;
                    formatted += `${'='.repeat(80)}\n\n`;
                    formatted += `Visual Prompt:\n${scene.visual_prompt}\n\n`;
                    formatted += `Dialogue (${scene.language.toUpperCase()}):\n${scene.dialogue}\n\n`;
                    formatted += `[SCENE METADATA]\n`;
                    formatted += `Duration: ${scene.metadata.duration} seconds\n`;
                    formatted += `Aspect Ratio: ${scene.metadata.aspect_ratio}\n\n`;
                    formatted += `[AUDIO STYLE]\n`;
                    formatted += `Voice: ${scene.audio_style.voice}\n`;
                    formatted += `Background: ${scene.audio_style.background}\n\n`;
                    formatted += `[LIP SYNC DATA]\n`;
                    formatted += `${scene.lip_sync_data.timing}\n`;
                    formatted += `Speaker: ${scene.lip_sync_data.speaker}\n`;
                    formatted += `Voice ID: ${scene.lip_sync_data.voice_id}\n`;
                    formatted += `Lip Sync Target: ${scene.lip_sync_data.target}\n`;
                    formatted += `Text: "${scene.lip_sync_data.text}"\n`;

                    if (index < response.data.scenes.length - 1) {
                        formatted += `\n${'='.repeat(80)}\n\n`;
                    }
                });

                setGeneratedPrompt(formatted);
            } else {
                // Single scene (8 seconds)
                const scene = response.data.scenes[0];
                const formatted = `Visual Prompt:
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

                setGeneratedPrompt(formatted);
            }
        } catch (error) {
            console.error('Generation error:', error);
            alert("Generation failed. Please check your API key and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVeggiesSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/api/v1/ai/generate-talking-character', veggiesData);
            setGeneratedPrompt(response.data.generated_prompt);
        } catch (error) {
            alert("Generation failed. Please check your API key.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="main-content">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Talking Characters</h2>
                <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Generate specialized prompts for educational content and talking objects</p>
            </header>

            {/* Mode Selector */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '16px' }}>
                <button
                    onClick={() => setMode('educational')}
                    style={{
                        flex: 1,
                        padding: '20px',
                        borderRadius: '16px',
                        border: mode === 'educational' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: mode === 'educational' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Heart size={32} color={mode === 'educational' ? 'var(--primary)' : 'var(--text-dim)'} />
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Educational Health</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            Microscopic scenes with health benefits/warnings
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setMode('veggies')}
                    style={{
                        flex: 1,
                        padding: '20px',
                        borderRadius: '16px',
                        border: mode === 'veggies' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: mode === 'veggies' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Smile size={32} color={mode === 'veggies' ? 'var(--primary)' : 'var(--text-dim)'} />
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Talking Veggies</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            Fun characters discussing any topic
                        </div>
                    </div>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                {/* Configuration Panel */}
                <div className="glass" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={20} color="var(--primary)" /> Configuration
                    </h3>

                    {mode === 'educational' ? (
                        // Educational Health Content Form
                        <form onSubmit={handleEducationalSubmit}>
                            {/* Character Name */}
                            <div style={{ marginBottom: '20px' }}>
                                <label className="label">Character Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.5 }} size={18} />
                                    <input
                                        className="input-field"
                                        style={{ paddingLeft: '45px' }}
                                        placeholder="e.g. Sugar, Vitamin C, Protein"
                                        value={educationalData.character_name}
                                        onChange={(e) => setEducationalData({ ...educationalData, character_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                    Examples: Sugar, Salt, Vitamin C, Protein, Fiber
                                </p>
                            </div>

                            {/* Voice Tone */}
                            <div style={{ marginBottom: '20px' }}>
                                <label className="label">Voice Tone</label>
                                <div style={{ position: 'relative' }}>
                                    <Mic style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.5 }} size={18} />
                                    <select
                                        className="input-field"
                                        style={{ paddingLeft: '45px' }}
                                        value={educationalData.voice_tone}
                                        onChange={(e) => setEducationalData({ ...educationalData, voice_tone: e.target.value })}
                                    >
                                        <option value="angry">Angry / Warning</option>
                                        <option value="friendly">Friendly / Cheerful</option>
                                        <option value="educational">Educational / Informative</option>
                                        <option value="serious">Serious / Professional</option>
                                    </select>
                                </div>
                            </div>

                            {/* Topic Type */}
                            <div style={{ marginBottom: '20px' }}>
                                <label className="label">Topic Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEducationalData({ ...educationalData, topic_type: 'health_benefit' })}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: educationalData.topic_type === 'health_benefit' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            background: educationalData.topic_type === 'health_benefit' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(0,0,0,0.3)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Heart size={24} color={educationalData.topic_type === 'health_benefit' ? 'var(--primary)' : 'var(--text-dim)'} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Health Benefit</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEducationalData({ ...educationalData, topic_type: 'side_effect' })}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: educationalData.topic_type === 'side_effect' ? '2px solid #ff4444' : '1px solid var(--border)',
                                            background: educationalData.topic_type === 'side_effect' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0,0,0,0.3)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <AlertTriangle size={24} color={educationalData.topic_type === 'side_effect' ? '#ff4444' : 'var(--text-dim)'} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Side Effect</span>
                                    </button>
                                </div>
                            </div>

                            {/* Language and Duration */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label className="label">Language</label>
                                    <div style={{ position: 'relative' }}>
                                        <Globe style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.5 }} size={18} />
                                        <select
                                            className="input-field"
                                            style={{ paddingLeft: '45px' }}
                                            value={educationalData.language}
                                            onChange={(e) => setEducationalData({ ...educationalData, language: e.target.value })}
                                        >
                                            <option value="Hindi">Hindi (हिंदी)</option>
                                            <option value="English">English</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                            <option value="Arabic">Arabic</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Duration</label>
                                    <div style={{ position: 'relative' }}>
                                        <Clock style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.5 }} size={18} />
                                        <select
                                            className="input-field"
                                            style={{ paddingLeft: '45px' }}
                                            value={educationalData.duration}
                                            onChange={(e) => setEducationalData({ ...educationalData, duration: parseInt(e.target.value) })}
                                        >
                                            <option value={8}>8 seconds</option>
                                            <option value={16}>16 seconds</option>
                                            <option value={24}>24 seconds</option>
                                            <option value={32}>32 seconds</option>
                                            <option value={40}>40 seconds</option>
                                            <option value={48}>48 seconds</option>
                                            <option value={56}>56 seconds</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button className="btn-primary" style={{ width: '100%', height: '50px' }} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                {loading ? 'Generating...' : 'Generate Educational Prompt'}
                            </button>
                        </form>
                    ) : (
                        // Talking Veggies Form
                        <form onSubmit={handleVeggiesSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label className="label">Character Type</label>
                                <div style={{ position: 'relative' }}>
                                    <MessageSquare style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.5 }} size={18} />
                                    <input
                                        className="input-field"
                                        style={{ paddingLeft: '45px' }}
                                        placeholder="e.g. Wise Old Carrot"
                                        value={veggiesData.character_type}
                                        onChange={(e) => setVeggiesData({ ...veggiesData, character_type: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label className="label">Topic of Speech</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.5 }} size={18} />
                                    <input
                                        className="input-field"
                                        style={{ paddingLeft: '45px' }}
                                        placeholder="e.g. Quantum Physics"
                                        value={veggiesData.topic}
                                        onChange={(e) => setVeggiesData({ ...veggiesData, topic: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label className="label">Language</label>
                                    <select
                                        className="input-field"
                                        value={veggiesData.language}
                                        onChange={(e) => setVeggiesData({ ...veggiesData, language: e.target.value })}
                                    >
                                        <option>English</option>
                                        <option>Hindi</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Personality</label>
                                    <select
                                        className="input-field"
                                        value={veggiesData.personality}
                                        onChange={(e) => setVeggiesData({ ...veggiesData, personality: e.target.value })}
                                    >
                                        <option>Sarcastic</option>
                                        <option>Heroic</option>
                                        <option>Nervous</option>
                                        <option>Excited</option>
                                        <option>Grumpy but lovable</option>
                                    </select>
                                </div>
                            </div>

                            <button className="btn-primary" style={{ width: '100%', height: '50px' }} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                {loading ? 'Generating...' : 'Generate Veo Prompt'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Output Panel */}
                <div className="glass" style={{ padding: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Sparkles size={20} color="var(--primary)" /> Generated Prompt
                        </h3>
                        {generatedPrompt && (
                            <button onClick={copyToClipboard} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy Prompt'}
                            </button>
                        )}
                    </div>

                    <div style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid var(--border)',
                        color: generatedPrompt ? 'var(--text-main)' : 'var(--text-dim)',
                        lineHeight: '1.8',
                        fontSize: '0.95rem',
                        whiteSpace: 'pre-wrap',
                        fontFamily: mode === 'educational' ? 'monospace' : 'inherit',
                        overflowY: 'auto',
                        maxHeight: '600px'
                    }}>
                        {generatedPrompt || (mode === 'educational' ?
                            `Your generated educational prompt will appear here.

Configure the settings:
• Character Name (e.g., Sugar, Vitamin C)
• Voice Tone (Angry, Friendly, Educational)
• Topic Type (Health Benefit or Side Effect)
• Language and Duration

Then click "Generate Educational Prompt"` :
                            `Your generated prompt will appear here. Configure the settings and click Generate.`
                        )}
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

export default TalkingCharacter;
