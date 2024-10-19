   document.addEventListener('DOMContentLoaded', () => {
       const videoInput = document.getElementById('videoInput');
       const videoPlayer = document.getElementById('videoPlayer');
       const videoContainer = document.getElementById('videoContainer');
       const imageInput = document.getElementById('imageInput');
       const processButton = document.getElementById('processButton');

       videoInput.addEventListener('change', (e) => {
           const file = e.target.files[0];
           if (file && file.type.startsWith('video/')) {
               const videoURL = URL.createObjectURL(file);
               videoPlayer.src = videoURL;
               videoContainer.style.display = 'block';
               imageInput.style.display = 'block';
           } else {
               alert('Please upload a valid video file.');
           }
       });

       imageInput.addEventListener('change', () => {
           processButton.style.display = 'block';
       });

       processButton.addEventListener('click', () => {
           alert('Video processed! (Not really, this is just a test)');
       });
   });
