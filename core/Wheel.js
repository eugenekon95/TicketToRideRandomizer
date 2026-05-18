import WheelGeometry from './WheelGeometry.js';
import ImageLoader from './ImageLoader.js';
import WheelRenderer from './WheelRenderer.js';
import WheelSpinner from './WheelSpinner.js';

class Wheel {
    constructor({ canvas, options, spinButton, tickSound, winSound, resultElement, onResult }) {
        this.options = options;
        this.canvas = canvas;
        this.spinButton = spinButton;
        this.tickSound = tickSound;
        this.winSound = winSound;
        this.resultElement = resultElement;
        this.onResult = onResult;

        this.geometry = new WheelGeometry(this.canvas, this.options.length);
        this.imageLoader = new ImageLoader(this.options);
        this.renderer = new WheelRenderer(this.canvas, this.options, this.imageLoader.images, this.geometry);
        this.spinner = new WheelSpinner({
            options: this.options,
            geometry: this.geometry,
            renderer: this.renderer,
            spinButton: this.spinButton,
            tickSound: this.tickSound,
            winSound: this.winSound,
            resultElement: this.resultElement,
            onResult: this.onResult,
        });
    }

    start() {
        this.spinButton.addEventListener("click", () => {
            this.spinner.spin();
        });

        this.imageLoader.loadAll().then(() => {
            this.renderer.drawWheel();
        });
    }
}

export default Wheel;
