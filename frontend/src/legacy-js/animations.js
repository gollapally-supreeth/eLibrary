// GSAP Animation Setup
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Page load animation
    gsap.from('body', { opacity: 0, duration: 0.5 });
    
    // Book card animations
    gsap.from('.book-card', {
        duration: 0.8,
        opacity: 0,
        y: 50,
        stagger: 0.1,
        ease: 'back.out'
    });
    
    // Sidebar navigation animation
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        gsap.from(sidebar, {
            duration: 0.6,
            x: -300,
            ease: 'power3.out'
        });
    }
    
    // Scroll animations for sections
    gsap.utils.toArray('.section').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 75%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 50,
            duration: 0.8
        });
    });
});