class WheelSpinner {
    constructor({ options, geometry, renderer, spinButton, tickSound, winSound, resultElement, onResult }) {
        this.options = options;
        this.geometry = geometry;
        this.renderer = renderer;
        this.spinButton = spinButton;
        this.tickSound = tickSound;
        this.winSound = winSound;
        this.resultElement = resultElement;
        this.onResult = onResult;

        this.currentRotation = 0;
        this.lastSector = -1;
        this.lastTickTime = 0;
        this.spinning = false;
        this.winnerIndex = null;
    }

    spin() {
        if (this.spinning) return;

        this.spinning = true;
        this.winnerIndex = null;
        this.lastSector = -1;
        this.resultElement.textContent = "";
        this.spinButton.disabled = true;
        this.renderer.setWinner(null);

        const randomIndex = Math.floor(Math.random() * this.geometry.sectorCount);
        const extraSpins = 360 * 12;

        const currentNormalizedRotation = this.geometry.normalizeDegrees(this.currentRotation);
        const targetNormalizedRotation = this.geometry.normalizeDegrees(
            -randomIndex * this.geometry.sectorAngleDegrees
        );

        const rotationDelta = this.geometry.normalizeDegrees(
            targetNormalizedRotation - currentNormalizedRotation
        );

        const startRotation = this.currentRotation;
        const targetRotation = this.currentRotation + extraSpins + rotationDelta;

        const duration = 9000;
        const start = performance.now();

        const animate = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeOutQuart(progress);

            this.currentRotation = startRotation + (targetRotation - startRotation) * eased;

            this.renderer.setRotation(this.currentRotation);
            this.renderer.drawWheel(this.currentRotation);
            this.playTickIfNeeded();

            if (progress < 1) {
                requestAnimationFrame(animate);
                return;
            }

            this.currentRotation = this.geometry.normalizeDegrees(targetRotation);
            this.winnerIndex = randomIndex;

            this.renderer.setRotation(this.currentRotation);
            this.renderer.setWinner(this.winnerIndex);
            this.renderer.drawWheel(this.currentRotation);
            this.showWinner(this.winnerIndex);

            this.spinning = false;
            this.spinButton.disabled = false;
        };

        requestAnimationFrame(animate);
    }

    playTickIfNeeded() {
        const normalizedRotation = this.geometry.normalizeDegrees(this.currentRotation);
        const sectorUnderPointer = this.getSectorUnderPointer(normalizedRotation);
        const now = performance.now();

        if (sectorUnderPointer !== this.lastSector && now - this.lastTickTime > 100) {
            this.tickSound.play();

            this.lastSector = sectorUnderPointer;
            this.lastTickTime = now;
        }
    }

    getSectorUnderPointer(rotationDegrees) {
        return Math.round(
            this.geometry.normalizeDegrees(-rotationDegrees) / this.geometry.sectorAngleDegrees
        ) % this.geometry.sectorCount;
    }

    showWinner(index) {
        this.winSound.currentTime = 0;
        this.winSound.play();

        if (this.onResult) {
            this.onResult(this.options[index]);
        } else {
            this.resultElement.textContent = `Tonight you'll start the: ${this.options[index].name} expansion`;
        }
    }

    easeOutQuart(value) {
        return 1 - Math.pow(1 - value, 4);
    }
}

export default WheelSpinner;