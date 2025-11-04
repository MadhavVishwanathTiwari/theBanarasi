# Video Optimization Guide for Scroll-Triggered Video

## Why Videos Stutter in Scroll-Triggered Playback

The main cause of stuttering is **keyframe spacing** in the video file. When you seek to a specific time in a video, the browser needs to find the nearest keyframe and decode from there. If keyframes are too far apart, seeking becomes slow and choppy.

## Solution: Re-encode with Frequent Keyframes

### Using FFmpeg (Recommended)

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -g 1 \
  -keyint_min 1 \
  -sc_threshold 0 \
  -b:v 3M \
  -maxrate 3M \
  -bufsize 6M \
  -vf "scale=1920:-2" \
  -movflags +faststart \
  -an \
  output.mp4
```

### Key Parameters Explained:

- **`-g 1`**: Every frame is a keyframe (I-frame) - CRITICAL for smooth seeking
- **`-keyint_min 1`**: Minimum keyframe interval
- **`-sc_threshold 0`**: Disable scene change detection
- **`-crf 23`**: Quality (18-28, lower = better quality but bigger file)
- **`-b:v 3M`**: Target bitrate (adjust based on needs)
- **`-movflags +faststart`**: Optimize for web streaming
- **`-an`**: Remove audio (not needed for muted video)
- **`-preset slow`**: Better compression (use 'medium' for faster encoding)

### File Size Warning
Making every frame a keyframe will increase file size significantly (3-5x larger). This is the trade-off for smooth scrolling.

**Recommended approach:**
1. Keep video duration short (5-10 seconds)
2. Use moderate resolution (1280x720 or 1920x1080)
3. Compress to reasonable quality (CRF 23-26)
4. Target final file size: 5-10MB

### Alternative: Keyframe Every Few Frames

If file size is too large with `-g 1`, try keyframe every 5-10 frames:

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 24 \
  -g 10 \
  -keyint_min 5 \
  -sc_threshold 0 \
  -b:v 2.5M \
  -vf "scale=1920:-2" \
  -movflags +faststart \
  -an \
  output.mp4
```

This provides a balance between smooth seeking and file size.

## Using Cloudinary for Optimization

If you're using Cloudinary, you can add transformation parameters:

```
https://res.cloudinary.com/YOUR_CLOUD/video/upload/
  q_auto,
  br_3m,
  f_mp4,
  vc_h264,
  g_1/
  your-video.mp4
```

Parameters:
- `q_auto`: Automatic quality
- `br_3m`: Bitrate 3 Mbps
- `f_mp4`: Format MP4
- `vc_h264`: H.264 codec
- `g_1`: Keyframe every frame (may not be supported by all CDNs)

## Current Video Analysis

Your video: `https://res.cloudinary.com/dfuzagn6o/video/upload/v1762189055/Dsc_7422_ibwne7.mp4`

**Likely issues:**
1. Large keyframe interval (default is often 250 frames)
2. High bitrate/resolution may be overkill
3. Not optimized for web seeking

## Quick Test

To verify if keyframes are the issue:
1. Download the video
2. Run: `ffprobe -select_streams v -show_frames input.mp4 | grep "pict_type=I" | wc -l`
3. This shows number of keyframes
4. Divide video frames by keyframes to get interval
5. If interval > 30, re-encode with more keyframes

## Cloudinary Optimization (Quick Fix)

Update your video URL in `index.html` to:

```html
<source src="https://res.cloudinary.com/dfuzagn6o/video/upload/q_auto:low,w_1920,br_2500k,f_mp4/v1762189055/Dsc_7422_ibwne7.mp4" type="video/mp4">
```

This applies:
- Lower quality preset
- Width limit 1920px
- Bitrate limit 2.5 Mbps
- Optimized format

## Alternative Solutions

### 1. Use Image Sequence Instead
Convert video to image sequence, load all images, switch on scroll:
- Pro: Perfectly smooth
- Con: Many HTTP requests, larger total size

### 2. Canvas Rendering
Render video frames to canvas for better performance:
- Pro: More control
- Con: More complex code

### 3. Reduce Scroll Distance
Make the container shorter (150vh instead of 300vh):
- Less scroll = fewer seek operations
- Video plays faster through

### 4. Use WebM Format
WebM (VP9) codec sometimes handles seeking better:
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -g 1 output.webm
```

Then add WebM source before MP4:
```html
<source src="video.webm" type="video/webm">
<source src="video.mp4" type="video/mp4">
```

## Performance Checklist

- [ ] Video duration < 10 seconds
- [ ] Resolution ≤ 1920x1080
- [ ] Bitrate 2-4 Mbps
- [ ] Every frame is keyframe (or every 5-10 frames)
- [ ] File size < 10MB
- [ ] faststart flag enabled
- [ ] Audio removed
- [ ] Tested on target devices

## Recommendation for Your Use Case

Given your Cloudinary URL, I recommend:

**Option 1 - Re-upload optimized version:**
1. Download original video
2. Re-encode with `-g 1` using FFmpeg command above
3. Upload to Cloudinary with descriptive name
4. Update HTML with new URL

**Option 2 - Use Cloudinary transformations:**
Try this URL first:
```
https://res.cloudinary.com/dfuzagn6o/video/upload/q_60,w_1920,br_2000k,f_mp4/v1762189055/Dsc_7422_ibwne7
```

This should provide immediate improvement without re-encoding!

