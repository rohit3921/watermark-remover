document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const imageInput = document.getElementById('imageInput');
    const videoPlayer = document.getElementById('videoPlayer');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const videoContainer = document.getElementById('videoContainer');
    const captureButton = document.getElementById('captureButton');
    const downloadLink = document.getElementById('downloadLink');

    let watermarkImage = null;
    let watermarkPosition = { x: 0, y: 0 };
    let isDragging = false;

    videoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            const videoURL = URL.createObjectURL(file);
            videoPlayer.src = videoURL;
            videoContainer.style.display = 'block';
            captureButton.style.display = 'block';
            resizeCanvasToVideo();
        }
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                watermarkImage = new Image();
                watermarkImage.onload = () => drawWatermark();
                watermarkImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    function resizeCanvasToVideo() {
        videoPlayer.addEventListener('loadedmetadata', () => {
            overlayCanvas.width = videoPlayer.videoWidth;
            overlayCanvas.height = videoPlayer.videoHeight;
            drawWatermark();
        });
    }

    function drawWatermark() {
        if (!watermarkImage) return;
        const ctx = overlayCanvas.getContext('2d');
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        ctx.drawImage(watermarkImage, watermarkPosition.x, watermarkPosition.y);
    }

    overlayCanvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = overlayCanvas.getBoundingClientRect();
        const scaleX = overlayCanvas.width / rect.width;
        const scaleY = overlayCanvas.height / rect.height;
        watermarkPosition.x = (e.clientX - rect.left) * scaleX - watermarkImage.width / 2;
        watermarkPosition.y = (e.clientY - rect.top) * scaleY - watermarkImage.height / 2;
        drawWatermark();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && watermarkImage) {
            const rect = overlayCanvas.getBoundingClientRect();
            const scaleX = overlayCanvas.width / rect.width;
            const scaleY = overlayCanvas.height / rect.height;
            watermarkPosition.x = (e.clientX - rect.left) * scaleX - watermarkImage.width / 2;
            watermarkPosition.y = (e.clientY - rect.top) * scaleY - watermarkImage.height / 2;
            drawWatermark();
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    captureButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoPlayer.videoWidth;
        canvas.height = videoPlayer.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw the current video frame
        ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
        
        // Draw the watermark
        if (watermarkImage) {
            ctx.drawImage(watermarkImage, watermarkPosition.x, watermarkPosition.y);
        }
        
        // Create download link
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = 'watermarked_frame.png';
            downloadLink.style.display = 'inline-block';
        });
    });
});
