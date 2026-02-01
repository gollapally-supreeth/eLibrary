import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Tags,
    Settings,
    LogOut,
    Menu,
    X,
    Plus,
    Search,
    ChevronRight,
    MoreHorizontal,
    Activity,
    Shield,
    Trash2,
    Edit3,
    BarChart3,
    Server,
    Database,
    Globe,
    AlertCircle
} from 'lucide-react';
import gsap from 'gsap';

const AdminDashboard = ({ section }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, totalCategories: 0 });
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const [statsRes, usersRes, booksRes] = await Promise.all([
                    axios.get('/api/admin/stats'),
                    axios.get('/api/admin/users').catch(() => ({ data: [] })),
                    axios.get('/api/books').catch(() => ({ data: [] }))
                ]);

                if (isMounted) {
                    setStats(statsRes.data);
                    setUsers(usersRes.data);
                    setBooks(booksRes.data);
                }
            } catch (err) {
                console.error('Admin data fetch error', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAdminData();
        return () => { isMounted = false; };
    }, [section]);

    useEffect(() => {
        if (!loading) {
            gsap.from('.admin-reveal', {
                y: 20,
                duration: 0.6,
                stagger: 0.08,
                ease: 'expo.out'
            });
        }
    }, [loading, section]);

    const handleLogout = async () => {
        await axios.post('/api/auth/logout');
        navigate('/login');
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to terminate this user node?')) return;
        setIsActionLoading(true);
        try {
            // Placeholder for actual delete call if it existed
            // await axios.delete(`/api/admin/users/${userId}`);
            setUsers(users.filter(u => (u._id || u.id) !== userId));
            setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className={`admin-portal-v02 ${isSidebarOpen ? '' : 'sidebar-hidden'}`} ref={containerRef}>
            {/* Ambient Background for Admin */}
            <div className="admin-v2-atmosphere">
                <div className="admin-glow-blob primary"></div>
                <div className="admin-glow-blob secondary"></div>
            </div>

            <aside className="admin-sidebar-v2 glass-morphism">
                <div className="admin-branding-v2">
                    <div className="v2-shield-box"><Shield size={24} /></div>
                    <div className="v2-brand-text">
                        <span>CORE<span>ADMIN</span></span>
                        <p>SYSTEM v0.2.4</p>
                    </div>
                </div>

                <nav className="admin-nav-v2">
                    <div className="nav-group">
                        <p>COMMAND</p>
                        <NavLink to="/admin" className={({ isActive }) => `v2-admin-link ${isActive ? 'active' : ''}`} end>
                            <LayoutDashboard size={20} /> <span>Overview</span>
                        </NavLink>
                    </div>

                    <div className="nav-group">
                        <p>MANAGEMENT</p>
                        <NavLink to="/admin/users" className={({ isActive }) => `v2-admin-link ${isActive ? 'active' : ''}`}>
                            <Users size={20} /> <span>User Nodes</span>
                        </NavLink>
                        <NavLink to="/admin/books" className={({ isActive }) => `v2-admin-link ${isActive ? 'active' : ''}`}>
                            <BookOpen size={20} /> <span>Archive Inventory</span>
                        </NavLink>
                        <NavLink to="/admin/categories" className={({ isActive }) => `v2-admin-link ${isActive ? 'active' : ''}`}>
                            <Tags size={20} /> <span>Genre Clusters</span>
                        </NavLink>
                    </div>
                </nav>

                <div className="admin-sidebar-footer-v2">
                    <div className="server-status glass-morphism">
                        <div className="status-header">
                            <Server size={14} />
                            <span>NODE-ALPHA</span>
                        </div>
                        <div className="status-bars">
                            <div className="bar active"></div>
                            <div className="bar active"></div>
                            <div className="bar pulse"></div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="admin-logout-v2">
                        <LogOut size={18} /> <span>Relinquish Control</span>
                    </button>
                </div>
            </aside>

            <main className="admin-content-v2">
                <header className="admin-top-v2 glass-morphism">
                    <div className="top-left-v2">
                        <button className="v2-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            <Menu size={22} />
                        </button>
                        <div className="v2-breadcrumb">
                            <Database size={16} /> <span>ARCHIVE</span> <ChevronRight size={14} /> <span className="highlight">{section}</span>
                        </div>
                    </div>

                    <div className="top-right-v2">
                        <div className="system-metrics">
                            <div className="metric">
                                <span className="dot online"></span>
                                <span>DB: READY</span>
                            </div>
                        </div>
                        <div className="admin-pill-v2">
                            <div className="pill-text">MASTER_ROOT</div>
                            <div className="pill-circle">AD</div>
                        </div>
                    </div>
                </header>

                <div className="admin-body-v2">
                    {loading ? (
                        <div className="v2-global-loader">
                            <div className="v2-loader-circle"></div>
                            <p>Connecting to Secure Nodes...</p>
                        </div>
                    ) : (
                        <div className="v2-view-content">
                            {section === 'overview' && (
                                <div className="v2-overview-grid">
                                    <div className="v2-stat-card-admin admin-reveal">
                                        <div className="stat-v2-header">
                                            <div className="stat-v2-icon blue"><Users /></div>
                                            <span className="stat-v2-tag">+12%</span>
                                        </div>
                                        <div className="stat-v2-body">
                                            <h3>{stats.totalUsers}</h3>
                                            <p>Authenticated Nodes</p>
                                        </div>
                                    </div>
                                    <div className="v2-stat-card-admin admin-reveal">
                                        <div className="stat-v2-header">
                                            <div className="stat-v2-icon purple"><BookOpen /></div>
                                            <span className="stat-v2-tag">STABLE</span>
                                        </div>
                                        <div className="stat-v2-body">
                                            <h3>{stats.totalBooks}</h3>
                                            <p>Digital Volumes</p>
                                        </div>
                                    </div>
                                    <div className="v2-stat-card-admin admin-reveal">
                                        <div className="stat-v2-header">
                                            <div className="stat-v2-icon rose"><Tags /></div>
                                            <span className="stat-v2-tag">INDEXED</span>
                                        </div>
                                        <div className="stat-v2-body">
                                            <h3>{stats.totalCategories}</h3>
                                            <p>Mapped Genres</p>
                                        </div>
                                    </div>

                                    <div className="v2-wide-card glass-morphism admin-reveal">
                                        <div className="wide-card-header">
                                            <div className="title-box">
                                                <h3>Recent Access Streams</h3>
                                                <p>Monitoring real-time authentication events</p>
                                            </div>
                                            <button className="v2-ghost-btn">Export Data</button>
                                        </div>
                                        <div className="v2-table-wrap">
                                            <table className="v2-admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>USER IDENTIFIER</th>
                                                        <th>COMMUNICATION</th>
                                                        <th>ACCESS LEVEL</th>
                                                        <th>NODE STATUS</th>
                                                        <th>ACTION</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.slice(0, 5).map(u => (
                                                        <tr key={u._id || u.id}>
                                                            <td className="v2-user-cell">
                                                                <div className="v2-tiny-avatar">{u.username.charAt(0)}</div>
                                                                <span>{u.username}</span>
                                                            </td>
                                                            <td>{u.email}</td>
                                                            <td><span className={`v2-badge ${u.isAdmin ? 'admin' : 'user'}`}>{u.isAdmin ? 'MASTER' : 'ENTITY'}</span></td>
                                                            <td><span className="v2-status-pill">ACTIVE</span></td>
                                                            <td><MoreHorizontal size={18} className="faded-icon" /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {section === 'users' && (
                                <div className="v2-manager-container">
                                    <div className="v2-manager-head admin-reveal">
                                        <div className="head-text">
                                            <h1>Identity Protocols</h1>
                                            <p>Manage secure user node authentication and access tiers</p>
                                        </div>
                                        <button className="v2-primary-btn"><Plus size={18} /> Provision New Identity</button>
                                    </div>
                                    <div className="v2-table-card glass-morphism admin-reveal">
                                        <table className="v2-admin-table">
                                            <thead>
                                                <tr>
                                                    <th>IDENTITY</th>
                                                    <th>COMM CHANNEL</th>
                                                    <th>TIER LEVEL</th>
                                                    <th>INTEGRITY</th>
                                                    <th>NODE OPS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(u => (
                                                    <tr key={u._id || u.id}>
                                                        <td className="v2-user-cell"><div className="v2-tiny-avatar">{u.username.charAt(0)}</div> {u.username}</td>
                                                        <td>{u.email}</td>
                                                        <td><span className={`v2-badge ${u.isAdmin ? 'admin' : 'user'}`}>{u.isAdmin ? 'MASTER_ROOT' : 'VERIFIED_USER'}</span></td>
                                                        <td><div className="integrity-bar"><div className="fill" style={{ width: '95%' }}></div></div></td>
                                                        <td className="v2-ops">
                                                            <button className="op-v2 edit"><Edit3 size={16} /></button>
                                                            <button className="op-v2 delete" onClick={() => handleDeleteUser(u._id || u.id)}><Trash2 size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {section === 'books' && (
                                <div className="v2-manager-container">
                                    <div className="v2-manager-head admin-reveal">
                                        <div className="head-text">
                                            <h1>Archive Architecture</h1>
                                            <p>Control digital asset metadata and inventory dispersal</p>
                                        </div>
                                        <button className="v2-primary-btn"><Plus size={18} /> Catalog New Volume</button>
                                    </div>
                                    <div className="v2-archive-grid admin-reveal">
                                        {books.map(b => (
                                            <div key={b._id || b.id} className="v2-archive-item glass-morphism">
                                                <div className="v2-arch-thumb">
                                                    <img src={b.imageUrl || 'https://via.placeholder.com/150'} alt="" />
                                                    <div className="arch-meta-tag">V:01</div>
                                                </div>
                                                <div className="v2-arch-details">
                                                    <h4>{b.title}</h4>
                                                    <p>{b.author || 'ROOT_CREATOR'}</p>
                                                    <div className="v2-arch-footer">
                                                        <span className="cat-pill">{b.category_name || 'GENERAL'}</span>
                                                        <div className="arch-actions">
                                                            <Edit3 size={14} />
                                                            <Trash2 size={14} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .admin-portal-v02 { display: grid; grid-template-columns: 320px 1fr; height: 100vh; background: #020617; color: white; overflow: hidden; transition: 0.6s cubic-bezier(0.19, 1, 0.22, 1); }
                .admin-portal-v02.sidebar-hidden { grid-template-columns: 0px 1fr; }
                
                .admin-v2-atmosphere { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
                .admin-glow-blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.12; }
                .admin-glow-blob.primary { width: 700px; height: 700px; background: #3b82f6; top: -10%; left: -5%; }
                .admin-glow-blob.secondary { width: 500px; height: 500px; background: #f43f5e; bottom: -5%; right: -5%; }

                .admin-sidebar-v2 { 
                    height: 100vh; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(40px);
                    border-right: 1px solid rgba(255,255,255,0.05); padding: 50px 30px; display: flex; flex-direction: column;
                    z-index: 50; transition: transform 0.6s;
                }
                .sidebar-hidden .admin-sidebar-v2 { transform: translateX(-100%); width: 0; padding: 0; }
                
                .admin-branding-v2 { display: flex; align-items: center; gap: 15px; margin-bottom: 60px; }
                .v2-shield-box { width: 48px; height: 48px; background: #f43f5e; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(244, 63, 94, 0.4); }
                .v2-brand-text span { font-size: 1.4rem; font-weight: 900; letter-spacing: -1px; display: block; line-height: 1; }
                .v2-brand-text span span { display: inline; color: #f43f5e; }
                .v2-brand-text p { font-size: 0.65rem; font-weight: 800; color: #64748b; margin-top: 5px; opacity: 0.8; }

                .admin-nav-v2 { flex: 1; }
                .nav-group { margin-bottom: 40px; }
                .nav-group p { font-size: 0.7rem; font-weight: 900; color: #475569; letter-spacing: 2px; margin-bottom: 15px; padding-left: 15px; }
                
                .v2-admin-link { 
                    display: flex; align-items: center; gap: 15px; padding: 16px 20px; border-radius: 18px; 
                    text-decoration: none; color: #94a3b8; font-weight: 700; transition: 0.3s; margin-bottom: 8px;
                }
                .v2-admin-link:hover { color: white; background: rgba(255,255,255,0.03); }
                .v2-admin-link.active { background: #f43f5e; color: white; box-shadow: 0 15px 30px rgba(244, 63, 94, 0.2); }

                .admin-sidebar-footer-v2 { padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); }
                .server-status { padding: 18px; border-radius: 20px; background: rgba(255,255,255,0.03); margin-bottom: 25px; }
                .status-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .status-header span { font-size: 0.7rem; font-weight: 800; color: #94a3b8; }
                .status-bars { display: flex; gap: 4px; }
                .bar { height: 4px; flex: 1; background: rgba(255,255,255,0.1); border-radius: 2px; }
                .bar.active { background: #10b981; }
                .bar.pulse { background: #10b981; animation: statusPulse 1.5s infinite; }
                @keyframes statusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                
                .admin-logout-v2 { width: 100%; display: flex; align-items: center; gap: 12px; padding: 15px; border-radius: 16px; background: transparent; border: none; color: #94a3b8; cursor: pointer; font-weight: 700; transition: 0.3s; }
                .admin-logout-v2:hover { background: rgba(244, 63, 94, 0.05); color: #f43f5e; }

                .admin-content-v2 { flex: 1; display: flex; flex-direction: column; padding: 35px 50px; z-index: 10; overflow-y: auto; }
                .admin-top-v2 { display: flex; justify-content: space-between; align-items: center; padding: 20px 35px; border-radius: 30px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.05); margin-bottom: 45px; }
                .top-left-v2 { display: flex; align-items: center; gap: 30px; }
                .v2-toggle { background: transparent; border: none; color: #94a3b8; cursor: pointer; }
                .v2-breadcrumb { display: flex; align-items: center; gap: 12px; color: #64748b; font-weight: 800; font-size: 0.85rem; letter-spacing: 0.5px; }
                .v2-breadcrumb .highlight { color: #f43f5e; text-transform: uppercase; }

                .top-right-v2 { display: flex; align-items: center; gap: 40px; }
                .system-metrics { display: flex; gap: 20px; }
                .metric { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 900; color: #94a3b8; }
                .dot { width: 6px; height: 6px; border-radius: 50%; }
                .dot.online { background: #10b981; box-shadow: 0 0 8px #10b981; }
                
                .admin-pill-v2 { 
                    display: flex; align-items: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 8px 18px; 
                    border-radius: 100px; border: 1px solid rgba(255,255,255,0.05); 
                }
                .pill-text { font-size: 0.75rem; font-weight: 900; color: #94a3b8; letter-spacing: 1px; }
                .pill-circle { width: 34px; height: 34px; background: #f43f5e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem; }

                .v2-overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
                .v2-stat-card-admin { 
                    padding: 35px; border-radius: 40px; border: 1px solid rgba(255,255,255,0.05);
                    background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%);
                    transition: 0.4s; position: relative; overflow: hidden;
                }
                .v2-stat-card-admin:hover { transform: translateY(-10px); border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.02); }
                .stat-v2-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .stat-v2-icon { width: 60px; height: 60px; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
                .stat-v2-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .stat-v2-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .stat-v2-icon.rose { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
                .stat-v2-tag { font-size: 0.7rem; font-weight: 900; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 8px; color: #94a3b8; }
                
                .stat-v2-body h3 { font-size: 3rem; font-weight: 900; line-height: 1; margin-bottom: 5px; }
                .stat-v2-body p { font-size: 0.8rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; }

                .v2-wide-card { grid-column: span 3; padding: 45px; border-radius: 45px; border: 1px solid rgba(255,255,255,0.05); }
                .wide-card-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
                .title-box h3 { font-size: 1.8rem; letter-spacing: -1px; margin-bottom: 5px; }
                .title-box p { color: #64748b; font-weight: 600; }
                .v2-ghost-btn { padding: 12px 24px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: white; font-weight: 800; cursor: pointer; transition: 0.3s; }
                .v2-ghost-btn:hover { background: rgba(255,255,255,0.08); }

                .v2-admin-table { width: 100%; border-collapse: collapse; }
                .v2-admin-table th { text-align: left; padding: 20px; color: #475569; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .v2-admin-table td { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.02); color: #cbd5e1; font-weight: 600; font-size: 0.95rem; }
                
                .v2-user-cell { display: flex; align-items: center; gap: 15px; }
                .v2-tiny-avatar { width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
                .v2-badge { padding: 6px 14px; border-radius: 10px; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px; }
                .v2-badge.admin { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
                .v2-badge.user { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .v2-status-pill { font-size: 0.7rem; font-weight: 900; color: #10b981; }

                .v2-manager-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 45px; }
                .v2-manager-head h1 { font-size: 3.5rem; letter-spacing: -3px; line-height: 1; }
                .v2-manager-head p { font-size: 1.1rem; color: #64748b; margin-top: 10px; font-weight: 500; }
                .v2-primary-btn { padding: 16px 32px; background: #f43f5e; color: white; border-radius: 20px; border: none; font-weight: 800; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s; box-shadow: 0 15px 30px rgba(244, 63, 94, 0.3); }
                .v2-primary-btn:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(244, 63, 94, 0.4); }

                .v2-archive-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 30px; }
                .v2-archive-item { padding: 25px; border-radius: 35px; border: 1px solid rgba(255,255,255,0.05); display: flex; gap: 25px; transition: 0.4s; }
                .v2-archive-item:hover { transform: translateY(-8px); border-color: #f43f5e; }
                .v2-arch-thumb { width: 140px; height: 190px; border-radius: 20px; overflow: hidden; position: relative; }
                .v2-arch-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .arch-meta-tag { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 6px; font-size: 0.6rem; font-weight: 900; }
                
                .v2-arch-details { flex: 1; display: flex; flex-direction: column; }
                .v2-arch-details h4 { font-size: 1.3rem; margin-bottom: 5px; }
                .v2-arch-details p { color: #64748b; font-size: 0.9rem; flex: 1; }
                .v2-arch-footer { display: flex; justify-content: space-between; align-items: center; }
                .cat-pill { padding: 6px 14px; background: rgba(255,255,255,0.03); border-radius: 10px; font-size: 0.7rem; font-weight: 900; color: #94a3b8; }
                .arch-actions { display: flex; gap: 15px; color: #475569; }

                .v2-global-loader { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .v2-loader-circle { width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.05); border-top-color: #f43f5e; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 25px; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .v2-ops { display: flex; gap: 12px; }
                .op-v2 { width: 42px; height: 42px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); background: transparent; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
                .op-v2.edit:hover { background: #3b82f6; color: white; }
                .op-v2.delete:hover { background: #f43f5e; color: white; }
                
                .integrity-bar { width: 100px; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
                .integrity-bar .fill { height: 100%; background: #10b981; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
