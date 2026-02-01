import React from 'react';

const TopHeader = ({ userAvatar, onSearchChange, toggleMobileSidebar }) => {
    return (
        <header className="top-header">
            <button
                className="sidebar-toggle-mobile"
                onClick={toggleMobileSidebar}
                aria-label="Toggle Sidebar"
            >
                <i className="fas fa-bars"></i>
            </button>
            <div className="search-bar">
                <input
                    type="text"
                    id="searchInput"
                    placeholder="Search books, authors..."
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <i className="fas fa-search search-icon"></i>
            </div>
            <div className="user-actions">
                <div className="user-avatar" id="userAvatar">
                    <img
                        src={userAvatar || `https://api.dicebear.com/6.x/initials/svg?seed=User`}
                        alt="User"
                    />
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
