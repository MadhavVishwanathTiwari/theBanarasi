#!/bin/bash
# Video Optimization Script for Scroll-Triggered Playback
# This creates a video with keyframes every frame for buttery-smooth seeking

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed!"
    echo "Install it from: https://ffmpeg.org/download.html"
    exit 1
fi

# Check if input file is provided
if [ -z "$1" ]; then
    echo "Usage: ./optimize-video.sh input.mp4 [output.mp4]"
    echo "Example: ./optimize-video.sh Dsc_7422.mp4 banquet-optimized.mp4"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="${2:-banquet-showcase-optimized.mp4}"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Input file not found: $INPUT_FILE"
    exit 1
fi

echo "🎬 Optimizing video for scroll-triggered playback..."
echo "Input: $INPUT_FILE"
echo "Output: $OUTPUT_FILE"
echo ""
echo "⚙️  Settings:"
echo "   - Keyframe every frame (for smooth seeking)"
echo "   - Resolution: 1920x1080 (max)"
echo "   - Quality: High (CRF 22)"
echo "   - Bitrate: 3 Mbps"
echo "   - Audio: Removed"
echo ""

# Run FFmpeg optimization
ffmpeg -i "$INPUT_FILE" \
  -c:v libx264 \
  -preset slow \
  -crf 22 \
  -g 1 \
  -keyint_min 1 \
  -sc_threshold 0 \
  -b:v 3M \
  -maxrate 3.5M \
  -bufsize 7M \
  -vf "scale='min(1920,iw)':min(1080,ih)':force_original_aspect_ratio=decrease" \
  -movflags +faststart \
  -an \
  -y \
  "$OUTPUT_FILE"

# Check if conversion was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Video optimized successfully!"
    echo "📁 Output file: $OUTPUT_FILE"
    echo ""
    
    # Get file sizes
    INPUT_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
    OUTPUT_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    
    echo "📊 File sizes:"
    echo "   Original: $INPUT_SIZE"
    echo "   Optimized: $OUTPUT_SIZE"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Upload $OUTPUT_FILE to Cloudinary"
    echo "   2. Update the video URL in index.html"
    echo "   3. Test the smooth scroll experience!"
else
    echo ""
    echo "❌ Video optimization failed!"
    exit 1
fi

