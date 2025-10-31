# The Banarasi Chai Wali - Restaurant & Banquet Hall Website

A professional, elegant website for "The Banarasi Chai Wali" - an authentic Indian restaurant and banquet hall. This website showcases traditional design elements inspired by the brand's logo while maintaining modern web standards for performance and user experience.

## 🎨 Design Features

- **Brand-Aligned Color Palette**: Rich browns, cream/off-white, and dark green accents matching the logo
- **Elegant Typography**: Combination of decorative serif (Cormorant Garamond) and clean sans-serif (Inter) fonts
- **Hero Video Section**: Full-screen video background with overlay for immersive experience
- **Responsive Design**: Fully responsive across all devices (mobile, tablet, desktop)
- **Smooth Animations**: Subtle fade-in and scroll effects for enhanced UX
- **Fast Performance**: Optimized CSS, minimal JavaScript, and efficient loading

## 📁 Project Structure

```
theBanarasi/
├── index.html                    # Main HTML file
├── assets/                       # All assets
│   ├── css/
│   │   └── styles.css           # All styling and responsive design
│   ├── js/
│   │   └── script.js            # Interactive functionality
│   └── images/
│       ├── logo.png             # Brand logo
│       └── hero-video.mp4       # Hero section background video (to be added)
├── README.md                     # This file
└── VIDEO-SETUP.md               # Video setup guide
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional but recommended)

### Installation

1. **Clone or download the project**
   ```bash
   cd theBanarasi
   ```

2. **Add Your Hero Video**
   - Place your video file in `assets/images/`
   - Rename it to `hero-video.mp4`
   - Recommended specs:
     - Format: MP4 (H.264 codec)
     - Resolution: 1920x1080 or higher
     - Duration: 15-30 seconds, looping
     - File size: Under 10MB for best performance

3. **Serve the Website**
   
   **Option A: Using Python (if installed)**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option B: Using Node.js (if installed)**
   ```bash
   npx http-server -p 8000
   ```
   
   **Option C: Using VS Code Live Server**
   - Install "Live Server" extension
   - Right-click on `index.html` → "Open with Live Server"
   
   **Option D: Direct file opening**
   - Simply open `index.html` in your browser
   - Note: Some features may not work with file:// protocol

4. **Open in Browser**
   - Navigate to `http://localhost:8000` (or the port you specified)

## 📱 Sections Overview

### Home / Hero Section
- Full-screen video background with branded overlay
- Prominent call-to-action buttons
- Scroll indicator animation

### About Section
- Brand story and mission
- Three key features highlighted
- Image placeholders for photos

### Menu Section
- Four categories:
  - Traditional Chai & Beverages
  - Tandoor Delights
  - Vegetarian Specialties
  - Breads & Rice
- Interactive hover effects
- Responsive grid layout

### Gallery Section
- Image grid layout
- Hover zoom effects
- Ready for lightbox integration

### Banquet Section
- Facility information
- Capacity and amenities
- Booking inquiry CTA

### Contact Section
- Contact information
- Working hours
- Contact form with validation

### Footer
- Logo and navigation links
- Social media icons
- Copyright information

## 🎯 Customization Guide

### Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --color-dark-brown: #5C4033;
    --color-medium-brown: #8B6F47;
    --color-reddish-brown: #A0522D;
    --color-cream: #F5F0E8;
    --color-off-white: #FFFEF9;
    --color-dark-green: #1A5F3F;
}
```

### Content

1. **Menu Items**: Edit the menu section in `index.html` (lines ~150-250)
2. **Contact Info**: Update address, phone, and hours in `index.html` (contact section)
3. **About Text**: Customize the brand story in `index.html` (about section)

### Images

Replace the SVG placeholders in:
- About section
- Gallery section
- Banquet section

Add your images to `assets/images/` and replace the `<svg>` tags with:
```html
<img src="assets/images/your-image.jpg" alt="Description">
```

## ⚡ Performance Optimizations

- **Minimal Dependencies**: Only Google Fonts loaded externally
- **Optimized CSS**: Single stylesheet with efficient selectors
- **Vanilla JavaScript**: No heavy frameworks
- **Video Optimization**: Use compressed MP4 with H.264 codec
- **Lazy Loading**: Ready for image lazy loading implementation
- **Debounced Scroll**: Optimized scroll event handlers

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Technical Details

### Technologies Used
- HTML5 (Semantic markup)
- CSS3 (Custom properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Google Fonts API

### Key Features
- Fixed navigation with scroll effects
- Mobile-responsive hamburger menu
- Smooth scroll navigation
- Intersection Observer API for animations
- Form validation and handling
- Video autoplay with fallback
- Accessible markup (ARIA labels)

## 📝 Future Enhancements

Consider adding:
- [ ] Image lightbox for gallery
- [ ] Online reservation system
- [ ] Newsletter subscription
- [ ] Social media integration
- [ ] Blog/news section
- [ ] Menu PDF downloads
- [ ] Multi-language support
- [ ] SEO meta tags
- [ ] Google Analytics
- [ ] Contact form backend integration

## 📧 Support

For questions or customization needs, please refer to the inline code comments or contact your web developer.

## 📄 License

This project is created for The Banarasi Chai Wali. All rights reserved.

---

**The Banarasi Chai Wali** | *Authentic Flavors, Timeless Traditions*

