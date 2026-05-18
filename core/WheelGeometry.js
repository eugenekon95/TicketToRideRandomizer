class WheelGeometry {
    constructor(canvas, count) {
        this.canvas = canvas;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.radius = canvas.width / 2;

        this.outerPadding = 10;
        this.wheelRadius = this.radius - this.outerPadding;
        this.sectorRadius = this.wheelRadius - 22;
        this.innerRingRadius = 46;

        this.sectorCount = count;
        this.sectorAngle = (Math.PI * 2) / this.sectorCount;
        this.sectorAngleDegrees = 360 / this.sectorCount;
    }

    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    normalizeDegrees(degrees) {
        return ((degrees % 360) + 360) % 360;
    }
}

export default WheelGeometry;