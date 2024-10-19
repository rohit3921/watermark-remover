document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoContainer = document.getElementById('videoContainer');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const imageInput = document.getElementById('imageInput');
    const processButton = document.getElementById('processButton');
    const downloadLink = document.getElementById('downloadLink');

    let overlayImage = null;

    videoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const videoURL = URL.createObjectURL(file);
            videoPlayer.src = videoURL;
            videoContainer.style.display = 'block';
            imageInput.style.display = 'block';
        }
    });

    videoPlayer.addEventListener('loadedmetadata', () => {
        overlayCanvas.width = videoPlayer.videoWidth;
        overlayCanvas.height = videoPlayer.videoHeight;
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                overlayImage = new Image();
                overlayImage.onload = () => {
                    drawOverlay();
                    processButton.style.display = 'block';
                };
                overlayImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    let isDragging = false;
    let dragStartX, dragStartY;

    overlayCanvas.addEventListener('mousedown', startDrag);
    overlayCanvas.addEventListener('mousemove', drag);
    overlayCanvas.addEventListener('mouseup', endDrag);
    overlayCanvas.addEventListener('mouseleave', endDrag);

    overlayCanvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startDrag({ clientX: touch.clientX, clientY: touch.clientY });
    });
    overlayCanvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        drag({ clientX: touch.clientX, clientY: touch.clientY });
    });
    overlayCanvas.addEventListener('touchend', endDrag);

    function startDrag(e) {
        isDragging = true;
        dragStartX = e.clientX - overlayCanvas.getBoundingClientRect().left;
        dragStartY = e.clientY - overlayCanvas.getBoundingClientRect().top;
    }

    function drag(e) {
        if (isDragging && overlayImage) {
            const x = e.clientX - overlayCanvas.getBoundingClientRect().left;
            const y = e.clientY - overlayCanvas.getBoundingClientRect().top;
            const dx = x - dragStartX;
            const dy = y - dragStartY;
            dragStartX = x;
            dragStartY = y;
            drawOverlay(dx, dy);
        }
    }

    function endDrag() {
        isDragging = false;
    }

    let overlayX = 0;
    let overlayY = 0;

    function drawOverlay(dx = 0, dy = 0) {
        const ctx = overlayCanvas.getContext('2d');
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        overlayX += dx;
        overlayY += dy;
        ctx.drawImage(overlayImage, overlayX, overlayY);
    }

    processButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoPlayer.videoWidth;
        canvas.height = videoPlayer.videoHeight;
        const ctx = canvas.getContext('2d');

        const processFrame = () => {
            if (videoPlayer.paused || videoPlayer.ended) {
                return;
            }
            ctx.drawImage(videoPlayer, 0, 0);
            ctx.drawImage(overlayImage, overlayX, overlayY);
            requestAnimationFrame(processFrame);
        };

        videoPlayer.play();
        processFrame();

        // This is a simplified version. In a real scenario, you'd need to capture
        // multiple frames and combine them into a video file, which is complex
        // to do entirely client-side without additional libraries.

        // For demonstration, we'll just capture the current frame
        setTimeout(() => {
            videoPlayer.pause();
            const dataURL = canvas.toDataURL('image/png');
            downloadLink.href = dataURL;
            downloadLink.download = 'processed_frame.png';
            downloadLink.style.display = 'block';
        }, 100);
    });
});
