import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    BookOpen,
    Heart,
    Search,
    Filter,
    RefreshCw,
    Calendar,
    Mail,

    Palette,
    User as UserIcon,
    ChevronDown
} from 'lucide-react';

const UserPortal = ({ section }) => {
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'a-z', 'z-a'
    const [categoriesList, setCategoriesList] = useState([]);
    const [avatarSeed, setAvatarSeed] = useState('');
    const [avatarStyle, setAvatarStyle] = useState('adventurer'); // Default to more realistic 3D-ish style
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    const AVATAR_STYLES = [
        'adventurer', 'adventurer-neutral', 'avataaars', 'big-smile',
        'bottts', 'fun-emoji', 'lorelei', 'micah', 'miniavs',
        'notionists', 'open-peeps', 'personas'
    ];

    useEffect(() => {
        fetchData();
    }, [section]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [booksRes, favRes, userRes, catsRes] = await Promise.all([
                axios.get('/api/books'),
                axios.get('/api/books/favorites'),
                axios.get('/api/user/profile'),
                axios.get('/api/books/categories')
            ]);

            setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
            setUser(userRes.data);
            setCategoriesList(Array.isArray(catsRes.data) ? catsRes.data : []);
            setAvatarSeed(userRes.data.avatarSeed || userRes.data.username);
            setEditUsername(userRes.data.username || ''); // Init edit state

            const favData = Array.isArray(favRes.data) ? favRes.data : [];
            const favIds = favData.map(f => f._id || f.id);
            setFavorites(favIds);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (bookId) => {
        try {
            const isFav = favorites.includes(bookId);
            if (isFav) {
                setFavorites(favorites.filter(id => id !== bookId));
                await axios.delete(`/api/books/favorites/${bookId}`);
            } else {
                setFavorites([...favorites, bookId]);
                await axios.post(`/api/books/favorites/${bookId}`);
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    const handleUpdateAvatar = async () => {
        setIsUpdatingAvatar(true);
        try {
            const newSeed = Math.random().toString(36).substring(7);
            await axios.put('/api/user/profile/avatar', { avatarSeed: newSeed });
            setAvatarSeed(newSeed);
        } catch (err) {
            console.error('Error updating avatar:', err);
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    const handleNextStyle = () => {
        const currentIndex = AVATAR_STYLES.indexOf(avatarStyle);
        const nextIndex = (currentIndex + 1) % AVATAR_STYLES.length;
        setAvatarStyle(AVATAR_STYLES[nextIndex]);
    };

    const handleUpdateProfile = async () => {
        try {
            await axios.put('/api/user/profile', { username: editUsername, password: editPassword });
            setUser(prev => ({ ...prev, username: editUsername }));
            setIsEditing(false);
            setEditPassword('');
            // Maybe show a success message or toast? For now console.
            console.log('Profile updated');
        } catch (err) {
            console.error('Error updating profile:', err);
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());

        // In 'Books' section, we removed category filter, so only apply if specifically selected in Categories view
        // Actually user said remove category filter from books section filters.
        // So if section === 'books', we ignore selectedCategory unless we want to keep it hidden support?
        // Let's implement refined logic:
        // if section == 'books' -> Show all books (filtered by search), NO category filter dropdown.
        // if section == 'categories' -> Show category list OR selected category books.

        const matchesCategory =
            section === 'categories' ? (selectedCategory === 'All' || book.category_name === selectedCategory) : true;

        const matchesSection = section === 'favorites' ? favorites.includes(book._id || book.id) : true;

        return matchesSearch && matchesCategory && matchesSection;
    }).sort((a, b) => {
        if (sortOption === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortOption === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        if (sortOption === 'a-z') return a.title.localeCompare(b.title);
        if (sortOption === 'z-a') return b.title.localeCompare(a.title);
        return 0;
    });

    const categories = ['All', ...new Set(books.map(b => b.category_name))];

    // Handle click on category card
    // Handle click on category card
    const handleCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
        // We do NOT navigate. We just set state, and render conditionally in the 'Categories' section.
    };

    // Calculate Featured Books
    const getFeaturedBooks = () => {
        if (books.length === 0) return [];

        // 1. Get categories of liked books
        const likedCategories = books
            .filter(b => favorites.includes(b._id || b.id))
            .map(b => b.category_name);

        // 2. Filter books: In liked categories AND not already favorited
        let featured = books.filter(b =>
            likedCategories.includes(b.category_name) &&
            !favorites.includes(b._id || b.id)
        );

        // 3. Fallback: If not enough personalized, fill with new arrivals (not favored)
        if (featured.length < 4) {
            const others = books
                .filter(b => !favorites.includes(b._id || b.id) && !featured.includes(b))
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            featured = [...featured, ...others];
        }

        return featured.slice(0, 4);
    };

    const featuredBooks = getFeaturedBooks();

    if (loading) {
        return (
            <div className="portal-loading">
                <div className="loading-spinner"></div>
                <p>Loading library...</p>
            </div>
        );
    }

    return (
        <div className="minimal-portal">
            {/* Dashboard Section */}
            {section === 'dashboard' && (
                <div className="dashboard-section">
                    <div className="welcome-header">
                        <h1>Welcome back, <span>{user?.username}</span></h1>
                        <p>Your personal library dashboard</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <BookOpen size={28} />
                            </div>
                            <div className="stat-content">
                                <h3>{books.length}</h3>
                                <p>Total Books</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon favorite">
                                <Heart size={28} />
                            </div>
                            <div className="stat-content">
                                <h3>{favorites.length}</h3>
                                <p>Favorites</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon category">
                                <Filter size={28} />
                            </div>
                            <div className="stat-content">
                                <h3>{categories.length - 1}</h3>
                                <p>Categories</p>
                            </div>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="action-buttons">
                            <Link to="/books" className="action-btn primary">
                                <BookOpen size={20} />
                                <span>Browse Books</span>
                            </Link>
                            <Link to="/favorites" className="action-btn">
                                <Heart size={20} />
                                <span>View Favorites</span>
                            </Link>
                        </div>
                    </div>

                    {/* Featured Section */}
                    <div className="featured-section" style={{ marginTop: '40px' }}>
                        <div className="section-header">
                            <h1>{favorites.length > 0 ? 'Featured for You' : 'Trending Now'}</h1>
                            <p>{favorites.length > 0 ? 'Based on your reading preferences' : 'Discover our latest additions'}</p>
                        </div>
                        <div className="books-grid">
                            {featuredBooks.map(book => (
                                <div
                                    key={book._id || book.id}
                                    className="book-card-premium"
                                    onClick={() => window.open(book.bookUrl, '_blank')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="book-card-inner">
                                        <div className="book-cover-premium">
                                            {book.imageUrl ? (
                                                <img src={book.imageUrl} alt={book.title} />
                                            ) : (
                                                <div className="book-placeholder">
                                                    <BookOpen size={48} />
                                                </div>
                                            )}
                                            <div className="book-overlay"></div>
                                            <button
                                                className={`favorite-btn-premium ${favorites.includes(book._id || book.id) ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleFavorite(book._id || book.id);
                                                }}
                                            >
                                                <Heart size={20} fill={favorites.includes(book._id || book.id) ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                        <div className="book-info-premium">
                                            <div className="book-meta">
                                                <span className="book-category-badge">{book.category_name}</span>
                                            </div>
                                            <h3 title={book.title}>{book.title}</h3>
                                            <p className="book-author">{book.author}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Section */}
            {section === 'categories' && selectedCategory === 'All' && (
                <div className="categories-view">
                    <div className="section-header">
                        <h1>Explore Categories</h1>
                        <p>Discover books by your favorite genres</p>
                    </div>
                    <div className="categories-grid">
                        {categoriesList.map(cat => (
                            <div onClick={() => handleCategoryClick(cat.name)} key={cat._id} className="category-card-lg" style={{ cursor: 'pointer' }}>
                                <div className="cat-card-bg"></div>
                                <div className="cat-card-content">
                                    <h3>{cat.name}</h3>
                                    <span className="cat-book-count">{cat.book_count} Books</span>
                                </div>
                                <div className="cat-card-icon">
                                    <BookOpen size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Books Section */}
            {(section === 'books' || section === 'favorites' || (section === 'categories' && selectedCategory !== 'All')) && (
                <div className="books-section">
                    <div className="section-header">
                        <div className="header-title">
                            <h1>{section === 'favorites' ? 'My Favorites' : selectedCategory !== 'All' ? selectedCategory : 'Browse Books'}</h1>
                            <p>{section === 'favorites' ? 'Books you have loved' : 'Explore our collection'}</p>
                        </div>
                        {selectedCategory !== 'All' && section === 'categories' && (
                            <button className="back-btn" onClick={() => setSelectedCategory('All')}>
                                ← Back to Categories
                            </button>
                        )}
                    </div>

                    <div className="filters-bar">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by title or author..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="custom-select-container">
                            <button
                                className={`custom-select-trigger ${isSortDropdownOpen ? 'open' : ''}`}
                                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                onBlur={() => setTimeout(() => setIsSortDropdownOpen(false), 200)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Filter size={16} />
                                    <span>
                                        {sortOption === 'newest' && 'Newest Arrivals'}
                                        {sortOption === 'oldest' && 'Oldest First'}
                                        {sortOption === 'a-z' && 'Title (A-Z)'}
                                        {sortOption === 'z-a' && 'Title (Z-A)'}
                                    </span>
                                </div>
                                <ChevronDown size={16} className={`dropdown-arrow ${isSortDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isSortDropdownOpen && (
                                <div className="custom-options-list">
                                    <div
                                        className={`custom-option ${sortOption === 'newest' ? 'selected' : ''}`}
                                        onClick={() => { setSortOption('newest'); setIsSortDropdownOpen(false); }}
                                    >
                                        Newest Arrivals
                                    </div>
                                    <div
                                        className={`custom-option ${sortOption === 'oldest' ? 'selected' : ''}`}
                                        onClick={() => { setSortOption('oldest'); setIsSortDropdownOpen(false); }}
                                    >
                                        Oldest First
                                    </div>
                                    <div
                                        className={`custom-option ${sortOption === 'a-z' ? 'selected' : ''}`}
                                        onClick={() => { setSortOption('a-z'); setIsSortDropdownOpen(false); }}
                                    >
                                        Title (A-Z)
                                    </div>
                                    <div
                                        className={`custom-option ${sortOption === 'z-a' ? 'selected' : ''}`}
                                        onClick={() => { setSortOption('z-a'); setIsSortDropdownOpen(false); }}
                                    >
                                        Title (Z-A)
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {filteredBooks.length === 0 ? (
                        <div className="empty-state">
                            <Heart size={64} />
                            <h3>{section === 'favorites' ? 'No favorites yet' : 'No books found'}</h3>
                            <p>{section === 'favorites' ? 'Start adding books to your favorites!' : 'Try adjusting your search or filters'}</p>
                        </div>
                    ) : (
                        <div className="books-grid">
                            {filteredBooks.map(book => (
                                <div
                                    key={book._id || book.id}
                                    className="book-card-premium"
                                    onClick={() => window.open(book.bookUrl, '_blank')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="book-card-inner">
                                        <div className="book-cover-premium">
                                            {book.imageUrl ? (
                                                <img src={book.imageUrl} alt={book.title} />
                                            ) : (
                                                <div className="book-placeholder">
                                                    <BookOpen size={48} />
                                                </div>
                                            )}
                                            <div className="book-overlay"></div>
                                            <button
                                                className={`favorite-btn-premium ${favorites.includes(book._id || book.id) ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleFavorite(book._id || book.id);
                                                }}
                                            >
                                                <Heart size={20} fill={favorites.includes(book._id || book.id) ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                        <div className="book-info-premium">
                                            <div className="book-meta">
                                                <span className="book-category-badge">{book.category_name}</span>
                                            </div>
                                            <h3 title={book.title}>{book.title}</h3>
                                            <p className="book-author">{book.author}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Profile Section */}
            {section === 'profile' && user && (
                <div className="profile-section-centered">
                    <div className="profile-glass-card">
                        <div className="profile-content-wrapper">
                            {/* Left Side: Avatar & Basic Info */}
                            <div className="profile-left-col">
                                <div className="avatar-wrapper-lg">
                                    <div className="clay-avatar-container">
                                        <img
                                            src={`https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                            alt="Avatar"
                                            className="profile-avatar-lg clay-effect"
                                        />
                                    </div>
                                    <div className="avatar-controls">
                                        <button
                                            onClick={handleUpdateAvatar}
                                            className="avatar-control-btn refresh"
                                            disabled={isUpdatingAvatar}
                                            title="New Look (Randomize)"
                                        >
                                            <RefreshCw size={18} className={isUpdatingAvatar ? 'spinning' : ''} />
                                        </button>
                                        <button
                                            onClick={handleNextStyle}
                                            className="avatar-control-btn style-switch"
                                            title={`Switch Style (Current: ${avatarStyle})`}
                                        >
                                            <Palette size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h2 className="profile-username">{user.username}</h2>
                                <p className="profile-email">{user.email}</p>
                                <div className="profile-stats-row">
                                    <div className="p-stat">
                                        <span className="p-stat-val">{books.length}</span>
                                        <span className="p-stat-label">Books</span>
                                    </div>
                                    <div className="p-stat">
                                        <span className="p-stat-val">{favorites.length}</span>
                                        <span className="p-stat-label">Favorites</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Details or Edit Form */}
                            <div className="profile-right-col">
                                {!isEditing ? (
                                    <div className="profile-view-mode">
                                        <div className="profile-info-group">
                                            <h3>Account Details</h3>
                                            <div className="info-item">
                                                <UserIcon size={20} />
                                                <div>
                                                    <label>Username</label>
                                                    <p>{user.username}</p>
                                                </div>
                                            </div>
                                            <div className="info-item">
                                                <Mail size={20} />
                                                <div>
                                                    <label>Email Address</label>
                                                    <p>{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="info-item">
                                                <Calendar size={20} />
                                                <div>
                                                    <label>Member Since</label>
                                                    <p>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                            Update Profile
                                        </button>
                                    </div>
                                ) : (
                                    <div className="profile-edit-mode">
                                        <h3>Edit Profile</h3>
                                        <div className="edit-form">
                                            <div className="form-group">
                                                <label>Username</label>
                                                <input
                                                    type="text"
                                                    value={editUsername}
                                                    onChange={(e) => setEditUsername(e.target.value)}
                                                    className="profile-input"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>New Password (Optional)</label>
                                                <input
                                                    type="password"
                                                    placeholder="Leave blank to keep current"
                                                    value={editPassword}
                                                    onChange={(e) => setEditPassword(e.target.value)}
                                                    className="profile-input"
                                                />
                                            </div>
                                            <div className="form-actions">
                                                <button className="save-btn" onClick={handleUpdateProfile}>
                                                    Save Changes
                                                </button>
                                                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .minimal-portal {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                /* Loading */
                .portal-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    gap: 20px;
                }

                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(99, 102, 241, 0.2);
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .portal-loading p {
                    color: #94a3b8;
                    font-size: 1rem;
                }

                /* Dashboard */
                .dashboard-section {
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                }

                .welcome-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #f1f5f9;
                    margin-bottom: 8px;
                }

                .welcome-header h1 span {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .welcome-header p {
                    color: #64748b;
                    font-size: 1.1rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 24px;
                }

                .stat-card {
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
                    backdrop-filter: blur(30px);
                    -webkit-backdrop-filter: blur(30px);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 24px;
                    padding: 32px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }

                .stat-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
                    opacity: 0;
                    transition: opacity 0.4s;
                }

                .stat-card:hover::before {
                    opacity: 1;
                }

                .stat-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    border-color: rgba(99, 102, 241, 0.4);
                    box-shadow: 0 30px 60px rgba(99, 102, 241, 0.25),
                                0 0 0 1px rgba(99, 102, 241, 0.2) inset;
                }

                .stat-icon {
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4),
                                0 0 0 1px rgba(255, 255, 255, 0.2) inset;
                    position: relative;
                    animation: pulse 3s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset; }
                    50% { box-shadow: 0 12px 24px rgba(99, 102, 241, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3) inset; }
                }

                .stat-icon.favorite {
                    background: linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #ef4444 100%);
                    box-shadow: 0 12px 24px rgba(236, 72, 153, 0.4),
                                0 0 0 1px rgba(255, 255, 255, 0.2) inset;
                }

                .stat-icon.category {
                    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
                    box-shadow: 0 12px 24px rgba(139, 92, 246, 0.4),
                                0 0 0 1px rgba(255, 255, 255, 0.2) inset;
                }

                .stat-content h3 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #f1f5f9;
                    margin-bottom: 4px;
                }

                .stat-content p {
                    color: #94a3b8;
                    font-size: 0.9rem;
                }

                .quick-actions h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #f1f5f9;
                    margin-bottom: 20px;
                }

                .action-buttons {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 32px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 14px;
                    color: #cbd5e1;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                }

                .action-btn.primary {
                    background: linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%);
                    border-color: transparent;
                    color: white;
                    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
                }

                .action-btn:hover {
                    transform: translateY(-4px) scale(1.05);
                    box-shadow: 0 16px 32px rgba(99, 102, 241, 0.4);
                }

                .action-btn.primary:hover {
                    box-shadow: 0 16px 32px rgba(99, 102, 241, 0.6);
                }

                /* Books Section */
                .books-section {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .section-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #f1f5f9;
                    margin-bottom: 8px;
                }

                .section-header p {
                    color: #64748b;
                }

                .filters-bar {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .search-box {
                    flex: 1;
                    min-width: 300px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 99px;
                    padding: 12px 24px;
                    color: #94a3b8;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                                0 2px 4px -1px rgba(0, 0, 0, 0.06),
                                inset 0 1px 1px rgba(255, 255, 255, 0.05);
                }

                .search-box:focus-within {
                    border-color: rgba(99, 102, 241, 0.5);
                    background: rgba(15, 23, 42, 0.8);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15),
                                inset 0 1px 1px rgba(255, 255, 255, 0.1);
                }

                .search-box input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #f1f5f9;
                    font-size: 0.95rem;
                }

                .search-box input::placeholder {
                    color: #64748b;
                }

                .custom-select-container {
                    position: relative;
                    min-width: 200px;
                }

                .custom-select-trigger {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 99px;
                    padding: 12px 20px;
                    color: #f1f5f9;
                    font-weight: 500;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                                inset 0 1px 1px rgba(255, 255, 255, 0.05);
                }

                .custom-select-trigger:hover {
                    background: rgba(30, 41, 59, 0.8);
                    border-color: rgba(99, 102, 241, 0.4);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 12px -1px rgba(0, 0, 0, 0.2),
                                inset 0 1px 1px rgba(255, 255, 255, 0.1);
                }

                .custom-select-trigger.open {
                    background: rgba(30, 41, 59, 0.9);
                    border-color: rgba(99, 102, 241, 0.6);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
                }

                .dropdown-arrow {
                    transition: transform 0.3s ease;
                    color: #94a3b8;
                }

                .dropdown-arrow.rotated {
                    transform: rotate(180deg);
                    color: #6366f1;
                }

                .custom-options-list {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 6px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3),
                                0 10px 10px -5px rgba(0, 0, 0, 0.2),
                                inset 0 0 0 1px rgba(255, 255, 255, 0.05);
                    z-index: 50;
                    animation: slideDown 0.2s ease-out;
                    overflow: hidden;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .custom-option {
                    padding: 10px 16px;
                    border-radius: 12px;
                    color: #cbd5e1;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                }

                .custom-option:hover {
                    background: rgba(99, 102, 241, 0.15);
                    color: #f1f5f9;
                }

                .custom-option.selected {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
                    color: #818cf8;
                    font-weight: 600;
                }

                .books-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 24px;
                }

                /* Categories View */
                .categories-view {
                    padding-bottom: 40px;
                }
                
                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 30px;
                    margin-top: 30px;
                }
                
                .category-card-lg {
                    position: relative;
                    height: 180px;
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    text-decoration: none;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .cat-card-bg {
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
                    opacity: 0;
                    transition: opacity 0.4s;
                }
                
                .category-card-lg:hover {
                    transform: translateY(-8px);
                    border-color: rgba(99, 102, 241, 0.4);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2) inset;
                }
                
                .category-card-lg:hover .cat-card-bg {
                    opacity: 1;
                }
                
                .cat-card-content h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #f8fafc;
                    margin-bottom: 6px;
                    z-index: 2;
                }
                
                .cat-book-count {
                    color: #94a3b8;
                    font-weight: 600;
                    font-size: 0.95rem;
                    z-index: 2;
                }
                
                .cat-card-icon {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    width: 50px;
                    height: 50px;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6366f1;
                    transition: all 0.4s;
                }
                
                .category-card-lg:hover .cat-card-icon {
                    background: #6366f1;
                    color: white;
                    transform: rotate(10deg) scale(1.1);
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                }

                .back-btn {
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                /* Premium Book Card Redesign */
                .book-card-premium {
                    position: relative;
                    border-radius: 20px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .book-card-premium:hover {
                    transform: translateY(-12px);
                    z-index: 10;
                }

                .book-card-inner {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08); /* Minimal border */
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
                    transition: all 0.4s;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .book-card-premium:hover .book-card-inner {
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 
                                0 0 0 1px rgba(99, 102, 241, 0.15) inset;
                    background: rgba(30, 41, 59, 0.6);
                }

                .book-cover-premium {
                    position: relative;
                    width: 100%;
                    padding-top: 145%; /* Cinematic aspect ratio */
                    overflow: hidden;
                }

                .book-cover-premium img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .book-card-premium:hover .book-cover-premium img {
                    transform: scale(1.08);
                }

                .book-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 50%);
                    opacity: 0.6;
                    transition: opacity 0.3s;
                }

                .book-card-premium:hover .book-overlay {
                    opacity: 0.4;
                }

                .favorite-btn-premium {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    cursor: pointer;
                    transform: translateY(-10px);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .book-card-premium:hover .favorite-btn-premium {
                    transform: translateY(0);
                    opacity: 1;
                }

                .favorite-btn-premium:hover {
                    background: white;
                    color: #ec4899;
                    transform: scale(1.1) rotate(5deg);
                }

                .favorite-btn-premium.active {
                    background: rgba(236, 72, 153, 0.9);
                    border-color: #ec4899;
                    color: white;
                    opacity: 1;
                    transform: translateY(0);
                }

                .book-info-premium {
                    padding: 20px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .book-meta {
                    margin-bottom: 8px;
                }

                .book-category-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #818cf8;
                    display: inline-block;
                }

                .book-info-premium h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    line-height: 1.4;
                    color: #fff;
                    margin: 0 0 6px 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    flex-grow: 1; /* Push author down */
                }

                .book-info-premium .book-author {
                    font-size: 0.9rem;
                    color: #94a3b8;
                    margin: 0;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    gap: 16px;
                    color: #64748b;
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    color: #94a3b8;
                }

                /* Profile Section Centered */
                .profile-section-centered {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 60vh;
                    padding: 20px;
                }

                .profile-glass-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08); /* Premium border */
                    border-radius: 30px;
                    padding: 50px;
                    width: 100%;
                    max-width: 900px;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 
                                0 0 0 1px rgba(255, 255, 255, 0.05) inset;
                }

                .profile-content-wrapper {
                    display: flex;
                    gap: 60px;
                    align-items: flex-start;
                }

                /* Left Column */
                .profile-left-col {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    width: 280px;
                    flex-shrink: 0;
                }

                .avatar-wrapper-lg {
                    position: relative;
                    margin-bottom: 20px;
                }

                .profile-avatar-lg {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    border: 4px solid rgba(99, 102, 241, 0.3);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .refresh-avatar-btn {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    background: #6366f1;
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                    transition: all 0.3s;
                }

                .refresh-avatar-btn:hover:not(:disabled) {
                    transform: scale(1.1) rotate(15deg);
                    background: #8b5cf6;
                }

                .profile-username {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #f1f5f9;
                    margin-bottom: 4px;
                }

                .profile-email {
                    color: #94a3b8;
                    margin-bottom: 24px;
                    font-size: 0.95rem;
                }

                .profile-stats-row {
                    display: flex;
                    gap: 20px;
                    width: 100%;
                    justify-content: center;
                }

                .p-stat {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 12px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100px;
                }

                .p-stat-val {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #818cf8;
                }

                .p-stat-label {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Right Column */
                .profile-right-col {
                    flex: 1;
                    padding-top: 10px;
                }

                .profile-view-mode h3, 
                .profile-edit-mode h3 {
                    font-size: 1.3rem;
                    color: #f1f5f9;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .profile-info-group {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    margin-bottom: 30px;
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                }

                .info-item svg {
                    color: #6366f1;
                    margin-top: 3px;
                }

                .info-item label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .info-item p {
                    font-size: 1.1rem;
                    color: #e2e8f0;
                    font-weight: 500;
                }

                .edit-profile-btn {
                    background: rgba(255, 255, 255, 0.05);
                    color: #cbd5e1;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .edit-profile-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.2);
                }

                /* Edit Form */
                .edit-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 0.9rem;
                    color: #94a3b8;
                    font-weight: 600;
                }

                .profile-input {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px;
                    color: white;
                    font-size: 1rem;
                    font-family: inherit;
                    transition: all 0.3s;
                }

                .profile-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    background: rgba(0, 0, 0, 0.3);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 10px;
                }

                .save-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .save-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .cancel-btn {
                    background: transparent;
                    color: #94a3b8;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .cancel-btn:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.05);
                }

                .spinning {
                    animation: spin 1s linear infinite;
                }

                @media (max-width: 900px) {
                    .profile-content-wrapper {
                        flex-direction: column;
                        align-items: center;
                    }

                    .profile-left-col {
                        width: 100%;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                        padding-bottom: 30px;
                    }

                    .profile-right-col {
                        width: 100%;
                    }
                }

                @media (max-width: 768px) {
                    .welcome-header h1 {
                        font-size: 2rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .books-grid {
                        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    }

                    .profile-glass-card {
                        padding: 30px 20px;
                    }
                    
                    .filters-bar {
                        flex-direction: column;
                    }

                    .search-box {
                        min-width: 100%;
                    }
                }
                .avatar-wrapper-lg {
                    position: relative;
                    margin-bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }

                /* Clay Avatar Effect */
                .clay-avatar-container {
                    position: relative;
                    border-radius: 50%;
                    padding: 8px;
                    background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                    box-shadow: 
                        20px 20px 60px rgba(0,0,0,0.5), 
                        -20px -20px 60px rgba(255,255,255,0.05);
                }

                .profile-avatar-lg {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                /* This creates the realistic "Clay" look via inner shadows and lighting */
                .clay-effect {
                    box-shadow: 
                        inset 10px 10px 20px rgba(255, 255, 255, 0.2), 
                        inset -10px -10px 20px rgba(0, 0, 0, 0.4),
                        0 15px 35px rgba(0,0,0,0.4);
                    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3));
                    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent);
                }

                /* Controls Container */
                .avatar-controls {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    background: rgba(0,0,0,0.3);
                    padding: 6px;
                    border-radius: 50px;
                    border: 1px solid rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                }

                .avatar-control-btn {
                    background: transparent;
                    color: #94a3b8;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .avatar-control-btn:hover:not(:disabled) {
                    background: rgba(99, 102, 241, 0.2);
                    color: #818cf8;
                    transform: scale(1.1);
                }

                .avatar-control-btn.refresh:hover {
                    transform: rotate(180deg);
                }

                .avatar-control-btn.style-switch:hover {
                    transform: scale(1.1) rotate(-10deg);
                }
            `}</style>
        </div>
    );
};

export default UserPortal;
