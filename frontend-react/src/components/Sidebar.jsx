import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, User, LogOut, PlusCircle, MessageSquare, Menu, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setOpen }) => {
    const { logout } = useAuth();

    return (
        <aside className={`sidebar glass ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                {isOpen && <h1 className="logo-text">VEO ULTIMATE</h1>}
                <button className="toggle-btn" onClick={() => setOpen(!isOpen)}>
                    {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <nav style={{ flex: 1, marginTop: '20px' }}>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    {isOpen && <span>Dashboard</span>}
                </NavLink>
            </nav>

            <button onClick={logout} className="nav-link logout-btn">
                <LogOut size={20} />
                {isOpen && <span>Logout</span>}
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
                .sidebar {
                    width: 260px;
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    top: 0;
                    padding: 24px 16px;
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 1000;
                    border-radius: 0 24px 24px 0 !important;
                }
                .sidebar.collapsed {
                    width: 80px;
                }
                .sidebar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    min-height: 40px;
                }
                .logo-text {
                    font-size: 1.2rem;
                    color: var(--accent);
                    margin: 0;
                    white-space: nowrap;
                    font-weight: 900;
                }
                .toggle-btn {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .toggle-btn:hover { background: var(--primary); }
                
                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    color: var(--text-dim);
                    text-decoration: none;
                    transition: all 0.2s;
                    margin-bottom: 8px;
                    white-space: nowrap;
                }
                .nav-link:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .nav-link.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
                }
                .logout-btn {
                    border: none;
                    background: none;
                    cursor: pointer;
                    width: 100%;
                    margin-top: auto;
                }
            `}} />
        </aside>
    );
};

export default Sidebar;
