import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    ArrowRight,
    Compass,
    Zap,
    Shield,
    Globe,
    Github,
    Library,
    Star,
    Users,
    TrendingUp,
    Activity,
    CheckCircle,
    Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import { fadeInUp, parallaxScroll } from '../utils/animations';

const LandingPage = () => {
    const [stats, setStats] = useState({ books: 0, users: 0, downloads: 0 });
    const heroRef = useRef(null);

    useEffect(() => {
        // Entrance animations
        fadeInUp('.landing-reveal', { stagger: 0.15 });

        // Floating orbs animation
        gsap.to('.v02-orb', {
            y: 50,
            x: 30,
            duration: 5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        // Stats counter animation
        gsap.to(stats, {
            books: 50000,
            users: 12500,
            downloads: 250000,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: function () {
                setStats({
                    books: Math.round(this.targets()[0].books),
                    users: Math.round(this.targets()[0].users),
                    downloads: Math.round(this.targets()[0].downloads)
                });
            }
        });

        // Parallax effect on scroll
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            if (heroRef.current) {
                gsap.to(heroRef.current, {
                    y: scrolled * 0.5,
                    duration: 0.3,
                    ease: 'power1.out'
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const formatNumber = (num) => {
        return num.toLocaleString();
    };

    return (
        <div className="landing-page-premium">
            {/* Gradient Mesh Background */}
            <div className="mesh-background">
                <div className="mesh-orb orb-1"></div>
                <div className="mesh-orb orb-2"></div>
                <div className="mesh-orb orb-3"></div>
            </div>

            {/* Navigation */}
            <nav className="premium-nav landing-reveal">
                <div className="nav-container">
                    <div className="nav-logo">
                        <Library size={36} className="logo-icon" />
                        <span className="logo-text">
                            eLibrary
                            <span className="logo-version">v02</span>
                        </span>
                    </div>
                    <div className="nav-links">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#stats" className="nav-link">Statistics</a>
                        <a href="#about" className="nav-link">About</a>
                        <Link to="/login" className="nav-cta">
                            <span>Portal Access</span>
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section" ref={heroRef}>
                <div className="hero-container">
                    <div className="hero-badge landing-reveal">
                        <Sparkles size={14} />
                        <span>NEXT-GENERATION KNOWLEDGE PROTOCOL</span>
                    </div>

                    <h1 className="hero-title landing-reveal">
                        Beyond the <span className="gradient-text">Physical</span> Shelf
                    </h1>

                    <p className="hero-description landing-reveal">
                        Experience the world's most sophisticated digital library platform.
                        Access millions of titles with zero latency, synchronized across all
                        your devices, anywhere in the world.
                    </p>

                    <div className="hero-actions landing-reveal">
                        <Link to="/login" className="btn-primary hero-btn">
                            <Zap size={20} />
                            <span>Initialize Portal</span>
                        </Link>
                        <a
                            href="https://github.com/gollapally-supreeth/eLibrary"
                            className="btn-secondary hero-btn"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Github size={20} />
                            <span>View Source</span>
                        </a>
                    </div>

                    {/* Live Stats */}
                    <div className="hero-stats landing-reveal">
                        <div className="stat-item">
                            <BookOpen size={24} className="stat-icon" />
                            <div className="stat-content">
                                <div className="stat-number">{formatNumber(stats.books)}+</div>
                                <div className="stat-label">Digital Archives</div>
                            </div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <Users size={24} className="stat-icon" />
                            <div className="stat-content">
                                <div className="stat-number">{formatNumber(stats.users)}+</div>
                                <div className="stat-label">Active Users</div>
                            </div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <TrendingUp size={24} className="stat-icon" />
                            <div className="stat-content">
                                <div className="stat-number">{formatNumber(stats.downloads)}+</div>
                                <div className="stat-label">Downloads Today</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="features-section">
                <div className="section-header landing-reveal">
                    <h2 className="section-title">Powered by Innovation</h2>
                    <p className="section-subtitle">
                        Advanced features designed for the modern reader
                    </p>
                </div>

                <div className="features-grid">
                    {[
                        {
                            icon: <Compass size={32} />,
                            title: 'Quantum Search',
                            description: 'AI-powered search engine scans millions of nodes in milliseconds with semantic understanding.',
                            color: 'blue'
                        },
                        {
                            icon: <Globe size={32} />,
                            title: 'Global Sync',
                            description: 'Your library follows you. Seamless synchronization across all your devices in real-time.',
                            color: 'indigo'
                        },
                        {
                            icon: <Shield size={32} />,
                            title: 'Secure Vault',
                            description: 'Military-grade encryption protects your reading habits and personal collections.',
                            color: 'violet'
                        },
                        {
                            icon: <Activity size={32} />,
                            title: 'Real-time Analytics',
                            description: 'Track your reading progress with beautiful visualizations and insights.',
                            color: 'rose'
                        },
                        {
                            icon: <Star size={32} />,
                            title: 'Smart Recommendations',
                            description: 'Machine learning algorithms suggest books tailored to your unique taste.',
                            color: 'emerald'
                        },
                        {
                            icon: <Zap size={32} />,
                            title: 'Lightning Fast',
                            description: 'Optimized infrastructure ensures instant access to your entire library.',
                            color: 'amber'
                        }
                    ].map((feature, index) => (
                        <div key={index} className={`feature-card landing-reveal feature-${feature.color}`}>
                            <div className="feature-icon-wrapper">
                                <div className="feature-icon">{feature.icon}</div>
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <div className="feature-shine"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section landing-reveal">
                <div className="cta-container">
                    <h2 className="cta-title">Ready to Start Your Journey?</h2>
                    <p className="cta-description">
                        Join thousands of readers who have already discovered the future of digital libraries.
                    </p>
                    <Link to="/login" className="btn-primary cta-button">
                        <Sparkles size={20} />
                        <span>Get Started Free</span>
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-logo">
                        <Library size={28} />
                        <span>eLibrary</span>
                    </div>
                    <div className="footer-links">
                        <a href="#features">Features</a>
                        <a href="#about">About</a>
                        <a href="https://github.com/gollapally-supreeth/eLibrary" target="_blank" rel="noreferrer">
                            GitHub
                        </a>
                    </div>
                    <div className="footer-copyright">
                        © 2026 eLibrary Global Network • Status: <span className="status-dot"></span> Operational
                    </div>
                </div>
            </footer>

            {/* Styles */}
            <style>{`
                .landing-page-premium {
                    min-height: 100vh;
                    background: #020617;
                    color: #ffffff;
                    font-family: var(--font-main);
                    position: relative;
                    overflow-x: hidden;
                    isolation: isolate;
                }

                /* Mesh Background */
                .mesh-background {
                    position: fixed;
                    inset: 0;
                    z-index: -1;
                    pointer-events: none;
                }

                .mesh-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(180px);
                    opacity: 0.15;
                }

                .orb-1 {
                    width: 800px;
                    height: 800px;
                    background: radial-gradient(circle, #6366f1, transparent 70%);
                    top: -20%;
                    right: -15%;
                }

                .orb-2 {
                    width: 700px;
                    height: 700px;
                    background: radial-gradient(circle, #f43f5e, transparent 70%);
                    bottom: -25%;
                    left: -10%;
                }

                .orb-3 {
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, #8b5cf6, transparent 70%);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                /* Navigation */
                .premium-nav {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: var(--z-sticky);
                    background: rgba(2, 6, 23, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .nav-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: var(--space-6) var(--space-8);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    font-family: var(--font-heading);
                }

                .logo-icon {
                    color: var(--primary-light);
                }

                .logo-text {
                    font-size: var(--text-2xl);
                    font-weight: 900;
                    letter-spacing: -1px;
                }

                .logo-version {
                    font-size: var(--text-sm);
                    color: var(--primary-light);
                    margin-left: var(--space-2);
                    font-weight: 500;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: var(--space-8);
                }

                .nav-link {
                    color: var(--text-secondary-dark);
                    font-weight: 600;
                    font-size: var(--text-sm);
                    transition: color var(--duration-normal) var(--ease-premium);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .nav-link:hover {
                    color: var(--primary-light);
                }

                .nav-cta {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-3) var(--space-6);
                    background: var(--primary);
                    color: white;
                    border-radius: var(--radius-full);
                    font-weight: 700;
                    font-size: var(--text-sm);
                    transition: all var(--duration-normal) var(--ease-premium);
                    box-shadow: 0 4px 12px var(--primary-glow);
                }

                .nav-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px var(--primary-glow);
                }

                /* Hero Section */
                .hero-section {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    padding:var(--space-20) var(--space-8);
                    position: relative;
                }

                .hero-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    text-align: center;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-2) var(--space-5);
                    background: rgba(99, 102, 241, 0.1);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: var(--radius-full);
                    color: var(--primary-light);
                    font-size: var(--text-xs);
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    margin-bottom: var(--space-8);
                }

                .hero-title {
                    font-size: clamp(3rem, 8vw, 7rem);
                    font-weight: 900;
                    letter-spacing: -0.05em;
                    line-height: 1;
                    margin-bottom: var(--space-6);
                    font-family: var(--font-heading);
                }

                .gradient-text {
                    background: linear-gradient(135deg, #6366f1, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-description {
                    font-size: var(--text-xl);
                    color: var(--text-secondary-dark);
                    line-height: 1.7;
                    margin-bottom: var(--space-10);
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .hero-actions {
                    display: flex;
                    gap: var(--space-4);
                    justify-content: center;
                    margin-bottom: var(--space-16);
                }

                .hero-btn {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-5) var(--space-8);
                    border-radius: var(--radius-xl);
                    font-weight: 700;
                    font-size: var(--text-lg);
                    transition: all var(--duration-normal) var(--ease-premium);
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 10px 30px var(--primary-glow);
                }

                .btn-primary:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 40px var(--primary-glow);
                }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-4px);
                }

                /* Hero Stats */
                .hero-stats {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: var(--space-8);
                    padding: var(--space-8);
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-2xl);
                    backdrop-filter: blur(10px);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }

                .stat-icon {
                    color: var(--primary-light);
                }

                .stat-content {
                    text-align: left;
                }

                .stat-number {
                    font-size: var(--text-2xl);
                    font-weight: 800;
                    font-family: var(--font-heading);
                    color: white;
                }

                .stat-label {
                    font-size: var(--text-sm);
                    color: var(--text-tertiary-dark);
                }

                .stat-divider {
                    width: 1px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.1);
                }

                /* Features Section */
                .features-section {
                    padding: var(--space-20) var(--space-8);
                    position: relative;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: var(--space-16);
                }

                .section-title {
                    font-size: var(--text-5xl);
                    font-weight: 900;
                    margin-bottom: var(--space-4);
                    font-family: var(--font-heading);
                }

                .section-subtitle {
                    font-size: var(--text-xl);
                    color: var(--text-secondary-dark);
                }

                .features-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: var(--space-8);
                }

                .feature-card {
                    position: relative;
                    padding: var(--space-10);
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-2xl);
                    backdrop-filter: blur(10px);
                    transition: all var(--duration-slow) var(--ease-premium);
                    overflow: hidden;
                }

                .feature-card:hover {
                    transform: translateY(-10px);
                    border-color: var(--primary);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }

                .feature-icon-wrapper {
                    width: 80px;
                    height: 80px;
                    border-radius: var(--radius-xl);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: var(--space-6);
                    transition: transform var(--duration-normal) var(--ease-premium);
                }

                .feature-card:hover .feature-icon-wrapper {
                    transform: scale(1.1) rotate(5deg);
                }

                .feature-blue .feature-icon-wrapper { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .feature-indigo .feature-icon-wrapper { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
                .feature-violet .feature-icon-wrapper { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .feature-rose .feature-icon-wrapper { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
                .feature-emerald .feature-icon-wrapper { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .feature-amber .feature-icon-wrapper { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

                .feature-title {
                    font-size: var(--text-2xl);
                    font-weight: 700;
                    margin-bottom: var(--space-3);
                    font-family: var(--font-heading);
                }

                .feature-description {
                    color: var(--text-secondary-dark);
                    line-height: 1.7;
                }

                .feature-shine {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    transition: left var(--duration-slow) var(--ease-premium);
                }

                .feature-card:hover .feature-shine {
                    left: 100%;
                }

                /* CTA Section */
                .cta-section {
                    padding: var(--space-20) var(--space-8);
                    text-align: center;
                }

                .cta-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: var(--space-20) var(--space-10);
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: var(--radius-2xl);
                    backdrop-filter: blur(10px);
                }

                .cta-title {
                    font-size: var(--text-5xl);
                    font-weight: 900;
                    margin-bottom: var(--space-4);
                    font-family: var(--font-heading);
                }

                .cta-description {
                    font-size: var(--text-xl);
                    color: var(--text-secondary-dark);
                    margin-bottom: var(--space-8);
                }

                .cta-button {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-5) var(--space-10);
                    background: var(--primary);
                    color: white;
                    border-radius: var(--radius-xl);
                    font-size: var(--text-xl);
                    font-weight: 700;
                    box-shadow: 0 10px 30px var(--primary-glow);
                    transition: all var(--duration-normal) var(--ease-premium);
                }

                .cta-button:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 40px var(--primary-glow);
                }

                /* Footer */
                .landing-footer {
                    padding: var(--space-12) var(--space-8);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .footer-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: var(--space-6);
                }

                .footer-logo {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    font-size: var(--text-lg);
                    font-weight: 700;
                    color: var(--primary-light);
                }

                .footer-links {
                    display: flex;
                    gap: var(--space-6);
                }

                .footer-links a {
                    color: var(--text-tertiary-dark);
                    font-size: var(--text-sm);
                    transition: color var(--duration-normal) var(--ease-premium);
                }

                .footer-links a:hover {
                    color: var(--primary-light);
                }

                .footer-copyright {
                    color: var(--text-tertiary-dark);
                    font-size: var(--text-sm);
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--success);
                    border-radius: 50%;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                /* Responsive */
                @media (max-width: 900px) {
                    .features-grid {
                        grid-template-columns: 1fr;
                    }

                    .hero-stats {
                        flex-direction: column;
                        gap: var(--space-4);
                    }

                    .stat-divider {
                        display: none;
                    }

                    .hero-actions {
                        flex-direction: column;
                    }

                    .nav-links {
                        gap: var(--space-4);
                    }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
