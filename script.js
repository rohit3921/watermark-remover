document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoContainer = document.getElementById('videoContainer');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const imageInput = document.getElementById('imageInput');
    const processButton = document.getElementById('processButton');
    const downloadLink = document.getElementById('downloadLink');

    let overlayImage = null;
    let overlayX = 0;
    let overlayY = 0;

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
        e.preventDefault();
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

        ctx.drawImage(videoPlayer, 0, 0);
        ctx.drawImage(overlayImage, overlayX, overlayY);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = 'processed_frame.png';
            downloadLink.style.display = 'block';
            alert('Frame processed! Click the download link to save the image.');
        }, 'image/png');
    });
});
