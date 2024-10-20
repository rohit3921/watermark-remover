new Vue({
    el: '#app',
    data: {
        videoUploaded: false,
        imageUploaded: false,
        videoSrc: '',
        imageSrc: '',
        processedVideoUrl: '',
        overlayPosition: { x: 0, y: 0 },
        isDragging: false,
        imageScale: 1,
        originalImageSize: { width: 0, height: 0 }
    },
    methods: {
        uploadVideo(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('video/')) {
                this.videoSrc = URL.createObjectURL(file);
                this.videoUploaded = true;
            }
        },
        uploadImage(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.imageSrc = e.target.result;
                    this.imageUploaded = true;
                    const img = new Image();
                    img.onload = () => {
                        this.originalImageSize = { width: img.width, height: img.height };
                        this.$nextTick(() => {
                            this.drawOverlay();
                        });
                    };
                    img.src = this.imageSrc;
                };
                reader.readAsDataURL(file);
            }
        },
        drawOverlay() {
            const video = this.$refs.video;
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const img = new Image();
            img.onload = () => {
                const scaledWidth = this.originalImageSize.width * this.imageScale;
                const scaledHeight = this.originalImageSize.height * this.imageScale;
                ctx.drawImage(img, this.overlayPosition.x, this.overlayPosition.y, scaledWidth, scaledHeight);
            };
            img.src = this.imageSrc;
        },
        startDrag(event) {
            this.isDragging = true;
            const canvas = this.$refs.canvas;
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX || event.touches[0].clientX) - rect.left;
            const y = (event.clientY || event.touches[0].clientY) - rect.top;
            this.overlayPosition = { x, y };
            this.drawOverlay();
        },
        drag(event) {
            if (this.isDragging) {
                event.preventDefault();
                const canvas = this.$refs.canvas;
                const rect = canvas.getBoundingClientRect();
                const x = (event.clientX || event.touches[0].clientX) - rect.left;
                const y = (event.clientY || event.touches[0].clientY) - rect.top;
                this.overlayPosition = { x, y };
                this.drawOverlay();
            }
        },
        stopDrag() {
            this.isDragging = false;
        },
        updateOverlay() {
            this.drawOverlay();
        },
        processVideo() {
            const video = this.$refs.video;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const stream = canvas.captureStream();
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                this.processedVideoUrl = URL.createObjectURL(blob);
            };

            mediaRecorder.start();
            video.currentTime = 0;
            video.play();

            const processFrame = () => {
                if (video.ended) {
                    mediaRecorder.stop();
                    video.pause();
                    return;
                }
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const img = new Image();
                img.onload = () => {
                    const scaledWidth = this.originalImageSize.width * this.imageScale;
                    const scaledHeight = this.originalImageSize.height * this.imageScale;
                    ctx.drawImage(img, this.overlayPosition.x, this.overlayPosition.y, scaledWidth, scaledHeight);
                    requestAnimationFrame(processFrame);
                };
                img.src = this.imageSrc;
            };

            processFrame();
        }
    },
    mounted() {
        window.addEventListener('mousemove', this.drag);
        window.addEventListener('mouseup', this.stopDrag);
        window.addEventListener('touchmove', this.drag);
        window.addEventListener('touchend', this.stopDrag);
    },
    beforeDestroy() {
        window.removeEventListener('mousemove', this.drag);
        window.removeEventListener('mouseup', this.stopDrag);
        window.removeEventListener('touchmove', this.drag);
        window.removeEventListener('touchend', this.stopDrag);
    }
});
