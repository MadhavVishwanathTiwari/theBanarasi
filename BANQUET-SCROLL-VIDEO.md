# Banquet Scroll-Triggered Video Setup

## Overview
The Banquet section features an interactive scroll-triggered video that plays as users scroll down the page. This creates an immersive, cinematic experience where the video progress is directly linked to scroll position.

## Video Requirements

### File Location
Place your video at: `assets/videos/banquet-showcase.mp4`

### Video Specifications
- **Format:** MP4 (H.264 codec recommended)
- **Aspect Ratio:** 16:9 (landscape) or wider
- **Duration:** 5-15 seconds recommended
- **Resolution:** 1920x1080 (Full HD) minimum
- **File Size:** Optimize to under 10MB for web performance
- **Content:** A horizontal pan/tracking shot from left to right works best

### Optimization Tips
1. **Compress the video:**
   - Use HandBrake or FFmpeg
   - Target bitrate: 3-5 Mbps
   - Remove audio track (video is muted)

2. **Use Cloudinary (recommended):**
   - Upload to Cloudinary for automatic optimization
   - Replace the src in `index.html`:
   ```html
   <source src="https://res.cloudinary.com/YOUR_CLOUD/video/upload/banquet-showcase.mp4" type="video/mp4">
   ```

## How It Works

### The Experience
1. User scrolls down to the Banquet section
2. Video becomes "sticky" and fills the viewport
3. As user continues scrolling, the video plays frame-by-frame
4. The scroll distance is 3x the viewport height (300vh)
5. Video completes as user reaches the end of the scroll zone
6. Normal scrolling continues to the carousel below

### Technical Details
- **Container Height:** 300vh (desktop), 200vh (mobile)
- **Video Position:** Sticky positioning keeps it in view
- **Scroll Progress:** Mapped to video currentTime (0 to duration)
- **Performance:** Uses requestAnimationFrame for smooth playback
- **Indicator:** "Scroll to explore" prompt fades after user starts scrolling

### Customization

#### Adjust Scroll Distance
In `assets/css/styles.css`:
```css
.banquet-scroll-video-container {
    height: 300vh; /* Change this value */
}
```
- Higher value = slower video playback (more scroll needed)
- Lower value = faster video playback (less scroll needed)

#### Change Video Fill Behavior
In `assets/css/styles.css`:
```css
.scroll-video {
    object-fit: cover; /* Options: cover, contain, fill */
    object-position: center; /* Adjust focal point */
}
```

#### Mobile Behavior
- Shorter scroll distance (200vh) for faster mobile experience
- Full-width video (no border radius) for maximum impact
- Same smooth frame-by-frame playback

## Testing Checklist
- [ ] Video loads and displays first frame
- [ ] Scrolling down plays video forward
- [ ] Scrolling up plays video backward
- [ ] Video stays in viewport during scroll
- [ ] Scroll indicator appears and fades correctly
- [ ] Works on desktop browsers
- [ ] Works on mobile (iOS Safari, Chrome)
- [ ] Video file size is optimized
- [ ] Page doesn't lag during scroll

## Troubleshooting

### Video doesn't play smoothly
- Reduce video file size
- Lower resolution or bitrate
- Use Cloudinary for adaptive streaming

### Video playback is choppy
- Ensure video is properly compressed
- Check for browser console errors
- Verify video codec compatibility

### Scroll feels stuck
- This is intentional! The video locks the scroll
- Adjust the container height in CSS to make it faster/slower

## Browser Compatibility
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ⚠️ Older browsers may fall back to static first frame

## Alternative: Using GIF
While MP4 is recommended, you can use GIF:
1. Replace `<video>` element with `<img>` tag
2. GIFs are larger file sizes - keep under 2MB
3. Lower quality than video
4. Auto-loops without JavaScript control

**Note:** MP4 provides better quality and performance!

