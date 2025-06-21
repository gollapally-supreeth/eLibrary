/* 
 * Book Card Interactions - Enhanced animations for book cards 
 * 
 * This script adds special mouse tracking hover effects for book cards
 * to create a 3D-like hover effect that enhances the user experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize 3D hover effects for book cards
    initBookCardEffects();
    
    // Observe DOM for new book cards being added
    observeForNewBooks();
});

/**
 * Initialize 3D hover effects on all book cards
 */
function initBookCardEffects() {
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
        addCardEffect(card);
    });
}

/**
 * Add 3D perspective effect to a single card
 */
function addCardEffect(card) {
    // Skip if already enhanced
    if (card.classList.contains('effect-active')) return;
    
    // Mark as enhanced
    card.classList.add('effect-active');
    
    // Add perspective styling
    card.style.perspective = '1000px';
    card.style.transformStyle = 'preserve-3d';
    
    // Get the book cover image
    const coverImg = card.querySelector('.book-cover') || card.querySelector('img');
    const title = card.querySelector('.book-title') || card.querySelector('h3');
    const author = card.querySelector('.book-author') || card.querySelector('p');
    
    if (coverImg) {
        coverImg.style.transition = 'transform 0.2s ease';
    }
    
    card.addEventListener('mousemove', function(e) {
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        
        // Apply the tilt effect
        const tiltAmount = 10; // Maximum tilt in degrees
        card.style.transform = `rotateY(${x * tiltAmount}deg) rotateX(${-y * tiltAmount}deg)`;
        
        // Add highlight effect
        card.style.boxShadow = `
            0 10px 20px rgba(0,0,0,0.1),
            ${-x * 20}px ${-y * 20}px 20px rgba(255,255,255,0.05),
            ${x * 20}px ${y * 20}px 20px rgba(0,0,0,0.1) inset
        `;
        
        // Move the book cover for parallax effect
        if (coverImg) {
            coverImg.style.transform = `translateX(${-x * 10}px) translateY(${-y * 10}px)`;
        }
        
        // Subtle text movement
        if (title) title.style.transform = `translateX(${x * 5}px) translateY(${y * 5}px)`;
        if (author) author.style.transform = `translateX(${x * 3}px) translateY(${y * 3}px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        // Reset transforms
        card.style.transform = 'rotateY(0deg) rotateX(0deg)';
        card.style.boxShadow = '';
        
        if (coverImg) coverImg.style.transform = 'translateX(0) translateY(0)';
        if (title) title.style.transform = 'translateX(0) translateY(0)';
        if (author) author.style.transform = 'translateX(0) translateY(0)';
    });
    
    // Add click ripple effect
    card.addEventListener('click', function(e) {
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            top: ${y - size/2}px;
            left: ${x - size/2}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            pointer-events: none;
            z-index: 1;
        `;
        
        card.appendChild(ripple);
        
        // Animate the ripple
        gsap.to(ripple, {
            scale: 1,
            opacity: 0,
            duration: 0.6,
            onComplete: () => {
                ripple.remove();
            }
        });
    });
}

/**
 * Watch for new book cards being added to the DOM
 */
function observeForNewBooks() {
    // Create a MutationObserver to watch for new book cards
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            // Check for added nodes
            if (mutation.addedNodes && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    // Check if it's an element and is a book card
                    if (node.nodeType === 1) {
                        // If it's a book card
                        if (node.classList && node.classList.contains('book-card')) {
                            addCardEffect(node);
                        } 
                        // Or if it contains book cards
                        else {
                            const cards = node.querySelectorAll('.book-card');
                            cards.forEach(card => addCardEffect(card));
                        }
                    }
                });
            }
        });
    });
    
    // Observe the entire document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
