# Hero Video Setup Guide

## Adding Your Hero Video

The website is designed with a hero section that features a full-screen background video. Here's how to add your video:

### Step 1: Prepare Your Video

**Recommended Specifications:**
- **Format:** MP4 (H.264 codec for best browser compatibility)
- **Resolution:** 1920x1080 (Full HD) or higher
- **Aspect Ratio:** 16:9
- **Duration:** 15-30 seconds (it will loop automatically)
- **File Size:** Under 10MB for optimal loading speed
- **Framerate:** 24-30 fps

### Step 2: Add to Project

1. Place your video file in `assets/images/` directory
2. Name it exactly: `hero-video.mp4`

```
theBanarasi/
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js
│   └── images/
│       ├── logo.png
│       └── hero-video.mp4      ← Your video here
├── README.md
└── VIDEO-SETUP.md
```

### Step 3: Recommended Video Content

For "The Banarasi Chai Wali," consider filming:
- Traditional chai preparation process
- Steaming cups of tea
- Restaurant interior ambiance
- Traditional Indian patterns in motion
- Staff serving with hospitality
- Banquet hall elegance

### Step 4: Video Optimization

**Online Tools:**
- [HandBrake](https://handbrake.fr/) - Free video compressor
- [CloudConvert](https://cloudconvert.com/) - Online converter
- [Clideo](https://clideo.com/) - Online video tools

**Quick Optimization Settings:**
- Reduce quality to 80-85%
- Set bitrate to 2-3 Mbps
- Use H.264 codec
- Enable hardware acceleration

### Step 5: Fallback

If the video fails to load, the website automatically:
- Uses a gradient background matching brand colors
- Still displays all content properly
- Maintains full functionality

### Alternative Options

If you don't have a video yet:

1. **Use a placeholder service:**
   - Visit [Coverr](https://coverr.co/) or [Pixabay](https://pixabay.com/videos/)
   - Download a free food/restaurant video
   - Rename to `hero-video.mp4`

2. **Use a static image:**
   - Edit `assets/css/styles.css`
   - Replace video with background image
   - Find the `.hero` section and modify

3. **Keep the fallback:**
   - Leave `hero-video.mp4` missing
   - The gradient background will display automatically

## Video Testing

After adding your video:

1. Open `index.html` in a browser
2. Check that video autoplays (muted)
3. Verify smooth looping
4. Test on mobile devices
5. Check loading speed

## Need Help?

The video is defined in `index.html` at line ~48-51:

```html
<video autoplay muted loop playsinline class="hero-video">
    <source src="assets/images/hero-video.mp4" type="video/mp4">
</video>
```

All video controls are already optimized for best performance and user experience!

