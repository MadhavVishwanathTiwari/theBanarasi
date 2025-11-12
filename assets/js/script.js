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
const scrollVideoWrapper = document.querySelector('.scroll-video-wrapper');
const pinTrack = document.querySelector('.pin-track');
let currentVideoTime = 0;
let targetVideoTime = 0;
let isAnimating = false;
let virtualProgress = 0; // 0..1 wheel-driven progress
const enableWheelScrub = false;
const slowScrollFactor = 0.18; // scale wheel speed while video is pinned
let isScrubActive = false; // only scrub when near/in the pin section
let hasUpgradedPreload = false; // upgrade preload to auto when approaching

// 🚫 DISABLE SCRUBBING ON MOBILE - Following Apple's lead
// Video scrubbing on mobile causes stutter due to hardware limitations
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
const ENABLE_MOBILE_SCRUBBING = false; // Set to true only if you hate yourself
// Animation loop gating
let rafId = 0;
function startSmoothLoop() {
    if (!rafId) rafId = requestAnimationFrame(smoothVideoUpdate);
}
function stopSmoothLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
}
// Cached layout values to avoid repeated style reads during scroll
let stickyTopCache = 80;
let pinDistanceCache = 1600;
let trackTopCache = 0;
let viewportHCache = window.innerHeight;
function getAbsoluteTop(el) {
    let t = 0, n = el;
    while (n) { t += n.offsetTop || 0; n = n.offsetParent; }
    return t;
}

// Set CSS variables for overlap and track height
function setVideoTrackVars() {
    // Skip all this complex setup on mobile
    if (isMobileDevice && !ENABLE_MOBILE_SCRUBBING) {
        return;
    }
    
    const root = document.documentElement;
    const container = document.querySelector('.scroll-video-container');
    const stickyH = container ? container.offsetHeight : 0;
    root.style.setProperty('--stickyH', stickyH + 'px');
    // Use visual viewport height when available (accounts for mobile browser UI)
    const viewportH = window.visualViewport ? Math.round(window.visualViewport.height) : window.innerHeight;
    // Reserve space for the fixed navbar so the sticky element never clips into it
    const headerEl = document.querySelector('.navbar');
    const headerH = headerEl ? headerEl.offsetHeight : 0;
    // Center the pinned video vertically within the visible area below the header on mobile
    const isMobileViewport = window.innerWidth <= 768;
    const stickyTopOffset = isMobileViewport
        ? (headerH + Math.max(0, Math.round(((viewportH - headerH) - stickyH) / 2)))
        : 80;
    root.style.setProperty('--stickyTop', stickyTopOffset + 'px');
    // Estimate desired pin distance: scale with duration and viewport
    let seconds = 7;
    if (scrollVideo && !isNaN(scrollVideo.duration)) seconds = scrollVideo.duration;
    const pxPerSec = 350; // tune for feel
    const baseDistance = seconds * pxPerSec;
    const isMobile = window.innerWidth <= 768;
    const minDistance = viewportH * (isMobile ? 3.5 : 4.5);
    let pinDistanceDesired = Math.max(baseDistance, minDistance);
    
    // Reduce scroll distance on mobile to match faster scrubbing speed (1.2x)
    // This keeps video scrubbing in sync with scroll completion
    if (isMobile) {
        pinDistanceDesired = pinDistanceDesired / 1.2; // ~83% of original distance
    }
    
    // For internal pin track, height = pinDistance + slack while sticky is visible
    const pinTrackH = Math.round(pinDistanceDesired + (viewportH - stickyTopOffset));
    root.style.setProperty('--pinTrackH', pinTrackH + 'px');
    root.style.setProperty('--pinDistance', Math.round(pinDistanceDesired) + 'px');
    // Update caches
    stickyTopCache = stickyTopOffset;
    pinDistanceCache = Math.round(pinDistanceDesired);
    viewportHCache = viewportH;
    trackTopCache = pinTrack ? getAbsoluteTop(pinTrack) : 0;
}

