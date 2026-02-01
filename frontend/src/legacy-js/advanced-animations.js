/**
 * eLibrary - Enhanced Animation System
 * Provides smooth, performant animations throughout the user portal
 */

// Make sure GSAP is available before setting up animations
if (typeof gsap !== 'undefined') {
    // Register GSAP plugins
    if (gsap.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    
    // Execute when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize animation system
        initAnimations();

        // Set up page transition system
        setupPageTransitions();
        
        // Set up smooth scrolling
        setupSmoothScrolling();

        // Set up hover animations
        setupHoverEffects();

        // Animate any elements currently in viewport
        animateElementsInView();
    });

    /**
     * Main animation initialization
     */
    function initAnimations() {
        // Initial page load sequence
        const timeline = gsap.timeline({
            defaults: { 
                ease: "power3.out",
                duration: 0.8 
            }
        });

        // Staggered sidebar elements animation
        timeline.from('.sidebar', { 
            x: -60, 
            opacity: 0, 
            duration: 0.6 
        })
        .from('.sidebar-header *', { 
            opacity: 0, 
            x: -20, 
            stagger: 0.1 
        }, '-=0.3')
        .from('.sidebar-menu li', { 
            opacity: 0, 
            x: -20, 
            stagger: 0.05 
        }, '-=0.5');

        // Header elements animation
        timeline.from('.top-nav', { 
            y: -20, 
            opacity: 0 
        }, '-=0.8')
        .from('.top-nav > *', { 
            opacity: 0, 
            y: -10, 
            stagger: 0.1 
        }, '-=0.5');

        // Main content animation
        timeline.from('.section.active > h2', { 
            opacity: 0, 
            y: 20 
        }, '-=0.4')
        .from('.section.active .section-header', { 
            opacity: 0, 
            y: 20,
            stagger: 0.1 
        }, '-=0.2');

        // Animate book cards with a nice stagger effect
        animateBookCards();
    }

    /**
     * Animate book cards with a beautiful staggered effect
     */
    function animateBookCards() {
        // Clear any existing animations
        gsap.killTweensOf('.book-card');

        // Select all book cards in the active section
        const bookCards = document.querySelectorAll('.section.active .book-card');
        
        if (bookCards.length > 0) {
            gsap.set(bookCards, { opacity: 0, y: 30, scale: 0.95 });
            
            gsap.to(bookCards, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: {
                    each: 0.08,
                    grid: "auto",
                    from: "start"
                },
                ease: "back.out(1.2)",
                clearProps: "scale" // Clear scale after animation for better performance
            });
        }
    }

    /**
     * Set up page transition system for smoother section switching
     */
    function setupPageTransitions() {
        // Get all menu items and sections
        const menuItems = document.querySelectorAll('.sidebar-menu li a');
        const sections = document.querySelectorAll('.section');

        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get the target section ID
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (!targetSection) return;
                
                // Don't animate if already active
                if (targetSection.classList.contains('active')) return;

                // Highlight active menu item
                document.querySelectorAll('.sidebar-menu li').forEach(li => {
                    li.classList.remove('active');
                });
                this.parentElement.classList.add('active');
                
                // Animate out current section
                const currentSection = document.querySelector('.section.active');
                if (currentSection) {
                    gsap.to(currentSection, {
                        opacity: 0,
                        y: 20,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => {
                            currentSection.classList.remove('active');
                            
                            // Animate in new section
                            targetSection.classList.add('active');
                            gsap.fromTo(targetSection, 
                                { opacity: 0, y: -20 },
                                { 
                                    opacity: 1, 
                                    y: 0, 
                                    duration: 0.5, 
                                    ease: "power3.out",
                                    onComplete: () => {
                                        // Animate book cards in the new section
                                        animateBookCards();
                                    }
                                }
                            );
                        }
                    });
                } else {
                    // No current active section, just show new one
                    targetSection.classList.add('active');
                }

                // Close mobile sidebar if open
                const sidebar = document.querySelector('.sidebar');
                const mainContent = document.querySelector('.main-content');
                if (sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    if (mainContent) mainContent.classList.remove('sidebar-active');
                }
            });
        });
    }

    /**
     * Set up hover effects for interactive elements
     */
    function setupHoverEffects() {
        // Book card hover effects
        document.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                gsap.to(this, { 
                    y: -10, 
                    boxShadow: '0 15px 30px rgba(0,0,0,0.15)', 
                    duration: 0.3 
                });
            });
            
            card.addEventListener('mouseleave', function() {
                gsap.to(this, { 
                    y: 0, 
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)', 
                    duration: 0.3 
                });
            });
        });

        // Button hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                gsap.to(this, { 
                    scale: 1.05, 
                    duration: 0.2 
                });
            });
            
            btn.addEventListener('mouseleave', function() {
                gsap.to(this, { 
                    scale: 1, 
                    duration: 0.2 
                });
            });
        });

        // Profile stat card hover effects
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                gsap.to(this.querySelector('i'), { 
                    scale: 1.2, 
                    rotation: 5, 
                    color: 'var(--accent)',
                    duration: 0.3 
                });
            });
            
            card.addEventListener('mouseleave', function() {
                gsap.to(this.querySelector('i'), { 
                    scale: 1, 
                    rotation: 0, 
                    color: 'var(--primary)',
                    duration: 0.3 
                });
            });
        });
    }

    /**
     * Set up smooth scrolling animations
     */
    function setupSmoothScrolling() {
        // Animate history section scrolling
        if (gsap.ScrollTrigger) {
            gsap.utils.toArray('.history-books-timeline .history-item').forEach(item => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none none"
                    },
                    opacity: 0,
                    x: -50,
                    duration: 0.6,
                    ease: "power2.out"
                });
            });
        }
    }

    /**
     * Animate elements that are currently in viewport
     */
    function animateElementsInView() {
        // Check if elements are in view and animate them
        const activeSection = document.querySelector('.section.active');
        if (activeSection) {
            // Animate headings
            gsap.from(activeSection.querySelectorAll('h2, h3'), {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.5
            });

            // Animate book grid
            const bookGrids = activeSection.querySelectorAll('.book-grid');
            bookGrids.forEach(grid => {
                if (grid.children.length > 0 && !grid.querySelector('.loading-animation')) {
                    animateBookCards();
                }
            });
        }
    }

    /**
     * Enhanced modal animations
     */
    function setupModalAnimations() {
        const modal = document.getElementById('bookModal');
        const modalContent = modal ? modal.querySelector('.modal-content') : null;
        
        if (!modal || !modalContent) return;
        
        // Set initial state for modal animations
        gsap.set(modalContent, { y: 50, opacity: 0 });
        
        // Original openBookModal function is overridden in the HTML
        // This adds extra animation capabilities to be called from there
        window.animateModalOpen = function() {
            gsap.to(modalContent, {
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease: "power3.out"
            });
        };
        
        window.animateModalClose = function(callback) {
            gsap.to(modalContent, {
                y: 50,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: callback
            });
        };
    }

    // Initialize modal animations
    setupModalAnimations();

    // Make global animation functions available to other scripts
    window.eLibAnimations = {
        refreshCardAnimations: animateBookCards,
        pageTransition: setupPageTransitions,
        animateElementsInView: animateElementsInView
    };
}
