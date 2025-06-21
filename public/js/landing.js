// landing.js - Complete Redesign

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggleButton = document.getElementById('theme-toggle');
    const mainHeader = document.querySelector('.main-header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    // --- THEME TOGGLE ---
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
        // Icon state is handled by CSS based on body class
    } else {
        body.classList.add('light-theme'); // Default theme
    }

    themeToggleButton.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light-theme');
        }
    });

    // --- HEADER SCROLL ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    // --- MOBILE NAVIGATION ---
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.classList.toggle('no-scroll-mobile'); 
        });

        document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    hamburgerMenu.classList.remove('active');
                    navLinks.classList.remove('active');
                    body.classList.remove('no-scroll-mobile');
                }
            });
        });
    }
    
    // --- SMOOTH SCROLL FOR NAV LINKS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            try {
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (error) {
                // Fallback for browsers that don't support smooth scroll or if querySelector fails
                // For example, if href is just "#"
                if (targetId === '#') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                console.warn("Smooth scroll target not found or error:", targetId, error);
            }
        });
    });


    // --- GSAP ANIMATIONS ---
    // Ensure GSAP and ScrollTrigger are loaded
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.defaults({ ease: 'power3.out', duration: 0.8 });

        // Initial state reset for elements animated by GSAP
        gsap.set('.hero-badge, .hero-title, .hero-subtitle, .hero-cta-container', {opacity: 0, y: 30});
        gsap.set('.hero-stats .stat-item', {opacity: 0, y: 20});
        gsap.set('.feature-card', {opacity: 0, y: 50, scale: 0.95});
        gsap.set('.developer-card', {opacity: 0, y: 40, scale: 0.95});

        const finalCtaSectionElements = document.querySelectorAll('.final-cta-section .section-title, .final-cta-section .section-subtitle, .final-cta-section .cta-button');
        if (finalCtaSectionElements.length > 0) {
            gsap.set(finalCtaSectionElements, {opacity: 0, y: 40});
        }


        // Hero Section Animation - Enhanced
        const heroTl = gsap.timeline({ delay: 0.3 });
        heroTl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 })
              .to('.hero-title', { opacity: 1, y: 0, duration: 1 }, "-=0.5")
              .to('.hero-subtitle', { opacity: 1, y: 0 }, "-=0.7")
              .to('.hero-cta-container', { opacity: 1, y: 0 }, "-=0.6")
              .to('.hero-stats .stat-item', { opacity: 1, y: 0, stagger: 0.1 }, "-=0.4")
              .fromTo('.shape', 
                { scale: 0, opacity: 0 }, 
                { scale: 1, opacity: 0.1, stagger: 0.2, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, 
                "-=0.8")
              .fromTo('.particle',
                { opacity: 0, scale: 0 },
                { opacity: 0.6, scale: 1, stagger: 0.1, duration: 0.8 },
                "-=0.6");

        // Background Shapes Enhanced Movement
        gsap.utils.toArray('.shape').forEach((shape, i) => {
            gsap.to(shape, {
                x: `random(${-30 - i*5}, ${30 + i*5})`,
                y: `random(${-30 - i*5}, ${30 + i*5})`,
                rotation: `random(${-15 - i*2}, ${15 + i*2})`,
                repeat: -1,
                yoyo: true,
                duration: 10 + i * 2,
                ease: "sine.inOut"
            });
        });

        // Features Section - Enhanced Card Animation
        gsap.utils.toArray('.feature-card').forEach((card, index) => {
            gsap.to(card, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.8,
                delay: index * 0.15,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none none",
                    once: true,
                }
            });

            // Animate feature arrows on scroll
            gsap.to(card.querySelector('.feature-arrow'), {
                opacity: 1,
                x: 0,
                delay: 0.3,
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    toggleActions: "play none none none",
                    once: true,
                }
            });
        });

        // Developer Vision Cards - Enhanced Animation
        gsap.utils.toArray('.developer-card').forEach((card, index) => {
            gsap.to(card, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.8,
                delay: index * 0.2,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none none",
                    once: true,
                }
            });
        });

        // Final CTA Section Animation
        const ctaSection = document.querySelector('.final-cta-section');
        if (ctaSection) {
            const elementsToAnimate = [
                ctaSection.querySelector('.section-title'), 
                ctaSection.querySelector('.section-subtitle'), 
                ctaSection.querySelector('.cta-button')
            ].filter(el => el !== null); // Filter out null elements if any selector fails

            if (elementsToAnimate.length > 0) {
                gsap.to(elementsToAnimate, {
                    opacity: 1, y: 0, stagger: 0.2,
                    scrollTrigger: {
                        trigger: ctaSection,
                        start: "top 85%",
                        toggleActions: "play none none none",
                        once: true,
                    }
                });
            }
        }
    } else {
        console.warn("GSAP or ScrollTrigger not loaded. Animations will not run.");
    }
});
