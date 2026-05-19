import { RENDERER_CONSTANTS } from './constants.js';

class WheelRenderer {
    constructor(canvas, options, images, geometry) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.options = options;
        this.images = images;
        this.geometry = geometry;
        this.winnerIndex = null;
        this.currentRotation = 0;
    }

    setWinner(index) {
        this.winnerIndex = index;
    }

    setRotation(rotationDegrees) {
        this.currentRotation = rotationDegrees;
    }

    drawWheel(rotationDegrees = this.currentRotation) {
        this.currentRotation = rotationDegrees;

        const { ctx, canvas, geometry } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawOuterShadow();

        ctx.save();
        ctx.translate(geometry.centerX, geometry.centerY);

        this.drawWoodenOuterFrame();

        ctx.save();
        ctx.rotate(geometry.degreesToRadians(rotationDegrees));

        for (let index = 0; index < geometry.sectorCount; index++) {
            this.drawSector(index);
        }

        this.drawSectorTexture();
        ctx.restore();

        this.drawInnerRings();
        this.drawCenterCircle();
        this.drawVignette();

        ctx.restore();
    }

    drawSector(index) {
        const { ctx, options, geometry } = this;

        const startAngle = -Math.PI / 2 - geometry.sectorAngle / 2 + index * geometry.sectorAngle;
        const endAngle = startAngle + geometry.sectorAngle;
        const middleAngle = startAngle + geometry.sectorAngle / 2;

        const isWinner = index === this.winnerIndex;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, geometry.sectorRadius, startAngle, endAngle);
        ctx.closePath();

        const gradient = ctx.createRadialGradient(0, 0, 30, 0, 0, geometry.sectorRadius);
        gradient.addColorStop(RENDERER_CONSTANTS.GRADIENT_STOPS[0], index % 2 === 0 ? "#b67c42" : "#d0a06d");
        gradient.addColorStop(RENDERER_CONSTANTS.GRADIENT_STOPS[1], index % 2 === 0 ? "#95613a" : "#bd8f5f");
        gradient.addColorStop(RENDERER_CONSTANTS.GRADIENT_STOPS[2], index % 2 === 0 ? "#744728" : "#9d6b42");

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 245, 220, 0.78)";
        ctx.lineWidth = RENDERER_CONSTANTS.DEFAULT_LINE_WIDTH;
        ctx.stroke();

        if (isWinner) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, geometry.sectorRadius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = "rgba(255, 215, 0, 0.34)";
            ctx.fill();

            ctx.strokeStyle = "rgba(255, 245, 120, 0.95)";
            ctx.lineWidth = RENDERER_CONSTANTS.HIGHLIGHT_LINE_WIDTH;
            ctx.stroke();
            ctx.restore();
        }

        if (options[index].image) {
            this.drawMapImage(index, middleAngle, isWinner);
        }
        this.drawMapName(options[index].name, middleAngle);
    }

    drawMapImage(index, angle, isWinner) {
        const { ctx, geometry, images } = this;
        const image = images[index];

        const imageWidth = isWinner ? RENDERER_CONSTANTS.IMAGE_SIZE.WINNER.width : RENDERER_CONSTANTS.IMAGE_SIZE.NORMAL.width;
        const imageHeight = isWinner ? RENDERER_CONSTANTS.IMAGE_SIZE.WINNER.height : RENDERER_CONSTANTS.IMAGE_SIZE.NORMAL.height;

        const imageDistanceFromCenter = geometry.sectorRadius * RENDERER_CONSTANTS.IMAGE_DISTANCE_FACTOR;
        const imageX = Math.cos(angle) * imageDistanceFromCenter;
        const imageY = Math.sin(angle) * imageDistanceFromCenter;

        ctx.save();
        ctx.translate(imageX, imageY);
        ctx.rotate(-geometry.degreesToRadians(this.currentRotation));

        ctx.shadowColor = isWinner ? "rgba(255, 215, 0, 0.95)" : "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = isWinner ? 20 : 8;
        ctx.shadowOffsetY = isWinner ? 0 : 4;

        this.roundRect(
            -imageWidth / 2 - 4,
            -imageHeight / 2 - 4,
            imageWidth + 8,
            imageHeight + 8,
            8
        );
        ctx.fillStyle = isWinner ? "#fff1a8" : "rgba(255, 248, 225, 0.94)";
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        if (image.complete && image.naturalWidth > 0) {
            ctx.save();
            this.roundRect(
                -imageWidth / 2,
                -imageHeight / 2,
                imageWidth,
                imageHeight,
                6
            );
            ctx.clip();

            ctx.drawImage(
                image,
                -imageWidth / 2,
                -imageHeight / 2,
                imageWidth,
                imageHeight
            );

            ctx.restore();
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
        }

        ctx.lineWidth = isWinner ? 4 : 2;
        ctx.strokeStyle = isWinner ? "#ffd700" : "#ffffff";

        this.roundRect(
            -imageWidth / 2,
            -imageHeight / 2,
            imageWidth,
            imageHeight,
            6
        );

        ctx.stroke();
        ctx.restore();
    }

    drawMapName(name, angle) {
        const { ctx, geometry } = this;

        const textDistanceFromCenter = geometry.sectorRadius * 0.62;
        const textX = Math.cos(angle) * textDistanceFromCenter;
        const textY = Math.sin(angle) * textDistanceFromCenter;

        const lines = this.splitTextIntoLines(name);
        const fontSize = this.canvas.width >= 500 ? 20 : 14;
        const lineHeight = fontSize + 2;
        const maxTextWidth = Math.max(
            70,
            geometry.sectorRadius * Math.sin(geometry.sectorAngle / 2) * 0.9
        );

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(-geometry.degreesToRadians(this.currentRotation));

        ctx.font = `bold ${fontSize}px Georgia`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const firstLineY = -((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, index) => {
            const y = firstLineY + index * lineHeight;

            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(45, 25, 12, 0.92)";
            ctx.strokeText(line, 0, y, maxTextWidth);

            ctx.fillStyle = "#fff8df";
            ctx.fillText(line, 0, y, maxTextWidth);
        });

        ctx.restore();
    }

    splitTextIntoLines(text) {
        const words = text.split(" ");

        if (words.length === 1) {
            return [text];
        }

        if (words.length === 2) {
            return words;
        }

        const middle = Math.ceil(words.length / 2);

        return [
            words.slice(0, middle).join(" "),
            words.slice(middle).join(" "),
        ];
    }

    drawCenterCircle() {
        const { ctx, geometry } = this;

        ctx.save();

        ctx.beginPath();
        ctx.arc(0, 0, geometry.innerRingRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#4b2e1e";
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        const goldGradient = ctx.createRadialGradient(-8, -8, 4, 0, 0, 28);
        goldGradient.addColorStop(0, "#fff6a8");
        goldGradient.addColorStop(0.45, "#ffd21f");
        goldGradient.addColorStop(1, "#b77800");

        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fillStyle = goldGradient;
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff1a0";
        ctx.stroke();

        ctx.restore();
    }

    drawOuterShadow() {
        const { ctx, geometry } = this;

        ctx.save();
        ctx.translate(geometry.centerX, geometry.centerY);

        ctx.beginPath();
        ctx.arc(0, 0, geometry.wheelRadius + 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.48)";
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 12;
        ctx.fill();

        ctx.restore();
    }

    drawWoodenOuterFrame() {
        const { ctx, geometry } = this;

        const frameGradient = ctx.createRadialGradient(
            0,
            0,
            geometry.sectorRadius,
            0,
            0,
            geometry.wheelRadius
        );

        frameGradient.addColorStop(0, "#8b5a34");
        frameGradient.addColorStop(0.45, "#5a351f");
        frameGradient.addColorStop(0.72, "#7a4a2a");
        frameGradient.addColorStop(1, "#3b2112");

        ctx.beginPath();
        ctx.arc(0, 0, geometry.wheelRadius, 0, Math.PI * 2);
        ctx.fillStyle = frameGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, geometry.sectorRadius + 6, 0, Math.PI * 2);
        ctx.fillStyle = "#8b5e3c";
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255, 224, 150, 0.45)";
        ctx.stroke();
    }

    drawInnerRings() {
        const { ctx, geometry } = this;

        ctx.save();

        ctx.beginPath();
        ctx.arc(0, 0, geometry.sectorRadius + 7, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(255, 224, 150, 0.72)";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, geometry.sectorRadius - 2, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(75, 46, 30, 0.72)";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, geometry.innerRingRadius + 7, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255, 224, 150, 0.78)";
        ctx.stroke();

        ctx.restore();
    }

    drawSectorTexture() {
        const { ctx, geometry } = this;

        ctx.save();

        ctx.globalAlpha = 0.11;
        ctx.strokeStyle = "#fff4c2";
        ctx.lineWidth = 1;

        for (let i = 0; i < 34; i++) {
            const angle = (Math.PI * 2 * i) / 34;
            const start = geometry.innerRingRadius + 24 + (i % 3) * 8;
            const end = geometry.sectorRadius - 18 - (i % 4) * 5;

            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * start, Math.sin(angle) * start);
            ctx.lineTo(Math.cos(angle + 0.04) * end, Math.sin(angle + 0.04) * end);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawVignette() {
        const { ctx, geometry } = this;

        ctx.save();

        const vignette = ctx.createRadialGradient(
            0,
            0,
            geometry.sectorRadius * 0.25,
            0,
            0,
            geometry.sectorRadius
        );

        vignette.addColorStop(0, "rgba(255, 255, 255, 0.04)");
        vignette.addColorStop(0.65, "rgba(0, 0, 0, 0)");
        vignette.addColorStop(1, "rgba(0, 0, 0, 0.24)");

        ctx.beginPath();
        ctx.arc(0, 0, geometry.sectorRadius, 0, Math.PI * 2);
        ctx.fillStyle = vignette;
        ctx.fill();

        ctx.restore();
    }

    roundRect(x, y, width, height, radiusValue) {
        const { ctx } = this;

        ctx.beginPath();
        ctx.moveTo(x + radiusValue, y);
        ctx.lineTo(x + width - radiusValue, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radiusValue);
        ctx.lineTo(x + width, y + height - radiusValue);
        ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radiusValue,
            y + height
        );
        ctx.lineTo(x + radiusValue, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radiusValue);
        ctx.lineTo(x, y + radiusValue);
        ctx.quadraticCurveTo(x, y, x + radiusValue, y);
        ctx.closePath();
    }
}

export default WheelRenderer;
