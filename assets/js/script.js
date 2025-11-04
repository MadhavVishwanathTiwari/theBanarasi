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

// Scroll-triggered video with smoothing
const scrollVideoSection = document.querySelector('.scroll-video-section');
const scrollVideo = document.querySelector('.scroll-video');
const banquetSection = document.querySelector('#banquet');
let currentVideoTime = 0;
let targetVideoTime = 0;
let isAnimating = false;

if (scrollVideo) {
    scrollVideo.addEventListener('loadedmetadata', () => {
        scrollVideo.pause();
        scrollVideo.currentTime = 0;
    });
}

// Smooth video scrubbing with continuous animation
function smoothVideoUpdate() {
    // Only run if video is ready and has valid duration
    if (scrollVideo && scrollVideo.readyState >= 2 && !isNaN(scrollVideo.duration)) {
        // Lerp towards target with stronger easing
        const diff = targetVideoTime - currentVideoTime;
        const step = diff * 0.2; // Increased for snappier response
        
        currentVideoTime += step;
        
        try {
            scrollVideo.currentTime = currentVideoTime;
        } catch (e) {
            // Ignore seek errors during loading
        }
    }
    
    // Always keep animating for smooth mouse wheel
    requestAnimationFrame(smoothVideoUpdate);
}

// Start the continuous animation loop
smoothVideoUpdate();

function updateOnScroll() {
    const scrolled = window.pageYOffset;
    
    // Only update if scroll changed significantly (throttle DOM updates)
    if (Math.abs(scrolled - lastScrolled) < 3) {
        ticking = false;
        return;
    }
    
    // Update navbar background on scroll
    if (scrolled > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
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
    
    // Scroll-triggered video scrubbing
    if (scrollVideo && scrollVideoSection && !isNaN(scrollVideo.duration)) {
        // Get absolute position from top of page
        let sectionTop = 0;
        let element = scrollVideoSection;
        while (element) {
            sectionTop += element.offsetTop;
            element = element.offsetParent;
        }
        
        const sectionHeight = scrollVideoSection.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;
        
        if (scrolled >= sectionTop && scrolled <= sectionBottom) {
            const scrollProgress = (scrolled - sectionTop) / sectionHeight;
            targetVideoTime = scrollProgress * scrollVideo.duration;
        }
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
    '.about-hero, .about-awards, .about-description, .about-image-banner, .offers-header, .offer-card, .restaurant-images, .restaurant-text, .banquet-text, .banquet-images, .contact-info, .contact-form'
);

animateElements.forEach((el) => {
    el.classList.add('fade-in-element');
    observer.observe(el);
});

// Form submission handler with Web3Forms
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const button = contactForm.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        
        // Show loading state
        button.textContent = 'Sending...';
        button.disabled = true;
        
        const formData = new FormData(contactForm);
        
        try {
            // Send to Web3Forms
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Success
                button.textContent = 'Message Sent! ✓';
                button.style.backgroundColor = '#1A5F3F';
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    contactForm.reset();
                    button.textContent = originalText;
                    button.style.backgroundColor = '';
                    button.disabled = false;
                }, 3000);
            } else {
                // Error from Web3Forms
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            // Error handling
            console.error('Form submission error:', error);
            button.textContent = 'Error - Try Again';
            button.style.backgroundColor = '#A0522D';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
                button.disabled = false;
            }, 3000);
        }
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
const whatsappNumber = '918511663766'; // Banarasi primary contact

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

// About Section Image Carousel
const bannerSlides = document.querySelectorAll('.banner-slide');
const progressBar = document.getElementById('carouselProgress');
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
    // Remove active class from all slides
    bannerSlides.forEach(slide => slide.classList.remove('active'));
    
    // Add active class to current slide
    if (bannerSlides[index]) {
        bannerSlides[index].classList.add('active');
    }
    
    // Update progress bar position
    if (progressBar) {
        const percentage = (index * 100);
        progressBar.style.transform = `translateX(${percentage}%)`;
    }
    
    currentSlide = index;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % bannerSlides.length;
    showSlide(currentSlide);
}

// Auto-rotate every 3.5 seconds
if (bannerSlides.length > 0) {
    slideInterval = setInterval(nextSlide, 3500);
}

// Drag/Swipe functionality for carousel
const bannerCarousel = document.querySelector('.banner-carousel');
let isDragging = false;
let hasMoved = false;
let startPos = 0;
let currentTranslate = 0;

if (bannerCarousel) {
    // Mouse events
    bannerCarousel.addEventListener('mousedown', dragStart);
    bannerCarousel.addEventListener('mousemove', drag);
    bannerCarousel.addEventListener('mouseup', dragEnd);
    bannerCarousel.addEventListener('mouseleave', dragEnd);
    
    // Touch events
    bannerCarousel.addEventListener('touchstart', dragStart, { passive: true });
    bannerCarousel.addEventListener('touchmove', drag, { passive: true });
    bannerCarousel.addEventListener('touchend', dragEnd);
    
    // Prevent context menu
    bannerCarousel.addEventListener('contextmenu', (e) => e.preventDefault());
}

function dragStart(e) {
    isDragging = true;
    hasMoved = false;
    startPos = getPositionX(e);
    currentTranslate = 0;
    clearInterval(slideInterval);
}

