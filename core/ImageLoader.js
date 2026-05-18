class ImageLoader {
    constructor(options) {
        this.options = options;
        this.images = this.createImages();
    }

    createImages() {
        return this.options.map((option) => {
            const image = new Image();
            image.src = option.image || "";
            return image;
        });
    }

    loadAll() {
        return Promise.all(
            this.images.map((image) => {
                return new Promise((resolve) => {
                    image.onload = resolve;
                    image.onerror = resolve;
                });
            })
        );
    }
}

export default ImageLoader;