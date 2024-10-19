const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const app = Vue.createApp({
    data() {
        return {
            ffmpegLoaded: false,
            videoUploaded: false,
            imageUploaded: false,
            processing: false,
            processed: false,
            processedVideoUrl: null,
            overlayPosition: { x: 0, y: 0 },
            isDragging: false,
            dragStartPosition: { x: 0, y: 0 }
        };
    },
    async mounted() {
        await ffmpeg.load();
        this.ffmpegLoaded = true;
    },
    methods: {
        async onVideoUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('video/')) {
                const videoURL = URL.createObjectURL(file);
                this.$refs.videoPlayer.src = videoURL;
                this.videoUploaded = true;
                await ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
            } else {
                alert('Please upload a valid video file.');
            }
        },
        async onImageUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = this.$refs.overlayCanvas;
                        canvas.width = this.$refs.videoPlayer.videoWidth;
                        canvas.height = this.$refs.videoPlayer.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, 100, 100);
                        this.imageUploaded = true;
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
                await ffmpeg.FS('writeFile', 'overlay.png', await fetchFile(file));
            } else {
                alert('Please upload a valid image file.');
            }
        },
        startDrag(event) {
            this.isDragging = true;
            this.dragStartPosition = {
                x: event.clientX - this.overlayPosition.x,
                y: event.clientY - this.overlayPosition.y
            };
        },
        drag(event) {
            if (this.isDragging) {
                this.overlayPosition = {
                    x: event.clientX - this.dragStartPosition.x,
                    y: event.clientY - this.dragStartPosition.y
                };
                this.updateOverlay();
            }
        },
        stopDrag() {
            this.isDragging = false;
        },
        updateOverlay() {
            const canvas = this.$refs.overlayCanvas;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, this.overlayPosition.x, this.overlayPosition.y, 100, 100);
            };
            img.src = URL.createObjectURL(ffmpeg.FS('readFile', 'overlay.png'));
        },
        async processVideo() {
            this.processing = true;
            try {
                await ffmpeg.run(
                    '-i', 'input.mp4',
                    '-i', 'overlay.png',
                    '-filter_complex', `[1:v]scale=100:100[ovrl];[0:v][ovrl]overlay=${this.overlayPosition.x}:${this.overlayPosition.y}`,
                    '-c:a', 'copy',
                    'output.mp4'
                );
                const data = ffmpeg.FS('readFile', 'output.mp4');
                this.processedVideoUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
                this.processed = true;
            } catch (error) {
                console.error('Error processing video:', error);
                alert('An error occurred while processing the video. Please try again.');
            } finally {
                this.processing = false;
            }
        }
    }
});

app.mount('#app');
