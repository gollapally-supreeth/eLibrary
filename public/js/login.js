/**
 * eLibrary - Modern Login & Register Page
 * Enhanced with animations and improved UX
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const messageCloseBtns = document.querySelectorAll('.message-close');
    
    // Initialize variables for animations
    let animationsInitialized = false;
    
    // Theme Toggle Functionality
    themeToggle?.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        
        // Save preference to localStorage
        const isDarkMode = body.classList.contains('dark-theme');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Animate the theme change
        if (window.gsap) {
            gsap.to('.blob', {
                scale: 1.1,
                duration: 0.5,
                ease: 'power2.out',
                stagger: 0.1,
                onComplete: () => {
                    gsap.to('.blob', {
                        scale: 1,
                        duration: 0.5,
                        ease: 'power2.in'
                    });
                }
            });
        }
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        body.classList.add('dark-theme');
    } else if (savedTheme === 'false') {
        body.classList.remove('dark-theme');
    } else {
        // Check system preference if no saved preference
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDarkScheme) {
            body.classList.add('dark-theme');
        }
    }
    
    // Tab Switching Logic
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.querySelector(`.${tabName}-form`).classList.add('active');
            
            // Focus on first input field
            setTimeout(() => {
                document.querySelector(`.${tabName}-form form`).querySelector('input').focus();
            }, 300);
        });
    });
    
    // Password Toggle Functionality
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');
            
            // Toggle password visibility
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
            
            // Add active state to button
            toggle.classList.toggle('active');
        });
    });
      // Initialize GSAP animations if available
    if (window.gsap) {
        initializeAnimations();
    } else {
        // Fallback when GSAP is not available
        document.querySelector('.auth-card').classList.add('fadeInUp');
    }
    
    // Password Strength Indicator
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        const strengthSegments = document.querySelectorAll('.strength-segment');
        const strengthText = document.querySelector('.password-strength-text');
        
        registerPassword.addEventListener('input', () => {
            const password = registerPassword.value;
            const strength = calculatePasswordStrength(password);
            
            // Update indicator
            updatePasswordStrengthUI(strength, strengthSegments, strengthText);
        });
    }
    
    // Handle Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Disable the button and show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            setButtonLoading(submitBtn, true);
            
            try {
                // Call the API
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Show success message
                    showStatusMessage(successMessage, 'Login successful! Redirecting...', 'Success');
                    
                    // Redirect after delay
                    setTimeout(() => {
                        window.location.href = data.redirectUrl || '/';
                    }, 1500);
                } else {
                    // Show error message
                    showStatusMessage(errorMessage, data.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showStatusMessage(errorMessage, 'An error occurred. Please try again later.');
            } finally {
                // Reset button state
                setButtonLoading(submitBtn, false);
            }
        });
    }
    
    // Handle Register Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Basic validation
            if (password !== confirmPassword) {
                showStatusMessage(errorMessage, 'Passwords do not match.');
                return;
            }
            
            // Disable the button and show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            setButtonLoading(submitBtn, true);
            
            try {
                // Call the API
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Show success message
                    showStatusMessage(successMessage, 'Registration successful! You can now login.');
                    
                    // Switch to login tab after delay
                    setTimeout(() => {
                        document.querySelector('.auth-tab[data-tab="login"]').click();
                        
                        // Fill in email for convenience
                        document.getElementById('loginEmail').value = email;
                        document.getElementById('loginEmail').focus();
                    }, 1500);
                } else {
                    showStatusMessage(errorMessage, data.message || 'Registration failed.');
                }
            } catch (error) {
                console.error('Register error:', error);
                showStatusMessage(errorMessage, 'An error occurred. Please try again later.');
            } finally {
                // Reset button state
                setButtonLoading(submitBtn, false);
            }
        });
    }
    
    // Close message events
    messageCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.closest('.status-message');
            hideStatusMessage(message);
        });
    });

    // Forgot Password Handler
    const forgotPasswordLink = document.querySelector('.forgot-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Show message directing user to contact developer
            const message = 'To reset your password, please contact the developer at: elibrarymanagementproject@gmail.com';
            const title = 'Password Reset Request';
            
            showStatusMessage(errorMessage, message, title);
        });
    }

    // Helper Functions
    
    /**
     * Initialize animations with GSAP
     */
    function initializeAnimations() {
        if (animationsInitialized) return;
        
        // Animate background elements
        gsap.to('.blob', {
            x: 'random(-30, 30)',
            y: 'random(-30, 30)',
            scale: 'random(0.9, 1.1)',
            duration: 20,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            stagger: 5
        });
        
        gsap.to('.floating-book', {
            y: 'random(-20, 20)',
            rotate: 'random(-5, 5)',
            duration: 'random(4, 8)',
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            stagger: 0.5
        });
          // Entrance animations
        const tl = gsap.timeline();
        
        tl.from('.auth-card', {
            y: 20,
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            ease: 'power2.out'
        })
        .from('.brand-logo', {
            y: -20,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.4')
        .from('.auth-tabs', {
            y: -15,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.2')
        .from('.auth-form.active h2, .auth-form.active .form-subtitle', {
            y: -10,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.2')
        .from('.form-group', {
            y: 15,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.1')
        .from('.form-options, .primary-button, .auth-divider, .social-auth-options, .terms-privacy', {
            y: 10,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.1');
        
        // Button hover effects
        document.querySelectorAll('.primary-button').forEach(button => {
            button.addEventListener('mouseenter', () => {
                gsap.to(button, {
                    scale: 1.03,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.in'
                });
            });
        });
        
        animationsInitialized = true;
    }
    
    /**
     * Calculate password strength from 0-100
     * @param {string} password
     * @return {number} strength score
     */
    function calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let score = 0;
        
        // Length contribution (up to 25 points)
        const lengthScore = Math.min(25, password.length * 2);
        score += lengthScore;
        
        // Character variety
        if (/[A-Z]/.test(password)) score += 20; // uppercase
        if (/[a-z]/.test(password)) score += 15; // lowercase
        if (/[0-9]/.test(password)) score += 20; // numbers
        if (/[^A-Za-z0-9]/.test(password)) score += 20; // special characters
        
        // Penalize repetition
        const repetitions = password.match(/(.)\1{2,}/g);
        if (repetitions) {
            score -= repetitions.length * 5;
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * Update the password strength UI based on score
     * @param {number} strength 
     * @param {NodeList} segments 
     * @param {HTMLElement} textElement 
     */
    function updatePasswordStrengthUI(strength, segments, textElement) {
        // Clear previous classes
        segments.forEach(segment => {
            segment.className = 'strength-segment';
        });
        
        // Apply appropriate classes based on strength
        if (strength >= 20) {
            segments[0].classList.add('weak');
        }
        if (strength >= 40) {
            segments[0].classList.add('fair');
            segments[1].classList.add('fair');
        }
        if (strength >= 60) {
            segments[0].classList.add('good');
            segments[1].classList.add('good');
            segments[2].classList.add('good');
        }
        if (strength >= 80) {
            segments[0].classList.add('strong');
            segments[1].classList.add('strong');
            segments[2].classList.add('strong');
            segments[3].classList.add('strong');
        }
        
        // Update text
        if (strength < 20) {
            textElement.textContent = 'Very weak';
        } else if (strength < 40) {
            textElement.textContent = 'Weak';
        } else if (strength < 60) {
            textElement.textContent = 'Fair';
        } else if (strength < 80) {
            textElement.textContent = 'Good';
        } else {
            textElement.textContent = 'Strong';
        }
    }
    
    /**
     * Show status message
     * @param {HTMLElement} messageElement 
     * @param {string} message 
     * @param {string} title 
     */
    function showStatusMessage(messageElement, message, title = null) {
        if (!messageElement) return;
        
        const contentElement = messageElement.querySelector('.message-content');
        const titleElement = contentElement.querySelector('h4');
        const textElement = contentElement.querySelector('p');
        
        if (title && titleElement) {
            titleElement.textContent = title;
        }
        
        if (textElement) {
            textElement.textContent = message;
        }
        
        messageElement.classList.add('visible');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideStatusMessage(messageElement);
        }, 5000);
    }
    
    /**
     * Hide status message
     * @param {HTMLElement} messageElement 
     */
    function hideStatusMessage(messageElement) {
        messageElement.classList.remove('visible');
    }
    
    /**
     * Set loading state for a button
     * @param {HTMLElement} button 
     * @param {boolean} isLoading 
     */
    function setButtonLoading(button, isLoading) {
        if (!button) return;
        
        const text = button.querySelector('.button-text');
        const icon = button.querySelector('.button-icon');
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            if (text) text.style.opacity = '0';
            if (icon) icon.style.opacity = '0';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (text) text.style.opacity = '1';
            if (icon) icon.style.opacity = '1';
        }
    }
});
