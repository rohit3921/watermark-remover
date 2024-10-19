// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoContainer = document.getElementById('videoContainer');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const imageUploadSection = document.getElementById('imageUploadSection');
    const imageInput = document.getElementById('imageInput');
    const controlsSection = document.getElementById('controlsSection');
    const processButton = document.getElementById('processButton');
    const downloadLink = document.getElementById('downloadLink');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');

    let overlayImage = null;
    let overlayX = 0;
    let overlayY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    // Handle Video Upload
    videoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            if (file.size > 500 * 1024 * 1024) { // 500MB limit
                alert('Please upload a video smaller than 500MB.');
                return;
            }
            const videoURL = URL.createObjectURL(file);
            videoPlayer.src = videoURL;
            videoContainer.classList.remove('hidden');
            imageUploadSection.classList.remove('hidden');
            controlsSection.classList.add('hidden');
            downloadLink.classList.add('hidden');
            errorMessage.classList.add('hidden');
        } else {
            alert('Please upload a valid video file.');
        }
    });

    // Handle Video Metadata Loaded
    videoPlayer.addEventListener('loadedmetadata', () => {
        overlayCanvas.width = videoPlayer.videoWidth;
        overlayCanvas.height = videoPlayer.videoHeight;
        overlayX = videoPlayer.videoWidth / 2 - 50; // Default position
        overlayY = videoPlayer.videoHeight / 2 - 50;
        drawOverlay();
    });

    // Handle Image Upload
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                overlayImage = new Image();
                overlayImage.onload = () => {
                    // Set default size (e.g., 100x100)
                    const scale = 100 / overlayImage.width;
                    overlayImage.width = 100;
                    overlayImage.height = overlayImage.height * scale;
                    // Initial position: center
                    overlayX = (videoPlayer.videoWidth - overlayImage.width) / 2;
                    overlayY = (videoPlayer.videoHeight - overlayImage.height) / 2;
                    drawOverlay();
                    controlsSection.classList.remove('hidden');
                    downloadLink.classList.add('hidden');
                };
                overlayImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a valid image file.');
        }
    });

    // Draw Overlay Image on Canvas
    function drawOverlay() {
        const ctx = overlayCanvas.getContext('2d');
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        if (overlayImage) {
            ctx.drawImage(overlayImage, overlayX, overlayY, overlayImage.width, overlayImage.height);
        }
    }

    // Handle Mouse Events for Dragging and Resizing
    overlayCanvas.addEventListener('mousedown', (e) => {
        if (overlayImage) {
            isDragging = true;
            const rect = overlayCanvas.getBoundingClientRect();
            dragStartX = e.clientX - rect.left - overlayX;
            dragStartY = e.clientY - rect.top - overlayY;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && overlayImage) {
            const rect = overlayCanvas.getBoundingClientRect();
            overlayX = e.clientX - rect.left - dragStartX;
            overlayY = e.clientY - rect.top - dragStartY;
            drawOverlay();
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Handle Touch Events for Mobile
    overlayCanvas.addEventListener('touchstart', (e) => {
        if (overlayImage) {
            isDragging = true;
            const touch = e.touches[0];
            const rect = overlayCanvas.getBoundingClientRect();
            dragStartX = touch.clientX - rect.left - overlayX;
            dragStartY = touch.clientY - rect.top - overlayY;
        }
    });

    overlayCanvas.addEventListener('touchmove', (e) => {
        if (isDragging && overlayImage) {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            const rect = overlayCanvas.getBoundingClientRect();
            overlayX = touch.clientX - rect.left - dragStartX;
            overlayY = touch.clientY - rect.top - dragStartY;
            drawOverlay();
        }
    }, { passive: false });

    overlayCanvas.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Handle Image Resizing via Keyboard (Arrow Keys + Shift for resizing)
    document.addEventListener('keydown', (e) => {
        if (overlayImage) {
            const step = 5;
            const resizeStep = 10;
            if (e.key === 'ArrowUp') {
                if (e.shiftKey) {
                    // Resize Up
                    overlayImage.height = Math.max(overlayImage.height - resizeStep, 20);
                } else {
                    // Move Up
                    overlayY = Math.max(overlayY - step, 0);
                }
                drawOverlay();
            }
            if (e.key === 'ArrowDown') {
                if (e.shiftKey) {
                    // Resize Down
                    overlayImage.height += resizeStep;
                } else {
                    // Move Down
                    overlayY += step;
                }
                drawOverlay();
            }
            if (e.key === 'ArrowLeft') {
                if (e.shiftKey) {
                    // Resize Left (width)
                    overlayImage.width = Math.max(overlayImage.width - resizeStep, 20);
                } else {
                    // Move Left
                    overlayX = Math.max(overlayX - step, 0);
                }
                drawOverlay();
            }
            if (e.key === 'ArrowRight') {
                if (e.shiftKey) {
                    // Resize Right (width)
                    overlayImage.width += resizeStep;
                } else {
                    // Move Right
                    overlayX += step;
                }
                drawOverlay();
            }
        }
    });

    // Handle Process Video Button Click
    processButton.addEventListener('click', async () => {
        if (!overlayImage) {
            alert('Please upload an overlay image.');
            return;
        }

        processButton.disabled = true;
        loading.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        try {
            // Create a canvas to combine video and overlay
            const combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = videoPlayer.videoWidth;
            combinedCanvas.height = videoPlayer.videoHeight;
            const ctx = combinedCanvas.getContext('2d');

            // Draw the initial frame
            ctx.drawImage(videoPlayer, 0, 0, combinedCanvas.width, combinedCanvas.height);
            ctx.drawImage(overlayImage, overlayX, overlayY, overlayImage.width, overlayImage.height);

            // Capture the canvas stream
            const stream = combinedCanvas.captureStream();
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = 'processed_video.webm';
                downloadLink.classList.remove('hidden');
                loading.classList.add('hidden');
                processButton.disabled = false;
            };

            mediaRecorder.start();

            // Iterate through each frame
            videoPlayer.currentTime = 0;

            videoPlayer.addEventListener('timeupdate', function update() {
                if (videoPlayer.ended) {
                    mediaRecorder.stop();
                    videoPlayer.removeEventListener('timeupdate', update);
                    return;
                }

                ctx.drawImage(videoPlayer, 0, 0, combinedCanvas.width, combinedCanvas.height);
                ctx.drawImage(overlayImage, overlayX, overlayY, overlayImage.width, overlayImage.height);
            });

            videoPlayer.play();
        } catch (error) {
            console.error('Error processing video:', error);
            errorMessage.classList.remove('hidden');
            loading.classList.add('hidden');
            processButton.disabled = false;
        }
    });
});
