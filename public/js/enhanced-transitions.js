/**
 * eLibrary Enhanced Transitions and Animations
 * Advanced user experience features for the modern portal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the splash screen
    initSplashScreen();
    
    // Initialize enhanced animations
    if (window.gsap) {
        initEnhancedAnimations();
    }
    
    // Set up custom scrolling
    initSmoothScroll();
});

/**
 * Splash Screen Animation
 */
function initSplashScreen() {
    // Create splash screen element
    const splash = document.createElement('div');
    splash.className = 'splash-screen';
    splash.innerHTML = `
        <div class="splash-container">
            <div class="splash-logo">
                <i class="fas fa-book-reader"></i>
                <span>eLibrary</span>
            </div>
            <div class="splash-loader">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(splash);
    
    // Hide splash after content loads
    setTimeout(() => {
        if (window.gsap) {
            gsap.to(splash, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    splash.remove();
                    animatePageIn();
                }
            });
        } else {
            splash.style.opacity = 0;
            setTimeout(() => {
                splash.remove();
            }, 500);
        }
    }, 1200);
}

/**
 * Smooth scrolling implementation
 */
function initSmoothScroll() {
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement && !targetElement.classList.contains('section')) {
                e.preventDefault();
                
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}

/**
 * Enhanced animations with GSAP
 */
function initEnhancedAnimations() {
    // Initialize GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    
    // Add animation for book cards
    animateBookCards();
    
    // Add animation for stat cards
    animateStatCards();
    
    // Enhanced page transitions
    setupPageTransitions();
}

/**
 * Initial page load animation
 */
function animatePageIn() {
    if (!window.gsap) return;
    
    // Animate header elements
    gsap.from('.top-nav', {
        y: -50,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
    });
    
    // Animate sidebar
    gsap.from('.sidebar', {
        x: -50,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: 'power3.out'
    });
    
    // Animate active section content
    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
        gsap.from(activeSection.children, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.3,
            stagger: 0.1,
            ease: 'power3.out'
        });
    }
}

/**
 * Animate book cards on scroll
 */
function animateBookCards() {
    // Animate book cards on scroll
    document.querySelectorAll('.book-grid').forEach(grid => {
        const cards = grid.querySelectorAll('.book-card');
        if (cards.length > 0) {
            gsap.fromTo(
                cards,
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'back.out(1.2)',
                    scrollTrigger: {
                        trigger: grid,
                        start: 'top bottom-=100px',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    });
}

/**
 * Animate stat cards
 */
function animateStatCards() {
    const statCards = document.querySelectorAll('.stats-card');
    if (statCards.length > 0) {
        gsap.fromTo(
            statCards,
            { opacity: 0, y: 20, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.2)',
                scrollTrigger: {
                    trigger: statCards[0].parentElement,
                    start: 'top bottom-=50px',
                    toggleActions: 'play none none none'
                }
            }
        );
        
        // Animate the stat values counting up
        statCards.forEach(card => {
            const valueEl = card.querySelector('.stats-value');
            if (valueEl) {
                const endValue = parseInt(valueEl.textContent);
                if (!isNaN(endValue)) {
                    gsap.fromTo(
                        valueEl,
                        { textContent: 0 },
                        {
                            textContent: endValue,
                            duration: 1.5,
                            delay: 0.5,
                            ease: 'power2.out',
                            snap: { textContent: 1 },
                            scrollTrigger: {
                                trigger: card,
                                start: 'top bottom-=100px',
                                toggleActions: 'play none none none'
                            }
                        }
                    );
                }
            }
        });
    }
}

/**
 * Set up enhanced page transitions
 */
function setupPageTransitions() {
    // Listen for navigation events
    document.addEventListener('sectionChange', function(e) {
        const targetId = e.detail.targetId;
        transitionToSection(targetId);
    });
}

/**
 * Transition between sections with animation
 * @param {string} targetId - The ID of the section to transition to
 */
function transitionToSection(targetId) {
    const currentSection = document.querySelector('.section.active');
    const targetSection = document.getElementById(targetId);
    
    if (!targetSection || !currentSection) return;
    
    // Fade out current section
    gsap.to(currentSection, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            // Hide current section
            currentSection.classList.remove('active');
            
            // Show target section
            targetSection.classList.add('active');
            
            // Fade in target section
            gsap.fromTo(
                targetSection,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out',
                    onComplete: () => {
                        // Animate section content
                        gsap.fromTo(
                            targetSection.children,
                            { opacity: 0, y: 20 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.4,
                                stagger: 0.05,
                                ease: 'power2.out'
                            }
                        );
                    }
                }
            );
        }
    });
}

/**
 * Add pulse effect to a button
 * @param {HTMLElement} button - The button element to animate
 */
function addPulseEffect(button) {
    gsap.to(button, {
        scale: 1.1,
        duration: 0.2,
        repeat: 1,
        yoyo: true,
        ease: 'power2.inOut'
    });
}

/**
 * Add a heart burst animation to a favorite button
 * @param {HTMLElement} button - The favorite button element
 */
function addHeartBurst(button) {
    // Create particles container
    const particles = document.createElement('div');
    particles.className = 'heart-particles';
    button.appendChild(particles);
    
    // Create heart particles
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('i');
        particle.className = 'fas fa-heart heart-particle';
        particles.appendChild(particle);
        
        // Animate particle
        gsap.to(particle, {
            x: (Math.random() - 0.5) * 60,
            y: (Math.random() - 0.5) * 60,
            opacity: 0,
            scale: Math.random() * 0.5 + 0.5,
            duration: Math.random() * 0.8 + 0.6,
            ease: 'power3.out'
        });
    }
    
    // Remove particles after animation
    setTimeout(() => {
        particles.remove();
    }, 1500);
}

/**
 * Add a notification toast animation
 * @param {HTMLElement} notification - The notification element
 */
function animateNotification(notification) {
    gsap.fromTo(
        notification,
        { opacity: 0, x: 50 },
        {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
                // Auto-hide after delay
                setTimeout(() => {
                    gsap.to(notification, {
                        opacity: 0,
                        x: 50,
                        duration: 0.3,
                        ease: 'power2.in',
                        onComplete: () => notification.remove()
                    });
                }, 5000);
            }
        }
    );
}
