import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TalkingCharacter from './pages/TalkingCharacter';
import Dashboard from './pages/Dashboard';
import StoryProject from './pages/StoryProject';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    if (loading) return null;
    if (!user) return <Navigate to="/login" />;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />
            <div style={{
                flex: 1,
                marginLeft: isSidebarOpen ? '260px' : '80px',
                transition: 'margin-left 0.3s ease',
                padding: '40px',
                width: '100%'
            }}>
                {children}
            </div>
        </div>
    );
};

function App() {
    return (
        <div className="app-container">
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route
                    path="/talking-character"
                    element={
                        <ProtectedRoute>
                            <TalkingCharacter />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/project/:id"
                    element={
                        <ProtectedRoute>
                            <StoryProject />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>

            <style dangerouslySetInnerHTML={{
                __html: `
        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(138, 43, 226, 0.1);
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
      `}} />
        </div>
    );
}

export default App;
