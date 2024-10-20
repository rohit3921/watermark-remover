new Vue({
    el: '#app',
    data: {
        videoUploaded: false,
        imageUploaded: false,
        videoSrc: '',
        imageSrc: '',
        processedVideoUrl: '',
        overlayPosition: { x: 50, y: 50 }, // Default position
        isDragging: false,
        imageScale: 1,
        originalImageSize: { width: 0, height: 0 },
        img: null // Store the image object globally in data
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
                    this.img = new Image();
                    this.img.onload = () => {
                        this.originalImageSize = { width: this.img.width, height: this.img.height };
                        this.setupCanvas();
                    };
                    this.img.src = this.imageSrc;
                };
                reader.readAsDataURL(file);
            }
        },
        setupCanvas() {
            if (!this.$refs.video || !this.img) return;
            this.$refs.canvas.width = this.$refs.video.videoWidth;
            this.$refs.canvas.height = this.$refs.video.videoHeight;
            this.drawOverlay();
        },
        drawOverlay() {
            if (!this.img) return;
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scaledWidth = this.originalImageSize.width * this.imageScale;
            const scaledHeight = this.originalImageSize.height * this.imageScale;
            ctx.drawImage(this.img, this.overlayPosition.x, this.overlayPosition.y, scaledWidth, scaledHeight);
        },
        startDrag(event) {
            this.isDragging = true;
            this.updatePosition(event);
        },
        drag(event) {
            if (this.isDragging) {
                event.preventDefault(); // Prevent default to avoid any unwanted behavior while dragging
                this.updatePosition(event);
            }
        },
        stopDrag() {
            this.isDragging = false;
        },
        updatePosition(event) {
            const canvas = this.$refs.canvas;
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX || event.touches[0].clientX) - rect.left;
            const y = (event.clientY || event.touches[0].clientY) - rect.top;
            this.overlayPosition = { x, y };
            this.drawOverlay();
        },
        processVideo() {
            const video = this.$refs.video;
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');
            const stream = canvas.captureStream(); // Capture the stream from the canvas
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            let chunks = [];

            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                this.processedVideoUrl = URL.createObjectURL(blob);
                chunks = []; // Clear the chunks array
            };

            video.onplay = () => {
                const draw = () => {
                    if (!video.paused && !video.ended) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        ctx.drawImage(this.img, this.overlayPosition.x, this.overlayPosition.y, this.originalImageSize.width * this.imageScale, this.originalImageSize.height * this.imageScale);
                        requestAnimationFrame(draw);
                    }
                };
                draw();
                recorder.start();
            };

            video.onended = () => {
                recorder.stop();
            };

            video.currentTime = 0; // Start the video from the beginning
            video.play();
        }
    }
});
