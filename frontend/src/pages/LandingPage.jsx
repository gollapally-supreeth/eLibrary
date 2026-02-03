import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    MoveRight,
    Search,
    LayoutGrid,
    Heart,
    Library,
    UserCircle,
    SlidersHorizontal,
    BookOpen,
    Github,
    Linkedin
} from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LandingPage = () => {
    const mainRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Reveal Hero
        tl.fromTo('.hero-text-line',
            { y: 100, opacity: 0, rotateX: -20 },
            { y: 0, opacity: 1, rotateX: 0, stagger: 0.1, duration: 1.2, ease: 'power3.out' }
        )
            .fromTo('.hero-sub',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                '-=0.8'
            )
            .fromTo('.hero-cta',
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
                '-=0.6'
            );

        // Background Parallax
        gsap.to('.library-bg-grid', {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // Features Text
        gsap.fromTo('.section-header',
            { y: 50, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.8,
                scrollTrigger: { trigger: '.features-section', start: 'top 85%' }
            }
        );

        // Bento Grid items - Individual Triggers for Robustness
        const items = gsap.utils.toArray('.bento-item');
        items.forEach((item, i) => {
            gsap.fromTo(item,
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8,
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 95%', // Trigger earlier ensuring visibility on all screens
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

    }, { scope: mainRef });

    const handleMouseMove = (e) => {
        const { currentTarget: target } = e;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty("--mouse-x", `${x}px`);
        target.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <div ref={mainRef} className="landing-wrapper">


            {/* Hero */}
            <header className="hero-section">
                {/* Abstract Library Background */}
                <div className="library-bg-container">
                    <div className="library-bg-grid"></div>
                    <div className="vignette-overlay"></div>
                    <div className="glow-orb orb-1"></div>
                    <div className="glow-orb orb-2"></div>
                </div>

                <div className="hero-content">
                    <div className="hero-logo-lockup">
                        <div className="hero-logo-icon">
                            <Library size={32} color="#000" strokeWidth={2.5} />
                        </div>
                        <span className="hero-logo-text">eLibrary</span>
                    </div>

                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        A Library That Lives Online
                    </div>
                    <h1 className="hero-title">
                        <div className="overflow-hidden"><span className="hero-text-line">Redefining the</span></div>
                        <div className="overflow-hidden"><span className="hero-text-line text-gradient">Way You Read.</span></div>
                    </h1>
                    <p className="hero-sub">
                        A sleek and user-friendly digital platform bringing books, learning, and technology together.
                        We place knowledge at your fingertips, making reading more accessible and engaging than ever.
                    </p>
                    <div className="hero-cta">
                        <Link to="/login" className="cta-button">
                            Start Reading Now
                            <div className="cta-shimmer"></div>
                        </Link>
                        <span className="cta-note">Join the Digital Revolution</span>
                    </div>
                </div>
            </header>

            {/* Features (Bento Grid) */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Complete Control.</h2>
                    <p>Six powerful features, one seamless platform.</p>
                </div>

                <div className="bento-grid">
                    {/* Feature 1: Smart Search */}
                    <div className="bento-item bento-large group" onMouseMove={handleMouseMove}>
                        <div className="spotlight-overlay"></div>
                        <div className="bento-content">
                            <div className="icon-box blue">
                                <Search size={24} />
                            </div>
                            <h3>Smart Search & Filtering</h3>
                            <p>Real-time indexed search by title or author with advanced category filtering.</p>
                        </div>
                        <div className="bento-visual visual-search">
                            <div className="search-ui-mock">
                                <div className="mock-input">
                                    <Search size={14} className="text-gray-500" />
                                    <div className="typing-cursor"></div>
                                </div>
                                <div className="mock-tags">
                                    <span className="mock-tag active">All</span>
                                    <span className="mock-tag">Fiction</span>
                                    <span className="mock-tag">Science</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Personalized Dashboard */}
                    <div className="bento-item bento-medium group" onMouseMove={handleMouseMove}>
                        <div className="spotlight-overlay"></div>
                        <div className="bento-content">
                            <div className="icon-box purple">
                                <LayoutGrid size={24} />
                            </div>
                            <h3>Personal Dashboard</h3>
                            <p>Track your reading stats and access quick actions instantly.</p>
                        </div>
                        <div className="bento-visual visual-dashboard">
                            <div className="stat-card-mock">
                                <div className="stat-num count-up">12</div>
                                <div className="stat-label">Books Read</div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Favorites */}
                    <div className="bento-item bento-medium group" onMouseMove={handleMouseMove}>
                        <div className="spotlight-overlay"></div>
                        <div className="bento-content">
                            <div className="icon-box rose">
                                <Heart size={24} />
                            </div>
                            <h3>Curated Favorites</h3>
                            <p>Save books to your personal collection with a single click.</p>
                        </div>
                        <div className="bento-visual visual-favorites">
                            <div className="fav-list-mock">
                                <div className="fav-item"><div className="fav-dot pulse"></div></div>
                                <div className="fav-item"><div className="fav-dot pulse delay-1"></div></div>
                                <div className="fav-item"><div className="fav-dot pulse delay-2"></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 4: Interactive Categories (Wide) */}
                    <div className="bento-item bento-large group" onMouseMove={handleMouseMove}>
                        <div className="spotlight-overlay"></div>
                        <div className="bento-content row-layout">
                            <div className="text-side">
                                <div className="icon-box amber">
                                    <SlidersHorizontal size={24} />
                                </div>
                                <h3>Interactive Categories</h3>
                                <p>Dynamic filtering system allowing you to browse thousands of titles by specific genres and topics effortlessly.</p>
                            </div>
                            <div className="visual-side">
                                <div className="tags-cloud-mock">
                                    <span className="tag-pill float-1">Computer Science</span>
                                    <span className="tag-pill float-2">History</span>
                                    <span className="tag-pill float-3">Philosophy</span>
                                    <span className="tag-pill float-1">Arts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 5: Profile Management */}
                    <div className="bento-item bento-medium group" onMouseMove={handleMouseMove}>
                        <div className="spotlight-overlay"></div>
                        <div className="bento-content">
                            <div className="icon-box green">
                                <UserCircle size={24} />
                            </div>
                            <h3>Profile & Identity</h3>
                            <p>Customize your avatar, manage credentials, and personalize your reading identity.</p>
                        </div>
                        <div className="bento-visual visual-profile">
                            <div className="profile-card-mock">
                                <div className="mock-avatar"></div>
                                <div className="mock-line lg"></div>
                                <div className="mock-line sm"></div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 6: Modern UI/UX */}
                    <div className="bento-item bento-large group" onMouseMove={handleMouseMove}>
                        <div className="spotlight-overlay"></div>
                        <div className="bento-content row-layout">
                            <div className="text-side">
                                <div className="icon-box cyan">
                                    <Library size={24} />
                                </div>
                                <h3>Modern Interface</h3>
                                <p>A clean, glass-morphic aesthetic designed for focus and clarity. Experience a UI that feels as good as it looks.</p>
                            </div>
                            <div className="visual-side">
                                <div className="ui-glass-mock">
                                    <div className="glass-pane active shimmer-effect"></div>
                                    <div className="glass-pane"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-section">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="f-logo">eLibrary</span>
                        <span className="f-copy">© 2026. All rights reserved.</span>
                    </div>
                    <div className="footer-links">
                        <a href="https://github.com/gollapally-supreeth" target="_blank" rel="noopener noreferrer" className="f-link">
                            <Github size={20} />
                        </a>
                        <a href="https://www.linkedin.com/in/gollapally-supreeth" target="_blank" rel="noopener noreferrer" className="f-link">
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </footer>

            <style>{`
                :root {
                    --bg-dark: #020204;
                    --bg-card: rgba(20, 20, 23, 0.6);
                    --border-subtle: rgba(255, 255, 255, 0.08);
                    --text-primary: #ededed;
                    --text-secondary: #9ca3af;
                    --accent: #fff;
                    --primary-glow: rgba(99, 102, 241, 0.15);
                }

                .landing-wrapper {
                    background-color: var(--bg-dark);
                    color: var(--text-primary);
                    min-height: 100vh;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    overflow-x: hidden;
                    selection-background-color: rgba(99, 102, 241, 0.3);
                }

                /* Hero with Advanced BG */
                .hero-section {
                    height: 95vh;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .library-bg-container {
                    position: absolute; inset: 0; z-index: 0;
                    perspective: 1000px;
                    background: radial-gradient(circle at 50% 50%, #0a0a0e 0%, #020204 100%);
                }

                .library-bg-grid {
                    position: absolute; inset: -50%;
                    width: 200%; height: 200%;
                    background-image: 
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 40px 60px;
                    transform: rotateX(60deg) translateY(-10%);
                    mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
                }
                
                .glow-orb {
                    position: absolute; border-radius: 50%;
                    filter: blur(80px); opacity: 0.4;
                    z-index: 1;
                }
                .orb-1 { width: 300px; height: 300px; background: #4f46e5; top: 20%; left: 20%; animation: floatOrb 10s infinite ease-in-out; }
                .orb-2 { width: 400px; height: 400px; background: #7e22ce; bottom: 10%; right: 15%; animation: floatOrb 14s infinite ease-in-out reverse; }
                
                @keyframes floatOrb {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, -40px); }
                }

                .vignette-overlay {
                    position: absolute; inset: 0; z-index: 2;
                    background: radial-gradient(circle at center, transparent 0%, var(--bg-dark) 90%);
                }

                .hero-content { z-index: 10; padding: 0 20px; max-width: 900px; position: relative; display: flex; flex-direction: column; align-items: center; }
                
                .hero-logo-lockup {
                    display: flex; align-items: center; gap: 16px;
                    margin-bottom: 40px;
                    animation: floatLogo 6s ease-in-out infinite;
                }
                @keyframes floatLogo {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .hero-logo-icon {
                    width: 64px; height: 64px;
                    background: #fff; border-radius: 18px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 40px rgba(255,255,255,0.15);
                }
                .hero-logo-text {
                    font-family: 'Outfit', sans-serif;
                    font-size: 2.5rem; font-weight: 700;
                    color: #fff; letter-spacing: -0.02em;
                }

                .hero-badge {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 6px 16px; border-radius: 100px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
                    font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 24px;
                    backdrop-filter: blur(8px);
                }
                .badge-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 12px #10b981; }

                .hero-title {
                    font-family: 'Outfit', sans-serif;
                    font-size: clamp(3.5rem, 8vw, 7.5rem);
                    font-weight: 700;
                    line-height: 0.95;
                    letter-spacing: -0.04em;
                    margin-bottom: 24px;
                }
                .text-gradient {
                    background: linear-gradient(180deg, #fff 0%, #9ca3af 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .hero-sub {
                    font-size: clamp(1.1rem, 2vw, 1.35rem);
                    color: var(--text-secondary);
                    max-width: 600px;
                    margin: 0 auto 40px;
                    line-height: 1.6;
                    font-weight: 300;
                }
                .hero-cta { display: flex; flex-direction: column; align-items: center; gap: 12px; }
                .cta-button {
                    background: #fff; color: #000;
                    padding: 18px 48px; border-radius: 100px;
                    font-weight: 600; font-size: 1.1rem;
                    position: relative; overflow: hidden;
                    box-shadow: 0 0 30px rgba(255,255,255,0.1);
                    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s;
                }
                .cta-button:hover { transform: scale(1.05); box-shadow: 0 0 50px rgba(255,255,255,0.2); }
                .cta-shimmer {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
                    transform: skewX(-20deg) translateX(-150%);
                    transition: transform 1s;
                }
                .cta-button:hover .cta-shimmer { transform: skewX(-20deg) translateX(150%); transition: 0.5s; }
                .cta-note { font-size: 0.75rem; color: #555; text-transform: uppercase; letter-spacing: 1.5px; }

                /* Features - Bento */
                .features-section {
                    max-width: 1200px; margin: 0 auto; padding: 100px 20px;
                }
                .section-header { text-align: center; margin-bottom: 80px; }
                .section-header h2 { font-size: 3rem; letter-spacing: -0.03em; margin-bottom: 12px; font-family: 'Outfit', sans-serif; }
                .section-header p { color: var(--text-secondary); font-size: 1.2rem; }

                .bento-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-template-rows: repeat(3, 280px);
                    gap: 24px;
                }

                .bento-item {
                    background: var(--bg-card);
                    border: 1px solid var(--border-subtle);
                    border-radius: 24px;
                    padding: 32px;
                    position: relative;
                    overflow: hidden;
                    display: flex; flex-direction: column;justify-content: space-between;
                    transition: transform 0.3s;
                }
                /* Spotlight Effect */
                .bento-item::before {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(
                        800px circle at var(--mouse-x) var(--mouse-y),
                        rgba(255, 255, 255, 0.06),
                        transparent 40%
                    );
                    opacity: 0;
                    transition: opacity 0.5s;
                    z-index: 2;
                    pointer-events: none;
                }
                .bento-item:hover::before { opacity: 1; }
                .bento-item::after {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(
                        600px circle at var(--mouse-x) var(--mouse-y),
                        rgba(255, 255, 255, 0.4),
                        transparent 40%
                    );
                    opacity: 0;
                    z-index: 1;
                    pointer-events: none;
                }
                
                /* Grid Spans */
                .bento-large { grid-column: span 2; }
                .bento-medium { grid-column: span 1; }
                
                .bento-content { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; }
                .bento-content h3 { font-size: 1.4rem; margin: 16px 0 8px; font-weight: 500; color: #fff; }
                .bento-content p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; }
                
                .icon-box {
                    width: 48px; height: 48px; border-radius: 14px; 
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                }
                .blue { color: #60a5fa; box-shadow: 0 0 20px rgba(96, 165, 250, 0.15); }
                .purple { color: #a78bfa; box-shadow: 0 0 20px rgba(167, 139, 250, 0.15); }
                .rose { color: #fb7185; box-shadow: 0 0 20px rgba(251, 113, 133, 0.15); }
                .amber { color: #fbbf24; box-shadow: 0 0 20px rgba(251, 191, 36, 0.15); }
                .green { color: #34d399; box-shadow: 0 0 20px rgba(52, 211, 153, 0.15); }
                .cyan { color: #06b6d4; box-shadow: 0 0 20px rgba(6, 182, 212, 0.15); }

                /* Feature Visuals & Animations */
                .bento-visual { 
                    position: absolute; bottom: 0; right: 0; left: 0;
                    padding: 24px; pointer-events: none; opacity: 0.9;
                }
                
                /* Smart Search UI */
                .visual-search { text-align: right; bottom: 10px; right: 10px; }
                .search-ui-mock { 
                    background: #151518; border: 1px solid #333; border-radius: 12px; 
                    padding: 12px; width: 60%; margin-left: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .mock-input { 
                    display: flex; align-items: center; gap: 8px; 
                    padding-bottom: 12px; border-bottom: 1px solid #222; margin-bottom: 8px;
                }
                .typing-cursor {
                    width: 2px; height: 14px; background: #60a5fa;
                    animation: blink 1s infinite;
                }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

                .mock-tags { display: flex; gap: 6px; }
                .mock-tag { font-size: 0.6rem; padding: 4px 8px; background: #222; border-radius: 4px; color: #666; transition: 0.3s; }
                .mock-tag.active { background: #333; color: #fff; }
                .bento-item:hover .mock-tag { transform: translateY(-2px); }

                /* Dashboard Stats */
                .visual-dashboard { display: flex; align-items: flex-end; justify-content: flex-end; padding-bottom: 30px; }
                .stat-card-mock { 
                    background: #151518; border: 1px solid #333; border-radius: 16px; padding: 16px 24px;
                    text-align: center;
                }
                .stat-num { font-size: 2rem; font-weight: 700; color: #fff; }
               
                /* Favorites List */
                .visual-favorites { display: flex; justify-content: center; padding-bottom: 30px; }
                .fav-list-mock { display: flex; flex-direction: column; gap: 8px; width: 100%; align-items: center; }
                .fav-item { 
                    width: 80%; height: 10px; background: #151518; border-radius: 6px; 
                    display: flex; align-items: center; padding: 0 8px;
                }
                .fav-dot { width: 4px; height: 4px; background: #333; border-radius: 50%; transition: 0.3s; }
                .bento-item:hover .fav-dot.pulse { background: #fb7185; box-shadow: 0 0 8px #fb7185; }
                .delay-1 { transition-delay: 0.1s; }
                .delay-2 { transition-delay: 0.2s; }

                /* Profile Identity */
                .visual-profile { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 40px; }
                .profile-card-mock { 
                    width: 140px; height: 180px; background: #151518; border: 1px solid #333; border-radius: 20px;
                    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
                    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .bento-item:hover .profile-card-mock { transform: translateY(-10px) rotate(2deg); }
                .mock-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #333, #444); }
                .mock-line { height: 6px; background: #333; border-radius: 4px; }
                .mock-line.lg { width: 80px; }
                .mock-line.sm { width: 50px; }

                /* Wide Categories & UI */
                .bento-large .row-layout { flex-direction: row; align-items: center; justify-content: space-between; }
                .bento-large .text-side { max-width: 50%; }
                .visual-side { width: 45%; }
                .tags-cloud-mock { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
                .tag-pill { 
                    padding: 6px 12px; font-size: 0.75rem; background: #151518; color: #888; 
                    border: 1px solid #333; border-radius: 100px; 
                    transition: 0.4s;
                }
                .bento-item:hover .tag-pill.float-1 { transform: translateY(-8px); }
                .bento-item:hover .tag-pill.float-2 { transform: translateY(-4px); transition-delay: 0.1s; }
                .bento-item:hover .tag-pill.float-3 { transform: translateY(-6px); transition-delay: 0.05s; }

                /* UI Glass Mock */
                .ui-glass-mock { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; }
                .glass-pane {
                    width: 100%; height: 60px;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    backdrop-filter: blur(4px);
                    position: relative; overflow: hidden;
                }
                .glass-pane.active { background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent); border-color: rgba(255,255,255,0.15); width: 85%; }
                .bento-item:hover .glass-pane.shimmer-effect::after {
                    content: ""; position: absolute; top:0; left:0; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transform: skewX(-20deg) translateX(-150%);
                    animation: glassShimmer 1.5s infinite;
                }
                @keyframes glassShimmer { 0% { transform: skewX(-20deg) translateX(-150%); } 100% { transform: skewX(-20deg) translateX(150%); } }

                /* Footer */
                .footer-section {
                    border-top: 1px solid #1f1f22;
                    padding: 40px 0;
                    margin-top: 50px;
                    background: #020203;
                }
                .footer-content {
                    max-width: 1200px; margin: 0 auto; padding: 0 20px;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .footer-brand { display: flex; gap: 20px; color: #444; font-size: 0.85rem; }
                .f-logo { color: #fff; font-weight: 600; }
                
                .footer-links { display: flex; gap: 30px; }
                .f-link { color: #444; font-size: 0.85rem; transition: color 0.2s; text-decoration: none; }
                .f-link:hover { color: #fff; }

                /* Responsiveness */
                @media (max-width: 1024px) {
                    .bento-grid { 
                        grid-template-columns: repeat(2, 1fr); 
                        grid-template-rows: auto;
                    }
                    .bento-large { grid-column: span 2; }
                    /* Reset others */
                    .bento-medium { grid-column: span 1; }
                    .bento-visual { position: relative; padding: 20px 0 0 0; }
                    .visual-profile { flex-direction: row; justify-content: center; }
                    .profile-card-mock { width: 100%; height: 100px; flex-direction: row; }
                }

                @media (max-width: 768px) {
                    .hero-title { font-size: 4rem; }
                    .bento-grid { grid-template-columns: 1fr; }
                    .bento-large, .bento-medium { grid-column: span 1; }
                    .bento-large .row-layout { flex-direction: column; text-align: left; align-items: flex-start; }
                    .bento-large .text-side { max-width: 100%; margin-bottom: 20px; }
                    .visual-side { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
