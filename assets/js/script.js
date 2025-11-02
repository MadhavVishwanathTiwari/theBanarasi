// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// Navbar scroll effect - optimized
const navbar = document.querySelector('.navbar');
const heroVideo = document.querySelector('.hero-video');
const sections = document.querySelectorAll('section[id]');
let ticking = false;
let lastScrolled = 0;

function updateOnScroll() {
    const scrolled = window.pageYOffset;
    
    // Only update if scroll changed significantly (throttle DOM updates)
    if (Math.abs(scrolled - lastScrolled) < 5) {
        ticking = false;
        return;
    }
    
    // Update navbar shadow
    if (scrolled > 100) {
        navbar.style.boxShadow = '0 5px 25px rgba(92, 64, 51, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(92, 64, 51, 0.1)';
    }
    
    // Update active nav link
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        
        if (scrolled >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
    
    // Parallax effect for hero video (only when visible)
    if (heroVideo && scrolled < window.innerHeight) {
        heroVideo.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    lastScrolled = scrolled;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
}, { passive: true });

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just '#'
        if (href === '#') return;
        
        const target = document.querySelector(href);
        
        if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 100; // Account for fixed navbar
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px 200px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once visible
        }
    });
}, observerOptions);

// Observe elements for animation
const animateElements = document.querySelectorAll(
    '.about-text, .about-images, .restaurant-images, .restaurant-text, .banquet-text, .banquet-images, .contact-info, .contact-form'
);

animateElements.forEach((el) => {
    el.classList.add('fade-in-element');
    observer.observe(el);
});

// Form submission handler
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Here you would normally send the data to a server
        console.log('Form submitted:', data);
        
        // Show success message
        const button = contactForm.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        
        button.textContent = 'Message Sent!';
        button.style.backgroundColor = '#1A5F3F';
        button.disabled = true;
        
        // Reset form
        setTimeout(() => {
            contactForm.reset();
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.disabled = false;
        }, 3000);
    });
}

// Lazy loading for images (when real images are added)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Video fallback handling
if (heroVideo) {
    heroVideo.addEventListener('error', () => {
        console.log('Video not found, using fallback background');
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.style.backgroundImage = 'linear-gradient(135deg, #5C4033 0%, #8B6F47 100%)';
        }
    });
    
    // Ensure video plays on mobile
    heroVideo.addEventListener('loadstart', () => {
        heroVideo.play().catch(err => {
            console.log('Video autoplay prevented:', err);
        });
    });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    }
    
    // ESC to close WhatsApp chat
    if (e.key === 'Escape') {
        const chatBox = document.getElementById('whatsappChatBox');
        const floatBtn = document.getElementById('whatsappButton');
        if (chatBox && chatBox.classList.contains('active')) {
            chatBox.classList.remove('active');
            floatBtn.classList.remove('active');
        }
    }
});

// WhatsApp Chat Widget
const whatsappButton = document.getElementById('whatsappButton');
const whatsappChatBox = document.getElementById('whatsappChatBox');
const whatsappClose = document.getElementById('whatsappClose');
const whatsappInput = document.getElementById('whatsappInput');
const whatsappSend = document.getElementById('whatsappSend');
const whatsappNumber = '919310092139'; // Your WhatsApp number

// Toggle chat box
if (whatsappButton) {
    whatsappButton.addEventListener('click', () => {
        whatsappChatBox.classList.toggle('active');
        whatsappButton.classList.toggle('active');
        
        // Focus input when opened
        if (whatsappChatBox.classList.contains('active')) {
            setTimeout(() => whatsappInput.focus(), 300);
        }
    });
}

// Close chat box
if (whatsappClose) {
    whatsappClose.addEventListener('click', () => {
        whatsappChatBox.classList.remove('active');
        whatsappButton.classList.remove('active');
    });
}

// Send message
function sendWhatsAppMessage() {
    const message = whatsappInput.value.trim();
    
    if (message) {
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Clear input and close chat
        whatsappInput.value = '';
        whatsappChatBox.classList.remove('active');
        whatsappButton.classList.remove('active');
    }
}

// Send on button click
if (whatsappSend) {
    whatsappSend.addEventListener('click', sendWhatsAppMessage);
}

// Send on Enter key
if (whatsappInput) {
    whatsappInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendWhatsAppMessage();
        }
    });
}

// Close chat when clicking outside
document.addEventListener('click', (e) => {
    if (whatsappChatBox && whatsappButton) {
        if (!whatsappChatBox.contains(e.target) && !whatsappButton.contains(e.target)) {
            whatsappChatBox.classList.remove('active');
            whatsappButton.classList.remove('active');
        }
    }
});

// Console message
console.log('%cBanarasi Banquet & Restaurant', 'color: #8B6F47; font-size: 20px; font-weight: bold;');
console.log('%cGandhidham\'s Preferred Destination for Fine Vegetarian Dining', 'color: #5C4033; font-size: 14px;');

