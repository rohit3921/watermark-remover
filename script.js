document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoContainer = document.getElementById('videoContainer');
    const imageInput = document.getElementById('imageInput');
    const processButton = document.getElementById('processButton');
    const downloadLink = document.getElementById('downloadLink');

    videoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const videoURL = URL.createObjectURL(file);
            videoPlayer.src = videoURL;
            videoContainer.style.display = 'block';
            imageInput.style.display = 'block';
        }
    });

    imageInput.addEventListener('change', () => {
        processButton.style.display = 'block';
    });

    processButton.addEventListener('click', () => {
        // This is a placeholder for video processing
        // For now, it just enables the download link
        downloadLink.href = videoPlayer.src;
        downloadLink.download = 'video.mp4';
        downloadLink.style.display = 'block';
        alert('Video processed! (Not really, this is just a test)');
    });
});
