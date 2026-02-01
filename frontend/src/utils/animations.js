import gsap from 'gsap';

/**
 * GSAP Animation Utilities for eLibrary
 * Neural Interface Animation System
 */

// Entrance Animations
export const fadeInUp = (elements, options = {}) => {
    const defaults = {
        y: 40,
        duration: 0.8,
        stagger: 0.1,
        delay: 0,
        ease: 'expo.out'
    };

    gsap.from(elements, { ...defaults, ...options });
};

export const fadeInDown = (elements, options = {}) => {
    const defaults = {
        y: -40,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out'
    };

    gsap.from(elements, { ...defaults, ...options });
};

export const fadeInLeft = (elements, options = {}) => {
    const defaults = {
        x: -40,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out'
    };

    gsap.from(elements, { ...defaults, ...options });
};

export const fadeInRight = (elements, options = {}) => {
    const defaults = {
        x: 40,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out'
    };

    gsap.from(elements, { ...defaults, ...options });
};

export const scaleIn = (elements, options = {}) => {
    const defaults = {
        scale: 0.95,
        duration: 0.6,
        ease: 'back.out(1.7)'
    };

    gsap.from(elements, { ...defaults, ...options });
};

// Hover Animations
export const hoverLift = (element) => {
    const tl = gsap.timeline({ paused: true });

    tl.to(element, {
        y: -10,
        duration: 0.3,
        ease: 'power2.out'
    });

    return tl;
};

export const hoverGlow = (element, color = '#6366f1') => {
    const tl = gsap.timeline({ paused: true });

    tl.to(element, {
        boxShadow: `0 0 30px rgba(99, 102, 241, 0.6)`,
        duration: 0.3,
        ease: 'power2.out'
    });

    return tl;
};

// Loading Animations
export const pulseAnimation = (element) => {
    gsap.to(element, {
        scale: 1.05,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });
};

export const spinAnimation = (element) => {
    gsap.to(element, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: 'linear'
    });
};

// Number Counter Animation
export const counterAnimation = (element, target, options = {}) => {
    const defaults = {
        duration: 2,
        ease: 'power2.out',
        onUpdate: function () {
            element.textContent = Math.round(this.targets()[0].value);
        }
    };

    gsap.from(element, {
        value: 0,
        ...defaults,
        ...options
    });

    gsap.to({ value: 0 }, {
        value: target,
        ...defaults,
        ...options
    });
};

// Page Transition Animations
export const pageTransitionIn = (element) => {
    const tl = gsap.timeline();

    tl.from(element, {
        opacity: 0,
        duration: 0.3
    })
        .from('.page-content > *', {
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'expo.out'
        }, '-=0.2');

    return tl;
};

export const pageTransitionOut = (element) => {
    return gsap.to(element, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
    });
};

// Modal Animations
export const modalOpen = (backdrop, modal) => {
    const tl = gsap.timeline();

    tl.to(backdrop, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
    })
        .from(modal, {
            scale: 0.9,
            opacity: 0,
            duration: 0.4,
            ease: 'back.out(1.7)'
        }, '-=0.2');

    return tl;
};

export const modalClose = (backdrop, modal) => {
    const tl = gsap.timeline();

    tl.to(modal, {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
    })
        .to(backdrop, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in'
        }, '-=0.2');

    return tl;
};

// Card Flip Animation
export const cardFlip = (card, front, back) => {
    const tl = gsap.timeline({ paused: true });

    tl.to(front, {
        rotationY: 180,
        duration: 0.6,
        ease: 'power2.inOut'
    })
        .to(back, {
            rotationY: 0,
            duration: 0.6,
            ease: 'power2.inOut'
        }, 0);

    return tl;
};

// Stagger Reveal Animation
export const staggerReveal = (elements, options = {}) => {
    const defaults = {
        y: 30,
        duration: 0.8,
        stagger: {
            amount: 0.6,
            from: 'start'
        },
        ease: 'expo.out'
    };

    gsap.from(elements, { ...defaults, ...options });
};

// Shake Animation (for errors)
export const shakeAnimation = (element) => {
    gsap.to(element, {
        x: -10,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: 'power2.inOut',
        onComplete: () => {
            gsap.set(element, { x: 0 });
        }
    });
};

// Success Bounce
export const successBounce = (element) => {
    gsap.to(element, {
        scale: 1.1,
        duration: 0.3,
        ease: 'back.out(3)',
        yoyo: true,
        repeat: 1
    });
};

// Progress Bar Animation
export const animateProgressBar = (element, targetWidth) => {
    gsap.to(element, {
        width: `${targetWidth}%`,
        duration: 1.5,
        ease: 'power2.out'
    });
};

// Typewriter Effect
export const typewriterEffect = (element, text, speed = 50) => {
    let index = 0;
    element.textContent = '';

    const interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
        } else {
            clearInterval(interval);
        }
    }, speed);
};

// Parallax Scroll Effect
export const parallaxScroll = (elements, speed = 0.5) => {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        elements.forEach(el => {
            const yPos = -(scrolled * speed);
            gsap.to(el, {
                y: yPos,
                duration: 0.1,
                ease: 'none'
            });
        });
    });
};

// Ripple Effect
export const rippleEffect = (element, event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'ripple';

    element.appendChild(ripple);

    gsap.to(ripple, {
        scale: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
    });
};

export default {
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    hoverLift,
    hoverGlow,
    pulseAnimation,
    spinAnimation,
    counterAnimation,
    pageTransitionIn,
    pageTransitionOut,
    modalOpen,
    modalClose,
    cardFlip,
    staggerReveal,
    shakeAnimation,
    successBounce,
    animateProgressBar,
    typewriterEffect,
    parallaxScroll,
    rippleEffect
};
