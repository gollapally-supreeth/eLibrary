import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    BookOpen,
    Heart,
    User as UserIcon,
    LogOut,
    Library,
    Menu,
    X,
    Layers
} from 'lucide-react';

const Layout = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Always use dark theme
        document.body.className = 'dark-theme';

        // Fetch user and categories
        Promise.all([
            axios.get('/api/user/profile'),
            axios.get('/api/books/categories')
        ]).then(([userRes, catRes]) => {
            setUser(userRes.data);
            setCategories(catRes.data);
        }).catch(() => { });
    }, []);

    const handleLogout = async () => {
        await axios.post('/api/auth/logout');
        navigate('/login');
    };

    return (
        <div className="minimal-portal-layout">
            {/* Background */}
            <div className="portal-bg">
                <div className="bg-orb orb-1"></div>
                <div className="bg-orb orb-2"></div>
            </div>

            {/* Compact Sidebar */}
            <aside className={`minimal-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className={`sidebar-header ${!isOpen ? 'closed' : ''}`}>
                    {isOpen && (
                        <div className="logo-section">
                            <div className="logo-icon">
                                <Library size={24} />
                            </div>
                            <span className="logo-text">eLibrary</span>
                        </div>
                    )}
                    <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Home size={22} />
                        {isOpen && <span>Dashboard</span>}
                    </NavLink>
                    <NavLink to="/books" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <BookOpen size={22} />
                        {isOpen && <span>Books</span>}
                    </NavLink>
                    <NavLink to="/favorites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Heart size={22} />
                        {isOpen && <span>Favorites</span>}
                    </NavLink>
                    <NavLink to="/categories" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Layers size={22} />
                        {isOpen && <span>Categories</span>}
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <UserIcon size={22} />
                        {isOpen && <span>Profile</span>}
                    </NavLink>
                </nav>



                <div className="sidebar-footer">
                    {isOpen && user && (
                        <div className="user-info">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed || 'user'}`}
                                alt="Avatar"
                                className="user-avatar"
                            />
                            <div className="user-details">
                                <span className="user-name">{user.username}</span>
                                <span className="user-email">{user.email}</span>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        {isOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="portal-main">
                {children}
            </main>

            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }

                .dark-theme {
                    background: #050816;
                    color: #f1f5f9;
                }

                .minimal-portal-layout {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #050816 0%, #0f0a2e 50%, #1a0f3d 100%);
                    position: relative;
                    overflow: hidden;
                }

                /* Background Orbs */
                .portal-bg {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 0;
                }

                .bg-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.15;
                    animation: float 20s ease-in-out infinite;
                }

                .orb-1 {
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, #6366f1 0%, #4f46e5 30%, transparent 70%);
                    top: -10%;
                    right: -10%;
                }

                .orb-2 {
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, #8b5cf6 0%, #7c3aed 30%, transparent 70%);
                    bottom: -10%;
                    left: -10%;
                    animation-delay: -10s;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }

                /* Sidebar */
                .minimal-sidebar {
                    position: fixed;
                    left: 20px;
                    top: 20px;
                    height: calc(100vh - 40px);
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
                    backdrop-filter: blur(30px);
                    -webkit-backdrop-filter: blur(30px);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 28px;
                    display: flex;
                    flex-direction: column;
                    padding: 30px 20px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 100;
                    width: 280px;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4),
                                0 0 0 1px rgba(99, 102, 241, 0.1) inset,
                                0 0 80px rgba(99, 102, 241, 0.15);
                    animation: floatSidebar 6s ease-in-out infinite;
                    overflow-y: auto;
                    overflow-x: hidden;
                }

                .minimal-sidebar::-webkit-scrollbar {
                    width: 6px;
                }

                .minimal-sidebar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }

                .minimal-sidebar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.3);
                    border-radius: 10px;
                }

                .minimal-sidebar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.5);
                }

                @keyframes floatSidebar {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }

                .minimal-sidebar.closed {
                    width: 80px;
                    padding: 30px 12px;
                }

                .minimal-sidebar.closed .nav-item svg {
                    transform: scale(1.2);
                }
                
                .minimal-sidebar.closed .logout-btn svg {
                    transform: scale(1.2);
                }

                .sidebar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .logo-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.5),
                                0 0 0 1px rgba(255, 255, 255, 0.2) inset;
                    position: relative;
                    overflow: hidden;
                }

                .logo-icon::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    animation: shimmer 3s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                }

                .logo-text {
                    font-size: 1.4rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    white-space: nowrap;
                    letter-spacing: -0.5px;
                }

                .toggle-btn {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 12px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #818cf8;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                }

                .toggle-btn:hover {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%);
                    color: #a5b4fc;
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
                }

                .minimal-sidebar.closed .logo-text {
                    display: none;
                }
                
                .sidebar-header.closed {
                    justify-content: center;
                    padding-bottom: 0;
                    border-bottom: none;
                }

                /* Navigation */
                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 20px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px 18px;
                    border-radius: 16px;
                    text-decoration: none;
                    color: #94a3b8;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .nav-item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 4px;
                    height: 100%;
                    background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
                    transform: scaleY(0);
                    transition: transform 0.3s;
                    border-radius: 0 4px 4px 0;
                }

                .nav-item::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                    opacity: 0;
                    transition: opacity 0.3s;
                    border-radius: 16px;
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #cbd5e1;
                    transform: translateX(4px);
                }

                .nav-item:hover::after {
                    opacity: 1;
                }

                .nav-item.active {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
                    color: #a5b4fc;
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
                }

                .nav-item.active::before {
                    transform: scaleY(1);
                }

                .minimal-sidebar.closed .nav-item {
                    justify-content: center;
                    padding: 14px;
                }

                .minimal-sidebar.closed .nav-item span {
                    display: none;
                }

                /* Categories Section */
                .categories-section {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 16px;
                    padding: 16px;
                    margin-bottom: 20px;
                }

                .categories-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #a5b4fc;
                    font-weight: 700;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 14px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(99, 102, 241, 0.15);
                }

                .categories-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .categories-list::-webkit-scrollbar {
                    width: 4px;
                }

                .categories-list::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }

                .categories-list::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.3);
                    border-radius: 10px;
                }

                .category-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    transition: all 0.3s;
                    cursor: pointer;
                }

                .category-item:hover {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateX(4px);
                }

                .category-name {
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    font-weight: 600;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .category-count {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 8px;
                    min-width: 32px;
                    text-align: center;
                    box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
                }

                /* Footer */
                .sidebar-footer {
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    padding-top: 20px;
                    margin-top: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.03) 100%);
                    border-radius: 16px;
                    padding: 20px 10px 10px 10px;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 14px;
                    margin-bottom: 8px;
                    transition: all 0.3s;
                }

                .user-info:hover {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(99, 102, 241, 0.2);
                }

                .user-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    border: 2px solid rgba(99, 102, 241, 0.4);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .user-details {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .user-name {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #f1f5f9;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .user-email {
                    font-size: 0.75rem;
                    color: #64748b;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 18px;
                    background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
                    border: 1px solid rgba(244, 63, 94, 0.3);
                    border-radius: 12px;
                    color: #fca5a5;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(244, 63, 94, 0.15);
                }

                .logout-btn:hover {
                    background: linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(239, 68, 68, 0.2) 100%);
                    border-color: rgba(244, 63, 94, 0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(244, 63, 94, 0.25);
                    color: #fecaca;
                }

                .minimal-sidebar.closed .logout-btn {
                    justify-content: center;
                    padding: 12px;
                }

                .minimal-sidebar.closed .logout-btn span {
                    display: none;
                }

                /* Main Content */
                .portal-main {
                    flex: 1;
                    margin-left: 320px;
                    padding: 40px 50px;
                    position: relative;
                    z-index: 1;
                    transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .minimal-sidebar.closed ~ .portal-main {
                    margin-left: 120px;
                }

                @media (max-width: 768px) {
                    .minimal-sidebar {
                        width: 80px;
                    }
                    
                    .minimal-sidebar .logo-text,
                    .minimal-sidebar .toggle-btn,
                    .minimal-sidebar .nav-item span,
                    .minimal-sidebar .categories-section,
                    .minimal-sidebar .user-info,
                    .minimal-sidebar .logout-btn span {
                        display: none;
                    }

                    .minimal-sidebar .nav-item,
                    .minimal-sidebar .logout-btn {
                        justify-content: center;
                        padding: 14px;
                    }

                    .portal-main {
                        margin-left: 80px;
                        padding: 30px 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Layout;