// Hide the entire pin-track section on mobile to avoid empty space
if (isMobileDevice && !ENABLE_MOBILE_SCRUBBING && pinTrack) {
    pinTrack.style.display = 'none';
    console.log('📱 Scrubbing video disabled on mobile (following Apple\'s approach)');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setVideoTrackVars);
} else {
    setVideoTrackVars();
}
window.addEventListener('resize', setVideoTrackVars);
window.addEventListener('orientationchange', setVideoTrackVars);
// Also listen to visual viewport changes on mobile (address bar show/hide)
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setVideoTrackVars);
    window.visualViewport.addEventListener('scroll', setVideoTrackVars);
}
// Observe size changes of the pin elements to refresh caches without polling
if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => setVideoTrackVars());
    const pin = document.querySelector('.pin-track');
    const container = document.querySelector('.scroll-video-container');
    if (pin) ro.observe(pin);
    if (container) ro.observe(container);
}

if (scrollVideo) {
    scrollVideo.addEventListener('loadedmetadata', () => {
        scrollVideo.pause();
        scrollVideo.currentTime = 0;
    });
}

// Wheel-driven scrubbing (disabled by default to avoid buggy scrolling)
if (enableWheelScrub && scrollVideoWrapper && scrollVideo) {
    let wheelIdleTimer;
    scrollVideoWrapper.addEventListener('wheel', (e) => {
        if (isNaN(scrollVideo.duration)) return;
        const atStart = virtualProgress <= 0.0001;
        const atEnd = virtualProgress >= 0.9999;
        const scrollingUp = e.deltaY < 0;
        const scrollingDown = e.deltaY > 0;
        // Allow default page scroll when at edges and user keeps going outward
        if ((atStart && scrollingUp) || (atEnd && scrollingDown)) {
            return; // let page scroll
        }
        // Otherwise lock page scroll and scrub video
        e.preventDefault();
        // deltaMode: 0=pixel, 1=line, 2=page
        const unitScale = (e.deltaMode === 1) ? 0.03 : 0.00022; // small for ~2+ wheel revolutions
        virtualProgress += e.deltaY * unitScale;
        if (virtualProgress < 0) virtualProgress = 0;
        if (virtualProgress > 1) virtualProgress = 1;
        targetVideoTime = virtualProgress * scrollVideo.duration;
        // idle timer to release quickly after interaction
        clearTimeout(wheelIdleTimer);
        wheelIdleTimer = setTimeout(() => { /* no-op, just end of active scrubbing */ }, 150);
    }, { passive: false });
}

// Slow down native scroll only while the sticky video is active (pin track)
if (false && scrollVideoWrapper && scrollVideo && pinTrack) {
    const getAbsoluteTop = (el) => { let t = 0, n = el; while (n) { t += n.offsetTop || 0; n = n.offsetParent; } return t; };
    scrollVideoWrapper.addEventListener('wheel', (e) => {
        const viewportH = window.innerHeight;
        const stickyTopOffset = 80;
        const trackTop = getAbsoluteTop(pinTrack);
        const trackHeight = pinTrack.offsetHeight;
        const pinDistance = Math.max(0, trackHeight - (viewportH - stickyTopOffset));
        const start = trackTop - stickyTopOffset;
        const end = start + pinDistance;
        const scrolled = window.pageYOffset;
        if (scrolled >= start && scrolled <= end) {
            e.preventDefault();
            window.scrollBy(0, e.deltaY * slowScrollFactor);
        }
    }, { passive: false });
}

// Smooth video scrubbing with continuous animation
function smoothVideoUpdate() {
	// Skip entirely on mobile
	if (isMobileDevice && !ENABLE_MOBILE_SCRUBBING) {
		stopSmoothLoop();
		return;
	}
	
	// Only run heavy seeking when active and video is ready
	if (isScrubActive && scrollVideo && scrollVideo.readyState >= 2 && !isNaN(scrollVideo.duration)) {
		const diff = targetVideoTime - currentVideoTime;
		const absDiff = Math.abs(diff);
		// Skip tiny seeks to avoid jank on mobile decoders
		const isMobile = window.innerWidth <= 768;
		const minSeekDelta = isMobile ? 0.02 : 0.03;
		if (absDiff > minSeekDelta) {
			// Large jumps: use fastSeek when available
			if (absDiff > 0.75 && typeof scrollVideo.fastSeek === 'function') {
				try {
					scrollVideo.fastSeek(targetVideoTime);
					currentVideoTime = targetVideoTime;
				} catch (e) {
					// fall back to incremental seek below
					currentVideoTime += diff * (isMobile ? 0.16 : 0.1);
					try { scrollVideo.currentTime = currentVideoTime; } catch (_) {}
				}
			} else {
				// Lerp towards target with easing
				currentVideoTime += diff * (isMobile ? 0.16 : 0.1);
				try { scrollVideo.currentTime = currentVideoTime; } catch (_) {}
			}
		}
	}
	// Keep a single lightweight loop only while requested
	if (rafId) rafId = requestAnimationFrame(smoothVideoUpdate);
}

