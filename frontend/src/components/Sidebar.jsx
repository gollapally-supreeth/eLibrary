import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Sidebar = ({ isCollapsed, toggleSidebar, theme, toggleTheme }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
            navigate('/login');
        } catch (err) {
            console.error('Logout failed', err);
            navigate('/login');
        }
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <i className="fas fa-book-reader brand-icon"></i>
                <h1 className="brand-name">eLibrary</h1>
                <button
                    className="sidebar-collapse-btn"
                    id="desktopSidebarCollapseBtn"
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="fas fa-home"></i>
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/books" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="fas fa-book"></i>
                            <span>All Books</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="fas fa-list-alt"></i>
                            <span>Categories</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/favorites" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="fas fa-heart"></i>
                            <span>Favorites</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <i className="fas fa-user"></i>
                            <span>Profile</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>
                <button
                    className="nav-link logout-btn-sidebar"
                    onClick={handleLogout}
                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', padding: '12px 25px', gap: '15px' }}
                >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
