// script.js
document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const imageInput = document.getElementById('imageInput');
    const videoPlayer = document.getElementById('videoPlayer');
    const overlayImage = document.getElementById('overlayImage');
    const processButton = document.getElementById('processButton');
    const downloadLink = document.getElementById('downloadLink');

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    videoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        videoPlayer.src = URL.createObjectURL(file);
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        overlayImage.src = URL.createObjectURL(file);
    });

    overlayImage.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, overlayImage);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    processButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = videoPlayer.videoWidth;
        canvas.height = videoPlayer.videoHeight;

        ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(overlayImage, xOffset, yOffset, overlayImage.width, overlayImage.height);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = 'processed_video.webm';
            downloadLink.style.display = 'block';
        }, 'video/webm');
    });
});