// Start/stop loop based on page visibility
document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		stopSmoothLoop();
	} else if (isScrubActive) {
		startSmoothLoop();
	}
});

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
    
    // Scroll-triggered video scrubbing (mapped to the internal pin track)
    // 🚫 SKIP ON MOBILE - Let them scroll normally without the stutter
    if (scrollVideo && pinTrack && !isNaN(scrollVideo.duration) && !(isMobileDevice && !ENABLE_MOBILE_SCRUBBING)) {
        // Use cached values to avoid computed style/layout thrash
        const trackTop = trackTopCache || getAbsoluteTop(pinTrack);
        const trackHeight = Math.max(1, pinTrack.offsetHeight);
        const viewportH = viewportHCache;
        const stickyTopOffset = stickyTopCache;
        const pinDistance = pinDistanceCache || Math.max(1, trackHeight - (viewportH - stickyTopOffset));
        const effectiveDistance = pinDistance;
        const start = trackTop - stickyTopOffset; // start where pinning begins
        const end = start + effectiveDistance;

		// Decide if we are near/within the pin to gate work and prepare buffering
		// Widen nearStart slightly so the loop activates immediately when scrolling back up
		const nearStart = start - viewportH * 1.8;
		const nearEnd = end + viewportH * 0.6;
		const withinPin = scrolled >= start && scrolled <= end;
		isScrubActive = scrolled >= nearStart && scrolled <= nearEnd;
		// Start/stop the animation loop on proximity to remove activation lag
		if (isScrubActive) startSmoothLoop(); else stopSmoothLoop();

		// Upgrade preload as we approach to reduce initial stutter
		if (!hasUpgradedPreload && isScrubActive) {
			try {
				if (scrollVideo.preload !== 'auto') {
					scrollVideo.preload = 'auto';
					scrollVideo.load();
				}
				hasUpgradedPreload = true;
			} catch (_) {}
		}

        if (scrolled >= start && scrolled <= end) {
            let progress = (scrolled - start) / effectiveDistance;
            
            // Apply faster scrubbing speed on phones to compensate for 20fps video
            // This makes the video advance faster per scroll distance, reducing visible frame gaps
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // 1.2x speed means 20% faster scrubbing on phones
                // Adjust this multiplier (1.2 - 1.6) to fine-tune the feel
                progress = progress * 1.2;
            }
            
            const clamped = Math.max(0, Math.min(1, progress));
            targetVideoTime = clamped * scrollVideo.duration;
            
            // Quantize to frame steps on mobile (20fps → 0.05s per frame)
            if (isMobile) {
                // Use just-enough smoothness on phones: ~18fps (≈0.0556s per step)
                // Tune between 16–18 for performance vs smoothness trade-off
                const mobileScrubFps = 18;
                const frameStep = 1 / mobileScrubFps;
                const quantized = Math.round(targetVideoTime / frameStep) * frameStep;
                targetVideoTime = Math.max(0, Math.min(scrollVideo.duration, quantized));
            }
        } else if (scrolled < start) {
            targetVideoTime = 0;
        } else if (scrolled > end) {
            targetVideoTime = scrollVideo.duration;
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

// Strategic Hero Video Play/Pause based on viewport proximity
// This saves bandwidth by pausing when out of view, and resumes proactively when approaching
if (heroVideo) {
    const heroVideoObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Hero video is visible or approaching viewport - play it
                    if (heroVideo.paused) {
                        heroVideo.play().catch(err => {
                            console.log('Hero video play prevented:', err);
                        });
                    }
                } else {
                    // Hero video is far from viewport - pause to save bandwidth
                    if (!heroVideo.paused) {
                        heroVideo.pause();
                    }
                }
            });
        },
        {
            // Large rootMargin ensures video starts playing before it's visible
            // 400px means: start playing when hero is 400px away from entering viewport
            rootMargin: '400px 0px 400px 0px',
            threshold: 0
        }
    );
    
    heroVideoObserver.observe(heroVideo);
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
console.log('%c' + (isMobileDevice ? '📱 Mobile Device Detected - Scrubbing disabled' : '🖥️  Desktop Device - Scrubbing enabled'), 'color: #888; font-size: 12px;');

