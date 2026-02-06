import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(email, password, name);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create account');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div className="glass project-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--accent)' }}>Create Account</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '32px' }}>Join the future of AI video generation</p>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <User style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-dim)' }} size={20} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '44px' }}
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <Mail style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-dim)' }} size={20} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '44px' }}
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                        <Lock style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-dim)' }} size={20} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '44px' }}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <UserPlus size={20} />
                        Create Account
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-dim)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
