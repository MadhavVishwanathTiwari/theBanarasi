@echo off
REM Video Optimization Script for Scroll-Triggered Playback (Windows)
REM This creates a video with keyframes every frame for buttery-smooth seeking

REM Check if input file is provided
if "%~1"=="" (
    echo Usage: optimize-video.bat input.mp4 [output.mp4]
    echo Example: optimize-video.bat Dsc_7422.mp4 banquet-optimized.mp4
    exit /b 1
)

set INPUT_FILE=%~1
set OUTPUT_FILE=%~2
if "%OUTPUT_FILE%"=="" set OUTPUT_FILE=banquet-showcase-optimized.mp4

REM Check if input file exists
if not exist "%INPUT_FILE%" (
    echo ❌ Input file not found: %INPUT_FILE%
    exit /b 1
)

echo 🎬 Optimizing video for scroll-triggered playback...
echo Input: %INPUT_FILE%
echo Output: %OUTPUT_FILE%
echo.
echo ⚙️  Settings:
echo    - Keyframe every frame (for smooth seeking)
echo    - Resolution: 1920x1080 (max)
echo    - Quality: High (CRF 22)
echo    - Bitrate: 3 Mbps
echo    - Audio: Removed
echo.

REM Run FFmpeg optimization
ffmpeg -i "%INPUT_FILE%" ^
  -c:v libx264 ^
  -preset slow ^
  -crf 22 ^
  -g 1 ^
  -keyint_min 1 ^
  -sc_threshold 0 ^
  -b:v 3M ^
  -maxrate 3.5M ^
  -bufsize 7M ^
  -vf "scale='min(1920,iw)':min(1080,ih)':force_original_aspect_ratio=decrease" ^
  -movflags +faststart ^
  -an ^
  -y ^
  "%OUTPUT_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Video optimized successfully!
    echo 📁 Output file: %OUTPUT_FILE%
    echo.
    echo 🚀 Next steps:
    echo    1. Upload %OUTPUT_FILE% to Cloudinary
    echo    2. Update the video URL in index.html
    echo    3. Test the smooth scroll experience!
) else (
    echo.
    echo ❌ Video optimization failed!
    echo Make sure FFmpeg is installed and in your PATH
    echo Download from: https://ffmpeg.org/download.html
    exit /b 1
)

