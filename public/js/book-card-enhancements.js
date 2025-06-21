/**
 * eLibrary Book Card Enhanced Interactions
 * Advanced interactions for book cards
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize book card enhancements
    initBookCardEnhancements();
});

/**
 * Initialize book card enhancements
 */
function initBookCardEnhancements() {
    // Set up hover 3D effect
    setupBookCard3DEffect();
    
    // Set up ripple effect on clicks
    setupBookCardRipple();
    
    // Set up favorite animation
    setupFavoriteAnimation();
}

/**
 * Set up 3D hover effect for book cards
 */
function setupBookCard3DEffect() {
    document.addEventListener('mousemove', function(e) {
        const cards = document.querySelectorAll('.book-card');
        
        cards.forEach(card => {
            // Get card position
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculate mouse position relative to card center
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            
            // Calculate distance from center (0 to 1)
            const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
            const maxDistance = Math.sqrt((rect.width / 2) * (rect.width / 2) + (rect.height / 2) * (rect.height / 2));
            
            // Only apply effect if mouse is close to card
            if (distance < maxDistance * 1.5 && 
                e.clientX >= rect.left && e.clientX <= rect.right && 
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                
                // Calculate rotation based on mouse position
                const rotateY = (mouseX / rect.width) * 8; // Max 8 degrees
                const rotateX = -(mouseY / rect.height) * 8; // Max 8 degrees
                
                // Apply rotation with GSAP for smooth animation
                if (window.gsap) {
                    gsap.to(card, {
                        rotationY: rotateY,
                        rotationX: rotateX,
                        scale: 1.03,
                        duration: 0.3,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                    
                    // Parallax effect for book cover
                    const bookCover = card.querySelector('.book-cover');
                    if (bookCover) {
                        gsap.to(bookCover, {
                            x: rotateY * 2, // Subtle movement
                            y: rotateX * 2,
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                    }
                    
                    // Shadow effect
                    gsap.to(card, {
                        boxShadow: `
                            ${-rotateY * 0.5}px ${-rotateX * 0.5}px 10px rgba(0, 0, 0, 0.1),
                            ${-rotateY}px ${-rotateX}px 20px rgba(0, 0, 0, 0.05)
                        `,
                        duration: 0.3
                    });
                }
            } 
            // Reset card when mouse is away
            else if (card._gsap && (card._gsap.rotationY !== 0 || card._gsap.rotationX !== 0)) {
                if (window.gsap) {
                    gsap.to(card, {
                        rotationY: 0,
                        rotationX: 0,
                        scale: 1,
                        boxShadow: 'var(--shadow-sm)',
                        duration: 0.5,
                        ease: 'power3.out'
                    });
                    
                    // Reset book cover position
                    const bookCover = card.querySelector('.book-cover');
                    if (bookCover) {
                        gsap.to(bookCover, {
                            x: 0,
                            y: 0,
                            duration: 0.5,
                            ease: 'power3.out'
                        });
                    }
                }
            }
        });
    });
}

/**
 * Set up ripple effect on book card clicks
 */
function setupBookCardRipple() {
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.book-card');
        
        if (card) {
            // Don't add ripple if clicking on a button
            if (e.target.closest('.action-btn') || e.target.closest('.favorite-btn')) {
                return;
            }
            
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            
            // Position ripple at click point relative to card
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Add to card
            card.appendChild(ripple);
            
            // Remove after animation
            setTimeout(() => {
                ripple.remove();
            }, 800);
            
            // Apply subtle scale animation to card
            if (window.gsap) {
                gsap.timeline()
                    .to(card, { scale: 0.98, duration: 0.15, ease: 'power2.out' })
                    .to(card, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
            }
        }
    });
}

/**
 * Set up animation for favorite button
 */
function setupFavoriteAnimation() {
    document.addEventListener('click', function(e) {
        const favoriteBtn = e.target.closest('.favorite-btn');
        
        if (favoriteBtn) {
            if (window.gsap) {
                // Only add heart burst animation when favoriting, not unfavoriting
                if (!favoriteBtn.classList.contains('active')) {
                    // Create heart burst effect
                    if (typeof addHeartBurst === 'function') {
                        addHeartBurst(favoriteBtn);
                    } else {
                        // Fallback if enhanced-transitions.js isn't loaded
                        gsap.timeline()
                            .to(favoriteBtn, { scale: 0.5, duration: 0.15, ease: "power2.in" })
                            .to(favoriteBtn, { scale: 1.2, duration: 0.2, ease: "back.out(1.7)" })
                            .to(favoriteBtn, { scale: 1, duration: 0.15, ease: "power2.out" });
                    }
                }
            }
        }
    });
}

/**
 * Set up parallax effect for section backgrounds
 */
function setupParallaxBackgrounds() {
    document.addEventListener('mousemove', function(e) {
        const moveX = (e.clientX - window.innerWidth / 2) / 30;
        const moveY = (e.clientY - window.innerHeight / 2) / 30;
        
        document.querySelectorAll('.parallax-bg').forEach(bg => {
            if (window.gsap) {
                gsap.to(bg, {
                    x: moveX * (bg.dataset.depth || 1),
                    y: moveY * (bg.dataset.depth || 1),
                    duration: 1,
                    ease: 'power1.out'
                });
            }
        });
    });
}

/**
 * Initialize book reading progress indicators
 */
function initReadingProgress() {
    // Get reading history from localStorage
    const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    
    // Update progress bars for books in reading history
    readingHistory.forEach(historyItem => {
        if (historyItem.progress) {
            const bookCards = document.querySelectorAll(`.book-card[data-book-id="${historyItem.bookId}"]`);
            
            bookCards.forEach(card => {
                // Add progress bar if it doesn't exist
                if (!card.querySelector('.reading-progress')) {
                    const progressBar = document.createElement('div');
                    progressBar.className = 'reading-progress';
                    progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
                    card.appendChild(progressBar);
                }
                
                // Update progress
                const progressBarFill = card.querySelector('.reading-progress-bar');
                if (progressBarFill) {
                    progressBarFill.style.width = `${historyItem.progress}%`;
                }
            });
        }
    });
}

// Call these functions when new book cards are added to the DOM
function refreshBookCardEnhancements() {
    initBookCardEnhancements();
    initReadingProgress();
}
