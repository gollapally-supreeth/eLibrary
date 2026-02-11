import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Tags,
    LogOut,
    Plus,
    Trash2,
    Edit3,
    Shield,
    X,
    Search,
    ChevronDown,
    Save,
    Menu
} from 'lucide-react';
import gsap from 'gsap';

const AdminDashboard = ({ section }) => {
    const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, totalCategories: 0 });
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Modal States
    const [showUserModal, setShowUserModal] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const [editingBook, setEditingBook] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    // Form Data
    const [userForm, setUserForm] = useState({ username: '', email: '', password: '', isAdmin: false });
    const [bookForm, setBookForm] = useState({ title: '', author: '', bookUrl: '', imageUrl: '', categoryId: '' });
    const [categoryForm, setCategoryForm] = useState({ name: '' });

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [section]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            const minLoadTime = new Promise(resolve => setTimeout(resolve, 800)); // Enforce min 800ms load
            try {
                const [statsRes, usersRes, booksRes, catsRes] = await Promise.all([
                    api.get('/api/admin/stats').catch(err => {
                        console.error("Stats fetch failed", err);
                        return { data: { totalUsers: 0, totalBooks: 0, totalCategories: 0 } };
                    }),
                    api.get('/api/admin/users').catch(() => ({ data: [] })),
                    api.get('/api/books').catch(() => ({ data: [] })),
                    api.get('/api/books/categories').catch(() => ({ data: [] })),
                    minLoadTime
                ]);
                if (isMounted) {
                    setStats(statsRes.data);
                    setUsers(usersRes.data);
                    setBooks(booksRes.data);
                    setCategories(catsRes.data);
                }
            } catch (err) {
                console.error('Error fetching admin data', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [section]);

    useEffect(() => {
        let ctx;
        if (!loading) {
            ctx = gsap.context(() => {
                gsap.fromTo('.admin-reveal',
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
                );
            });
        }
        return () => ctx && ctx.revert();
    }, [loading, section]);

    const handleLogout = async () => {
        await api.post('/api/auth/logout');
        navigate('/login');
    };

    // --- User Operations ---
    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/api/admin/users/${userId}`);
            setUsers(users.filter(u => (u._id || u.id) !== userId));
            setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
        } catch (err) {
            console.error('Failed to delete user', err);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/admin/users', userForm);
            setUsers([...users, res.data]);
            setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
            setShowUserModal(false);
            setUserForm({ username: '', email: '', password: '', isAdmin: false });
        } catch (err) {
            console.error('Failed to create user', err);
            alert('Failed to create user. Email already exists?');
        }
    };

    // --- Book Operations ---
    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Delete this book?')) return;
        try {
            await api.delete(`/api/admin/books/${bookId}`);
            setBooks(books.filter(b => (b._id || b.id) !== bookId));
            setStats(prev => ({ ...prev, totalBooks: prev.totalBooks - 1 }));
        } catch (err) {
            console.error('Failed to delete book', err);
        }
    };

    const openEditBook = (book) => {
        setEditingBook(book);
        setBookForm({
            title: book.title,
            author: book.author,
            bookUrl: book.bookUrl,
            imageUrl: book.imageUrl,
            categoryId: book.categoryId || ''
        });
        setShowBookModal(true);
    };

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBook) {
                const res = await api.put(`/api/admin/books/${editingBook._id || editingBook.id}`, bookForm);
                setBooks(books.map(b => (b._id || b.id) === (editingBook._id || editingBook.id) ? res.data : b));
            } else {
                const res = await api.post('/api/admin/books', bookForm);
                setBooks([...books, res.data]);
                setStats(prev => ({ ...prev, totalBooks: prev.totalBooks + 1 }));
            }
            setShowBookModal(false);
            setEditingBook(null);
            setBookForm({ title: '', author: '', bookUrl: '', imageUrl: '', categoryId: '' });
        } catch (err) {
            console.error('Failed to save book', err);
            alert('Failed to save book');
        }
    };

    // --- Category Operations ---
    const handleDeleteCategory = async (catId) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/api/admin/categories/${catId}`);
            setCategories(categories.filter(c => (c._id || c.id) !== catId));
            setStats(prev => ({ ...prev, totalCategories: prev.totalCategories - 1 }));
        } catch (err) {
            console.error('Failed to delete category', err);
        }
    };

    const openEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryForm({ name: category.name });
        setShowCategoryModal(true);
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                const res = await api.put(`/api/admin/categories/${editingCategory._id || editingCategory.id}`, categoryForm);
                setCategories(categories.map(c => (c._id || c.id) === (editingCategory._id || editingCategory.id) ? res.data : c));
            } else {
                const res = await api.post('/api/admin/categories', categoryForm);
                setCategories([...categories, res.data]);
                setStats(prev => ({ ...prev, totalCategories: prev.totalCategories + 1 }));
            }
            setShowCategoryModal(false);
            setEditingCategory(null);
            setCategoryForm({ name: '' });
        } catch (err) {
            console.error('Failed to save category', err);
        }
    };

    return (
        <div className="admin-layout-modern">
            {/* Top Navigation Bar */}
            <nav className={`admin-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="brand-section">
                        <div className="brand-logo">
                            <Shield size={22} className="shield-icon" />
                        </div>
                        <span className="brand-name">Admin<span>Panel</span></span>
                    </div>

                    <div className="nav-links desktop-only">
                        <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                            <LayoutDashboard size={18} /> <span>Overview</span>
                        </NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Users size={18} /> <span>Users</span>
                        </NavLink>
                        <NavLink to="/admin/books" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <BookOpen size={18} /> <span>Books</span>
                        </NavLink>
                        <NavLink to="/admin/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Tags size={18} /> <span>Categories</span>
                        </NavLink>
                    </div>

                    <div className="nav-actions">
                        <div className="admin-profile">
                            <div className="admin-avatar">A</div>
                            <span className="admin-label">Admin</span>
                        </div>
                        <button onClick={handleLogout} className="logout-button">
                            <LogOut size={18} />
                        </button>
                        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <NavLink to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)} end>
                            <LayoutDashboard size={20} /> <span>Overview</span>
                        </NavLink>
                        <NavLink to="/admin/users" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                            <Users size={20} /> <span>Users</span>
                        </NavLink>
                        <NavLink to="/admin/books" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                            <BookOpen size={20} /> <span>Books</span>
                        </NavLink>
                        <NavLink to="/admin/categories" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                            <Tags size={20} /> <span>Categories</span>
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="admin-main">
                <div className="content-container">
                    {loading ? (
                        <div className="skeleton-loader">
                            {/* Header Skeleton */}
                            <div className="sk-header">
                                <div className="sk-title"></div>
                                <div className="sk-subtitle"></div>
                            </div>

                            {/* Stats Skeleton */}
                            <div className="stats-row">
                                <div className="stat-card sk-card"><div className="sk-icon"></div><div className="sk-content"><div className="sk-h3"></div><div className="sk-p"></div></div></div>
                                <div className="stat-card sk-card"><div className="sk-icon"></div><div className="sk-content"><div className="sk-h3"></div><div className="sk-p"></div></div></div>
                                <div className="stat-card sk-card"><div className="sk-icon"></div><div className="sk-content"><div className="sk-h3"></div><div className="sk-p"></div></div></div>
                            </div>

                            {/* Table Skeleton */}
                            <div className="table-card sk-table-card">
                                <div className="section-head"><div className="sk-title-sm"></div></div>
                                <div className="sk-rows">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="sk-row">
                                            <div className="sk-cell wide"></div>
                                            <div className="sk-cell"></div>
                                            <div className="sk-cell"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {section === 'overview' && (
                                <div className="dashboard-view">
                                    <header className="view-header admin-reveal">
                                        <h1>Dashboard Overview</h1>
                                        <p>Welcome back, Administrator.</p>
                                    </header>

                                    <div className="stats-row">
                                        <div className="stat-card blue admin-reveal">
                                            <div className="stat-icon"><Users /></div>
                                            <div className="stat-data">
                                                <h3>{stats.totalUsers}</h3>
                                                <p>Total Users</p>
                                            </div>
                                        </div>
                                        <div className="stat-card purple admin-reveal">
                                            <div className="stat-icon"><BookOpen /></div>
                                            <div className="stat-data">
                                                <h3>{stats.totalBooks}</h3>
                                                <p>Total Books</p>
                                            </div>
                                        </div>
                                        <div className="stat-card rose admin-reveal">
                                            <div className="stat-icon"><Tags /></div>
                                            <div className="stat-data">
                                                <h3>{stats.totalCategories}</h3>
                                                <p>Categories</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="recent-section admin-reveal">
                                        <div className="section-head">
                                            <h2>Recent Users</h2>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="modern-table">
                                                <thead>
                                                    <tr>
                                                        <th>User</th>
                                                        <th>Email</th>
                                                        <th>Role</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.slice(0, 5).map(u => (
                                                        <tr key={u._id || u.id}>
                                                            <td>
                                                                <div className="user-flex">
                                                                    <div className="table-avatar">{u.username[0]}</div>
                                                                    <span>{u.username}</span>
                                                                </div>
                                                            </td>
                                                            <td>{u.email}</td>
                                                            <td><span className={`badge ${u.isAdmin ? 'admin' : 'user'}`}>{u.isAdmin ? 'Admin' : 'User'}</span></td>
                                                            <td><span className="status-dot active">Active</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {section === 'users' && (
                                <div className="dashboard-view">
                                    <header className="view-header with-action admin-reveal">
                                        <div>
                                            <h1>User Management</h1>
                                            <p>Manage system access and roles.</p>
                                        </div>
                                        <button className="primary-btn" onClick={() => setShowUserModal(true)}>
                                            <Plus size={18} /> Add User
                                        </button>
                                    </header>

                                    <div className="table-card admin-reveal">
                                        <div className="table-responsive">
                                            <table className="modern-table">
                                                <thead>
                                                    <tr>
                                                        <th>User</th>
                                                        <th>Email</th>
                                                        <th>Role</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map(u => (
                                                        <tr key={u._id || u.id}>
                                                            <td>
                                                                <div className="user-flex">
                                                                    <div className="table-avatar">{u.username[0]}</div>
                                                                    <span>{u.username}</span>
                                                                </div>
                                                            </td>
                                                            <td>{u.email}</td>
                                                            <td><span className={`badge ${u.isAdmin ? 'admin' : 'user'}`}>{u.isAdmin ? 'Admin' : 'User'}</span></td>
                                                            <td>
                                                                <button className="icon-action delete" onClick={() => handleDeleteUser(u._id || u.id)}>
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {section === 'books' && (
                                <div className="dashboard-view">
                                    <header className="view-header with-action admin-reveal">
                                        <div>
                                            <h1>Book Management</h1>
                                            <p>Manage digital library inventory.</p>
                                        </div>
                                        <button className="primary-btn" onClick={() => {
                                            setEditingBook(null);
                                            setBookForm({ title: '', author: '', bookUrl: '', imageUrl: '', categoryId: '' });
                                            setShowBookModal(true);
                                        }}>
                                            <Plus size={18} /> Add Book
                                        </button>
                                    </header>

                                    <div className="books-grid-modern admin-reveal">
                                        {books.map(b => (
                                            <div key={b._id || b.id} className="book-card-item">
                                                <div className="card-cover">
                                                    <img src={b.imageUrl || 'https://via.placeholder.com/150'} alt={b.title} />
                                                </div>
                                                <div className="card-info">
                                                    <h4>{b.title}</h4>
                                                    <p>{b.author}</p>
                                                    <div className="card-meta">
                                                        <span className="cat-tag">{b.category_name || 'General'}</span>
                                                        <div className="card-actions">
                                                            <button className="icon-action edit" onClick={() => openEditBook(b)}>
                                                                <Edit3 size={15} />
                                                            </button>
                                                            <button className="icon-action delete" onClick={() => handleDeleteBook(b._id || b.id)}>
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {section === 'categories' && (
                                <div className="dashboard-view">
                                    <header className="view-header with-action admin-reveal">
                                        <div>
                                            <h1>Category Management</h1>
                                            <p>Organize books into genres.</p>
                                        </div>
                                        <button className="primary-btn" onClick={() => {
                                            setEditingCategory(null);
                                            setCategoryForm({ name: '' });
                                            setShowCategoryModal(true);
                                        }}>
                                            <Plus size={18} /> Add Category
                                        </button>
                                    </header>

                                    <div className="table-card admin-reveal">
                                        <div className="table-responsive">
                                            <table className="modern-table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Book Count</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categories.map(c => (
                                                        <tr key={c._id || c.id}>
                                                            <td><span className="cat-tag">{c.name}</span></td>
                                                            <td><span className="status-dot">{(c.book_count || 0) + ' Books'}</span></td>
                                                            <td>
                                                                <div className="user-flex" style={{ gap: '4px' }}>
                                                                    <button className="icon-action edit" onClick={() => openEditCategory(c)}>
                                                                        <Edit3 size={16} />
                                                                    </button>
                                                                    <button className="icon-action delete" onClick={() => handleDeleteCategory(c._id || c.id)}>
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Modals */}
            {showUserModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-head">
                            <h3>Add New User</h3>
                            <button onClick={() => setShowUserModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUserSubmit}>
                            <div className="input-group">
                                <label>Username</label>
                                <input type="text" required value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input type="password" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                            </div>
                            <div className="input-group check">
                                <input type="checkbox" checked={userForm.isAdmin} onChange={e => setUserForm({ ...userForm, isAdmin: e.target.checked })} />
                                <label>Admin Privileges</label>
                            </div>
                            <button className="submit-btn full">Create User</button>
                        </form>
                    </div>
                </div>
            )}

            {showBookModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-head">
                            <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
                            <button onClick={() => setShowBookModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleBookSubmit}>
                            <div className="input-group">
                                <label>Title</label>
                                <input type="text" required value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Author</label>
                                <input type="text" required value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <select value={bookForm.categoryId} onChange={e => setBookForm({ ...bookForm, categoryId: e.target.value })}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Cover URL</label>
                                <input type="text" required value={bookForm.imageUrl} onChange={e => setBookForm({ ...bookForm, imageUrl: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Book Link</label>
                                <input type="text" required value={bookForm.bookUrl} onChange={e => setBookForm({ ...bookForm, bookUrl: e.target.value })} />
                            </div>
                            <button className="submit-btn full">
                                {editingBook ? 'Save Changes' : 'Add Book'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-head">
                            <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                            <button onClick={() => setShowCategoryModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="input-group">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryForm.name}
                                    onChange={e => setCategoryForm({ name: e.target.value })}
                                    placeholder="e.g. Science Fiction"
                                />
                            </div>
                            <button className="submit-btn full">{editingCategory ? 'Save Changes' : 'Add Category'}</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                :root {
                    --bg-dark: #0f172a;
                    --bg-card: #1e293b;
                    --primary: #6366f1;
                    --primary-hover: #4f46e5;
                    --text-main: #f8fafc;
                    --text-muted: #94a3b8;
                    --border: rgba(255, 255, 255, 0.08);
                }

                .admin-layout-modern {
                    min-height: 100vh;
                    background: var(--bg-dark);
                    color: var(--text-main);
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                /* Navbar */
                .admin-navbar {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--border);
                    padding: 0 24px;
                    transition: all 0.3s;
                }
                .admin-navbar.scrolled {
                    background: rgba(15, 23, 42, 0.95);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                }

                .nav-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .brand-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .brand-logo {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
                }
                .shield-icon { color: white; }
                .brand-name { font-size: 1.2rem; font-weight: 700; color: white; letter-spacing: -0.5px; }
                .brand-name span { color: #818cf8; font-weight: 400; }

                .nav-links {
                    display: flex;
                    gap: 8px;
                }
                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 8px;
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .nav-link:hover { color: white; background: rgba(255,255,255,0.05); }
                .nav-link.active { background: rgba(99, 102, 241, 0.15); color: #818cf8; font-weight: 600; }

                .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .admin-profile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 12px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 30px;
                    border: 1px solid var(--border);
                }
                .admin-avatar {
                    width: 28px;
                    height: 28px;
                    background: #6366f1;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 700;
                }
                .admin-label { font-size: 0.85rem; font-weight: 600; color: #e2e8f0; }
                
                .logout-button {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: 0.2s;
                }
                .logout-button:hover { color: #f43f5e; background: rgba(244, 63, 94, 0.1); }

                /* Main Content */
                .admin-main {
                    flex: 1;
                    padding: 30px;
                }
                .content-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .view-header { margin-bottom: 40px; }
                .view-header.with-action { display: flex; justify-content: space-between; align-items: flex-end; }
                .view-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
                .view-header p { color: var(--text-muted); font-size: 1rem; }

                .primary-btn {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: 0.2s;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .primary-btn:hover { background: var(--primary-hover); transform: translateY(-2px); }

                /* Stats (Premium Style) */
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 40px;
                }
                .stat-card {
                    background: linear-gradient(145deg, rgba(51, 65, 85, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    padding: 24px 30px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
                }
                .stat-card:hover { 
                    transform: translateY(-5px); 
                    border-color: rgba(99, 102, 241, 0.8); 
                    background: linear-gradient(145deg, rgba(71, 85, 105, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
                }
                .stat-icon {
                    flex-shrink: 0;
                    width: 60px;
                    height: 60px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    background: rgba(15, 23, 42, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
                }
                .stat-card.blue .stat-icon { background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1)); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
                .stat-card.purple .stat-icon { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1)); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); }
                .stat-card.rose .stat-icon { background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.1)); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.2); }
                
                .stat-data h3 { font-size: 2.5rem; font-weight: 800; line-height: 1; margin: 0 0 4px 0; letter-spacing: -1px; }
                .stat-data p { color: var(--text-muted); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0; }

                /* Tables */
                /* Tables */
                .table-card, .recent-section {
                    background: rgba(30, 41, 59, 0.6); 
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    overflow: hidden;
                    padding: 24px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
                }
                .table-responsive { width: 100%; overflow-x: auto; }
                .section-head { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
                .section-head h2 { font-size: 1.2rem; font-weight: 700; }

                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { text-align: left; padding: 12px; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
                .modern-table td { padding: 16px 12px; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
                .modern-table tr:last-child td { border-bottom: none; }
                
                .user-flex { display: flex; align-items: center; gap: 12px; font-weight: 500; }
                .table-avatar { width: 32px; height: 32px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: #e2e8f0; }
                
                .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
                .badge.admin { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
                .badge.user { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .status-dot { color: #10b981; font-weight: 600; font-size: 0.85rem; }
                .status-dot::before { content: '•'; margin-right: 6px; font-size: 1.2rem; }

                .icon-action {
                    background: transparent; border: none; padding: 8px; border-radius: 8px;
                    color: var(--text-muted); cursor: pointer; transition: 0.2s;
                }
                .icon-action:hover { background: rgba(255,255,255,0.05); color: white; }
                .icon-action.delete:hover { color: #f43f5e; background: rgba(244,63,94,0.1); }
                .icon-action.edit:hover { color: #60a5fa; background: rgba(59,130,246,0.1); }

                /* Books Grid - Horizontal Side Info Style */
                .books-grid-modern {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 24px;
                }
                .book-card-item {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    overflow: hidden;
                    transition: 0.3s;
                    display: flex; /* Horizontal Layout */
                    padding: 20px;
                    gap: 20px;
                }
                .book-card-item:hover { transform: translateY(-5px); border-color: var(--primary); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
                
                .card-cover { 
                    width: 120px; 
                    height: 160px; 
                    flex-shrink: 0; 
                    border-radius: 12px;
                    overflow: hidden;
                }
                .card-cover img { width: 100%; height: 100%; object-fit: cover; }
                
                .card-info { 
                    flex: 1; 
                    display: flex; 
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 0; /* padding handled by parent gap/padding */
                }
                .card-info h4 { margin: 0 0 6px; font-size: 1.1rem; color: #f1f5f9; font-weight: 700; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; white-space: normal; }
                .card-info p { margin: 0; color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }
                
                .card-meta { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; }
                .cat-tag { font-size: 0.75rem; background: rgba(255,255,255,0.05); padding: 6px 10px; border-radius: 8px; color: #cbd5e1; font-weight: 600; }

                /* Modals */
                .modal-backdrop {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .modal-content {
                    background: #1e293b; width: 100%; max-width: 480px;
                    border-radius: 24px; padding: 32px; border: 1px solid var(--border);
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                }
                .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .modal-head h3 { font-size: 1.5rem; font-weight: 700; margin: 0; }
                .modal-head button { background: transparent; border: none; color: var(--text-muted); cursor: pointer; }
                
                .input-group { margin-bottom: 20px; }
                .input-group label { display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500; color: #cbd5e1; }
                .input-group input, .input-group select {
                    width: 100%; padding: 12px 16px; background: #0f172a;
                    border: 1px solid var(--border); border-radius: 12px;
                    color: white; outline: none; transition: 0.2s;
                }
                .input-group input:focus, .input-group select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }
                
                .input-group.check { display: flex; align-items: center; gap: 12px; }
                .input-group.check input { width: 20px; height: 20px; }
                .input-group.check label { margin: 0; }

                .submit-btn {
                    background: var(--primary); color: white; border: none;
                    padding: 14px; border-radius: 12px; font-weight: 600;
                    cursor: pointer; width: 100%; transition: 0.2s;
                    font-size: 1rem;
                }
                .submit-btn:hover { background: var(--primary-hover); }

                /* Mobile Menu */
                .mobile-toggle { display: none; background: transparent; border: none; color: white; cursor: pointer; padding: 4px; }
                .mobile-menu {
                    background: rgba(15, 23, 42, 0.98);
                    border-bottom: 1px solid var(--border);
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    backdrop-filter: blur(12px);
                    animation: slideDown 0.3s ease-out;
                }
                @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                .mobile-nav-link {
                    display: flex; align-items: center; gap: 12px; padding: 12px 16px;
                    border-radius: 12px; color: var(--text-muted); text-decoration: none;
                    font-weight: 500; transition: 0.2s;
                }
                .mobile-nav-link:hover { background: rgba(255,255,255,0.05); color: white; }
                .mobile-nav-link.active { background: rgba(99, 102, 241, 0.15); color: #818cf8; }

                /* Responsive Tables */
                .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
                .modern-table { min-width: 600px; } /* Ensure table doesn't squish too much */

                @media (max-width: 900px) {
                    .desktop-only { display: none !important; }
                    .mobile-toggle { display: block; }
                    .stats-row { grid-template-columns: 1fr; gap: 16px; }
                    .books-grid-modern { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
                }

                /* Skeleton Loader */
                .skeleton-loader { animation: fadeIn 0.5s ease; }
                .sk-card { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05); }
                .sk-table-card { height: 400px; }
                
                .sk-title { width: 40%; height: 40px; background: rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 12px; }
                .sk-title-sm { width: 25%; height: 28px; background: rgba(255,255,255,0.1); border-radius: 8px; }
                .sk-subtitle { width: 25%; height: 16px; background: rgba(255,255,255,0.05); border-radius: 4px; }
                
                .sk-icon { width: 60px; height: 60px; border-radius: 16px; background: rgba(255,255,255,0.1); }
                .sk-content { flex: 1; }
                .sk-h3 { width: 50%; height: 32px; background: rgba(255,255,255,0.1); border-radius: 6px; margin-bottom: 8px; }
                .sk-p { width: 30%; height: 14px; background: rgba(255,255,255,0.05); border-radius: 4px; }

                .sk-rows { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
                .sk-row { display: flex; gap: 20px; align-items: center; }
                .sk-cell { height: 20px; background: rgba(255,255,255,0.05); border-radius: 4px; flex: 1; }
                .sk-cell.wide { flex: 2; }

                .sk-title, .sk-subtitle, .sk-icon, .sk-h3, .sk-p, .sk-cell, .sk-title-sm {
                    position: relative;
                    overflow: hidden;
                }
                .sk-title::after, .sk-subtitle::after, .sk-icon::after, .sk-h3::after, .sk-p::after, .sk-cell::after, .sk-title-sm::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
                    transform: translateX(-100%);
                    animation: shimmer 1.5s infinite;
                }

                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }

                @media (max-width: 600px) {
                    .nav-container { padding: 0 16px; }
                    .admin-main { padding: 16px; }
                    .books-grid-modern { grid-template-columns: 1fr; }
                    .stat-card { padding: 20px; }
                    .stat-data h3 { font-size: 2rem; }
                    .view-header h1 { font-size: 1.5rem; }
                    .view-header.with-action { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .primary-btn { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