function drag(e) {
    if (!isDragging) return;
    
    const currentPosition = getPositionX(e);
    currentTranslate = currentPosition - startPos;
    
    // Mark as moved if dragged more than 5px
    if (Math.abs(currentTranslate) > 5) {
        hasMoved = true;
        bannerCarousel.style.cursor = 'grabbing';
    }
}

function dragEnd(e) {
    if (!isDragging) return;
    
    isDragging = false;
    bannerCarousel.style.cursor = 'grab';
    
    // Only change slide if user actually dragged (not just clicked)
    if (hasMoved) {
        const movedBy = currentTranslate;
        
        // If dragged more than 50px, change slide
        if (movedBy < -50) {
            // Dragged left - next slide
            currentSlide = (currentSlide + 1) % bannerSlides.length;
            showSlide(currentSlide);
        } else if (movedBy > 50) {
            // Dragged right - previous slide
            currentSlide = (currentSlide - 1 + bannerSlides.length) % bannerSlides.length;
            showSlide(currentSlide);
        }
    }
    
    // Reset values
    currentTranslate = 0;
    hasMoved = false;
    
    // Resume auto-rotation
    slideInterval = setInterval(nextSlide, 3500);
}

function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
}

// ===================================
// Restaurant Image Carousel
// ===================================
const restaurantSlides = document.querySelectorAll('.restaurant-slide');
const restaurantCarousel = document.querySelector('.restaurant-carousel');
const restaurantProgressBar = document.querySelector('.restaurant-carousel + .carousel-progress .progress-bar');
let currentRestaurantSlide = 0;
let restaurantSlideInterval;
let isRestaurantDragging = false;
let hasRestaurantMoved = false;
let startRestaurantPos = 0;
let currentRestaurantTranslate = 0;

function showRestaurantSlide(index) {
    restaurantSlides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
    
    // Update progress bar position
    if (restaurantProgressBar) {
        const percentage = (index * 100);
        restaurantProgressBar.style.transform = `translateX(${percentage}%)`;
    }
}

function nextRestaurantSlide() {
    currentRestaurantSlide = (currentRestaurantSlide + 1) % restaurantSlides.length;
    showRestaurantSlide(currentRestaurantSlide);
}

// Auto-rotate every 3.5 seconds
if (restaurantSlides.length > 0) {
    restaurantSlideInterval = setInterval(nextRestaurantSlide, 3500);
}

// Drag/Swipe functionality for restaurant carousel
if (restaurantCarousel) {
    // Mouse events
    restaurantCarousel.addEventListener('mousedown', restaurantDragStart);
    restaurantCarousel.addEventListener('mousemove', restaurantDrag);
    restaurantCarousel.addEventListener('mouseup', restaurantDragEnd);
    restaurantCarousel.addEventListener('mouseleave', restaurantDragEnd);
    
    // Touch events
    restaurantCarousel.addEventListener('touchstart', restaurantDragStart, { passive: true });
    restaurantCarousel.addEventListener('touchmove', restaurantDrag, { passive: true });
    restaurantCarousel.addEventListener('touchend', restaurantDragEnd);
    
    // Prevent context menu
    restaurantCarousel.addEventListener('contextmenu', (e) => e.preventDefault());
}

function restaurantDragStart(e) {
    isRestaurantDragging = true;
    hasRestaurantMoved = false;
    startRestaurantPos = getPositionX(e);
    currentRestaurantTranslate = 0;
    clearInterval(restaurantSlideInterval);
}

function restaurantDrag(e) {
    if (!isRestaurantDragging) return;
    
    const currentPosition = getPositionX(e);
    currentRestaurantTranslate = currentPosition - startRestaurantPos;
    
    // Mark as moved if dragged more than 5px
    if (Math.abs(currentRestaurantTranslate) > 5) {
        hasRestaurantMoved = true;
        restaurantCarousel.style.cursor = 'grabbing';
    }
}

function restaurantDragEnd(e) {
    if (!isRestaurantDragging) return;
    
    isRestaurantDragging = false;
    restaurantCarousel.style.cursor = 'grab';
    
    // Only change slide if user actually dragged (not just clicked)
    if (hasRestaurantMoved) {
        const movedBy = currentRestaurantTranslate;
        
        // If dragged more than 50px, change slide
        if (movedBy < -50) {
            // Dragged left - next slide
            currentRestaurantSlide = (currentRestaurantSlide + 1) % restaurantSlides.length;
            showRestaurantSlide(currentRestaurantSlide);
        } else if (movedBy > 50) {
            // Dragged right - previous slide
            currentRestaurantSlide = (currentRestaurantSlide - 1 + restaurantSlides.length) % restaurantSlides.length;
            showRestaurantSlide(currentRestaurantSlide);
        }
    }
    
    // Reset values
    currentRestaurantTranslate = 0;
    hasRestaurantMoved = false;
    
    // Resume auto-rotation
    restaurantSlideInterval = setInterval(nextRestaurantSlide, 3500);
}

// Console message
console.log('%cBanarasi Banquet & Restaurant', 'color: #8B6F47; font-size: 20px; font-weight: bold;');
console.log('%cGandhidham\'s Preferred Destination for Fine Vegetarian Dining', 'color: #5C4033; font-size: 14px;');

