import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    Library,
    BookOpen,
    Sparkles,
    Eye,
    EyeOff
} from 'lucide-react';
import gsap from 'gsap';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const slidePanelRef = useRef(null);
    const formContainerRef = useRef(null);

    useEffect(() => {
        // Initial entrance animation
        const tl = gsap.timeline();
        tl.from('.login-container', {
            scale: 0.95,
            duration: 0.8,
            ease: 'expo.out'
        })
            .from('.login-reveal', {
                y: 20,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
            }, '-=0.4');
    }, []);

    const handleModeSwitch = () => {
        const newMode = !isLogin;
        const isMobile = window.innerWidth <= 900;

        if (isMobile) {
            // Simple fade for mobile
            gsap.to('.form-content', {
                opacity: 0,
                y: -10,
                duration: 0.2,
                onComplete: () => {
                    setIsLogin(newMode);
                    gsap.fromTo('.form-content',
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.3 }
                    );
                }
            });
        } else {
            // Desktop Sliding Animation
            const tl = gsap.timeline();

            // Card pulse
            tl.to(formContainerRef.current, {
                scale: 0.98,
                duration: 0.15,
                ease: 'power2.in'
            })
                .to(formContainerRef.current, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'back.out(2)'
                });

            // Slide panel animation
            if (newMode) {
                // Switching to Login (newMode is true) -> Panel moves to RIGHT (100%)
                gsap.to(slidePanelRef.current, {
                    x: '100%',
                    duration: 1,
                    ease: 'expo.inOut'
                });
            } else {
                // Switching to Register (newMode is false) -> Panel moves to LEFT (0%)
                gsap.to(slidePanelRef.current, {
                    x: '0%',
                    duration: 1,
                    ease: 'expo.inOut'
                });
            }

            // Fade out current content
            gsap.to('.form-content', {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    setIsLogin(newMode);
                    // Fade in new content
                    gsap.fromTo('.form-content',
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
                    );
                }
            });
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = isLogin ? '/api/auth/login' : '/api/auth/register';
        const data = isLogin ? { email, password } : { username, email, password };

        try {
            const res = await axios.post(url, data);

            if (isLogin) {
                // Login - backend returns { message, isAdmin, redirectUrl }
                if (res.data.isAdmin) {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                // Registration successful - switch to login
                setIsLogin(true);
                setPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
            gsap.fromTo('.error-message',
                { x: -10 },
                { x: 10, duration: 0.1, repeat: 5, yoyo: true, ease: 'power2.inOut' }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Gradient Background */}
            <div className="login-bg">
                <div className="bg-orb orb-1"></div>
                <div className="bg-orb orb-2"></div>
                <div className="bg-orb orb-3"></div>
            </div>

            {/* Navigation Header */}
            <nav className="login-nav login-reveal">
                <Link to="/" className="nav-logo">
                    <Library size={28} />
                    <span>eLibrary</span>
                </Link>
            </nav>

            {/* Main Container */}
            <div className="login-container" ref={formContainerRef}>
                {/* Background Filler */}
                <div className="container-bg"></div>

                {/* Sliding Animated Panel */}
                <div
                    className="slide-panel"
                    ref={slidePanelRef}
                >
                    <div className="panel-content">
                        <div className="panel-icon login-reveal">
                            <BookOpen size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="login-reveal">
                            {isLogin ? 'Welcome Back!' : 'Join eLibrary'}
                        </h2>
                        <p className="login-reveal">
                            {isLogin
                                ? 'Access your digital library and continue your reading journey.'
                                : 'Create your account and unlock access to millions of books.'}
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className={`form-section ${isLogin ? 'form-left' : 'form-right'}`}>
                    <div className="form-content">
                        <div className="form-header">
                            <Sparkles size={24} className="form-icon" />
                            <h1>{isLogin ? 'Sign In' : 'Create Account'}</h1>
                            <p>{isLogin ? 'Enter your credentials to access your account' : 'Fill in your details to get started'}</p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="username">
                                        <User size={18} />
                                        <span>Username</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        required={!isLogin}
                                        autoComplete="username"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">
                                    <Mail size={18} />
                                    <span>Email Address</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    <Lock size={18} />
                                    <span>Password</span>
                                </label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <span className="loader"></span>
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="form-footer">
                            <p>
                                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                                <button onClick={handleModeSwitch} className="switch-btn">
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-8);
                    font-family: var(--font-main);
                    position: relative;
                    overflow: hidden;
                }

                /* Background */
                .login-bg {
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(135deg, #050816 0%, #0f0a2e 50%, #1a0f3d 100%);
                    z-index: -1;
                }

                .bg-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.3;
                }

                .orb-1 {
                    width: 700px;
                    height: 700px;
                    background: radial-gradient(circle, #6366f1 0%, #4f46e5 30%, transparent 70%);
                    top: -15%;
                    right: -15%;
                    animation: float 8s ease-in-out infinite;
                    opacity: 0.25;
                }

                .orb-2 {
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, #8b5cf6 0%, #7c3aed 30%, transparent 70%);
                    bottom: -15%;
                    left: -15%;
                    animation: float 10s ease-in-out infinite reverse;
                    opacity: 0.25;
                }

                .orb-3 {
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, #ec4899 0%, #db2777 30%, transparent 70%);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation: pulse 6s ease-in-out infinite;
                    opacity: 0.2;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, 30px); }
                }

                /* Navigation */
                .login-nav {
                    position: absolute;
                    top: var(--space-8);
                    left: var(--space-8);
                    z-index: 10;
                }

                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    color: white;
                    font-size: var(--text-xl);
                    font-weight: 800;
                    transition: transform var(--duration-normal) var(--ease-premium);
                }

                .nav-logo:hover {
                    transform: scale(1.05);
                }

                /* Main Container */
                .login-container {
                    position: relative;
                    width: 100%;
                    max-width: 1100px;
                    height: 650px;
                    border-radius: 80px;
                    overflow: hidden;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), 
                                0 0 0 1px rgba(255, 255, 255, 0.03) inset;
                    transform: translateZ(0);
                    will-change: transform;
                }

                .container-bg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, 
                        rgba(15, 23, 42, 0.98) 0%, 
                        rgba(30, 41, 59, 0.95) 100%);
                    z-index: 0;
                }

                /* Sliding Panel */
                .slide-panel {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 51%;
                    height: 100%;
                    background: linear-gradient(135deg, 
                        #6366f1 0%, 
                        #7c3aed 40%,
                        #a855f7 70%, 
                        #ec4899 100%);
                    transform: translateX(100%);
                    z-index: 1;
                    box-shadow: -20px 0 60px rgba(99, 102, 241, 0.5),
                                0 0 0 1px rgba(255, 255, 255, 0.15) inset;
                    will-change: transform;
                }

                .panel-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: var(--space-16);
                    color: white;
                    text-align: center;
                }

                .panel-icon {
                    width: 120px;
                    height: 120px;
                    border-radius: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: var(--space-6);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
                                0 0 0 1px rgba(255, 255, 255, 0.2) inset;
                }

                .panel-content h2 {
                    font-size: var(--text-4xl);
                    font-weight: 900;
                    margin-bottom: var(--space-4);
                    font-family: var(--font-heading);
                }

                .panel-content p {
                    font-size: var(--text-lg);
                    opacity: 0.9;
                    margin-bottom: var(--space-8);
                    max-width: 400px;
                    line-height: 1.6;
                }

                .panel-features {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                    width: 100%;
                    max-width: 300px;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-3);
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: var(--radius-md);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    font-size: var(--text-sm);
                    font-weight: 600;
                    transition: all var(--duration-normal) var(--ease-premium);
                }

                .feature-item:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateX(5px);
                }

                /* Form Section */
                .form-section {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 51%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    transition: transform 1s cubic-bezier(0.19, 1, 0.22, 1),
                                border-radius 1s cubic-bezier(0.19, 1, 0.22, 1);
                    will-change: transform, border-radius;
                }

                .form-section.form-left {
                    transform: translateX(0);
                    border-radius: 0;
                }

                .form-section.form-right {
                    transform: translateX(100%);
                    border-radius: 0;
                }

                .form-content {
                    width: 100%;
                    max-width: 450px;
                    padding: var(--space-8);
                }

                .form-header {
                    text-align: center;
                    margin-bottom: var(--space-8);
                }

                .form-icon {
                    color: var(--primary);
                    margin-bottom: var(--space-4);
                }

                .form-header h1 {
                    font-size: var(--text-4xl);
                    font-weight: 900;
                    color: #f1f5f9;
                    margin-bottom: var(--space-2);
                    font-family: var(--font-heading);
                }

                .form-header p {
                    color: #94a3b8;
                    font-size: var(--text-sm);
                }

                /* Error Message */
                .error-message {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-4);
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: var(--radius-md);
                    color: #fca5a5;
                    font-size: var(--text-sm);
                    margin-bottom: var(--space-6);
                }

                /* Form */
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-5);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: #cbd5e1;
                    font-size: var(--text-sm);
                    font-weight: 600;
                }

                .form-group input {
                    padding: var(--space-4);
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    color: #f1f5f9;
                    font-size: var(--text-base);
                    transition: all var(--duration-normal) var(--ease-premium);
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #6366f1;
                    background: rgba(15, 23, 42, 0.8);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15),
                                0 0 20px rgba(99, 102, 241, 0.2);
                }

                .password-wrapper {
                    position: relative;
                    width: 100%;
                }

                .password-wrapper input {
                    width: 100%;
                    padding-right: 48px;
                }

                .password-toggle {
                    position: absolute;
                    right: var(--space-3);
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-tertiary-dark);
                    cursor: pointer;
                    padding: var(--space-2);
                    transition: color var(--duration-normal) var(--ease-premium);
                }

                .password-toggle:hover {
                    color: var(--primary);
                }

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: var(--text-sm);
                    color: #94a3b8;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: #cbd5e1;
                    cursor: pointer;
                }

                .checkbox-label input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .forgot-link {
                    color: var(--primary);
                    font-weight: 600;
                    transition: color var(--duration-normal) var(--ease-premium);
                }

                .forgot-link:hover {
                    color: var(--primary-light);
                }

                .submit-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-3);
                    padding: var(--space-4);
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-size: var(--text-lg);
                    font-weight: 700;
                    cursor: pointer;
                    transition: all var(--duration-normal) var(--ease-premium);
                    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4),
                                0 0 0 1px rgba(255, 255, 255, 0.1) inset;
                    margin-top: var(--space-4);
                    position: relative;
                    overflow: hidden;
                }

                .submit-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        transparent, 
                        rgba(255, 255, 255, 0.2), 
                        transparent);
                    transition: left 0.5s;
                }

                .submit-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6),
                                0 0 40px rgba(139, 92, 246, 0.3);
                }

                .submit-btn:hover::before {
                    left: 100%;
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .loader {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .form-footer {
                    text-align: center;
                    margin-top: var(--space-6);
                    padding-top: var(--space-6);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .form-footer p {
                    color: var(--text-secondary-dark);
                    font-size: var(--text-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-2);
                }

                .switch-btn {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-weight: 700;
                    cursor: pointer;
                    transition: color var(--duration-normal) var(--ease-premium);
                    font-size: var(--text-sm);
                }

                .switch-btn:hover {
                    color: var(--primary-light);
                }

                /* Responsive */
                @media (max-width: 900px) {
                    .login-page {
                        padding: 16px;
                    }

                    .login-container {
                        max-width: 100%;
                        height: auto;
                        min-height: 500px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }

                    .slide-panel {
                        display: none; /* Hide decorative panel on mobile */
                    }

                    .form-section {
                        position: relative;
                        width: 100%;
                        transform: none !important; /* Reset any GSAP transform */
                        left: auto;
                        height: auto;
                        padding: 20px;
                    }
                    
                    .form-section.form-left, 
                    .form-section.form-right {
                        transform: none !important;
                    }

                    .form-content {
                        max-width: 100%;
                        padding: 0;
                    }

                    .nav-logo {
                        font-size: 1.5rem;
                    }
                    
                    .orb-1, .orb-2, .orb-3 {
                        opacity: 0.15; /* Dim orbs slightly on mobile */
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
