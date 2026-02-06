import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, MessageSquare, MonitorPlay, Calendar, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectType, setNewProjectType] = useState('storytelling');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/v1/projects/');
            setProjects(response.data);
        } catch (error) {
            console.error("Failed to fetch projects");
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/v1/projects/', {
                name: newProjectName,
                project_type: newProjectType
            });
            setShowModal(false);
            setNewProjectName('');
            navigate(`/project/${response.data.id}`);
        } catch (error) {
            alert("Failed to create project");
        }
    };

    const deleteProject = async (e, projectId) => {
        e.stopPropagation(); // Prevent navigating to project
        if (!window.confirm("Are you sure you want to delete this project? All scenes will be lost.")) return;

        try {
            await axios.delete(`/api/v1/projects/${projectId}`);
            setProjects(projects.filter(p => p.id !== projectId));
        } catch (error) {
            alert("Failed to delete project");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'storytelling': return <BookOpen size={24} color="var(--primary)" />;
            case 'talking_character': return <MessageSquare size={24} color="var(--accent)" />;
            default: return <MonitorPlay size={24} color="#f59e0b" />;
        }
    };

    return (
        <div className="main-content">
            <header className="dashboard-header">
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Project Hub</h2>
                    <p style={{ color: 'var(--text-dim)', marginTop: '8px', fontSize: '1.1rem' }}>Manage your VEO AI generations</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '12px 24px' }}>
                    <Plus size={20} />
                    Create New Project
                </button>
            </header>

            {loading ? (
                <div className="skeleton-grid">
                    {[1, 2, 3].map(i => <div key={i} className="glass project-card skeleton" style={{ height: '200px' }}></div>)}
                </div>
            ) : (
                <div className="card-grid">
                    {projects.length === 0 ? (
                        <div className="glass project-card animate-in" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 40px', borderStyle: 'dashed' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🚀</div>
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>No Projects Yet</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                                Start your creative journey by creating your first VEO storytelling project.
                            </p>
                            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '2rem', marginInline: 'auto' }}>
                                <Plus size={20} /> Get Started
                            </button>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div
                                key={project.id}
                                className="glass project-card animate-in"
                                onClick={() => navigate(`/project/${project.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div className="type-badge">
                                        {getIcon(project.project_type)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} />
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                        <button
                                            className="delete-project-btn"
                                            onClick={(e) => deleteProject(e, project.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--text-dim)',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                borderRadius: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem' }}>{project.name}</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>{project.total_scenes} Scenes generated</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass modal-content animate-pop">
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>New VEO Project</h3>
                        <form onSubmit={createProject}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)' }}>Project Name</label>
                            <input
                                className="input-field"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="e.g. The Golden Empire"
                                required
                            />

                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)' }}>Project Type</label>
                            <select
                                className="input-field"
                                value={newProjectType}
                                onChange={(e) => setNewProjectType(e.target.value)}
                            >
                                <option value="storytelling">📖 Story Telling</option>
                                <option value="talking_character">🥦 Talking Veggies</option>
                            </select>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 4rem;
                }
                .type-badge {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 12px;
                    border-radius: 12px;
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    width: 90%;
                    max-width: 500px;
                    padding: 40px;
                    border: 1px solid var(--primary);
                }
                .skeleton-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }
                .animate-in {
                    animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                }
                .animate-pop {
                    animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                .skeleton {
                    background: linear-gradient(90deg, rgba(30,41,59,0.5) 25%, rgba(255,255,255,0.05) 50%, rgba(30,41,59,0.5) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
                @keyframes shimmer {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }
            `}} />
        </div>
    );
};

export default Dashboard;
