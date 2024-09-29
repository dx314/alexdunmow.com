"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HexagonCanvas = void 0;
class HexagonCanvas {
    constructor(canvas) {
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.startX = 0;
        this.startY = 0;
        this.TO_RADIANS = Math.PI / 180;
        this.hoveredHex = null;
        this.canvas = canvas;
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get 2D context");
        }
        this.ctx = context;
        const hexSize = 50;
        this.hexSize = hexSize;
        this.hexHeight = Math.sqrt(3) * hexSize;
        this.hexWidth = 2 * hexSize;
        this.horizontalSpacing = this.hexWidth * 0.75;
        this.verticalSpacing = this.hexHeight;
        // Set up canvas sizing and initial draw
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());
        this.setStrokeStyle("black");
        this.setLineWidth(12);
        this.drawHexagonGrid(this.canvas.width / 2, this.canvas.height / 2, 50, 1);
        // Attach event listeners for panning
        this.attachEventListeners();
    }
    resizeCanvas() {
        // Set the canvas width and height to the CSS size of the element
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        // Clear the canvas and redraw everything
        this.clear();
        this.drawHexagonGrid(this.canvas.width / 2, this.canvas.height / 2, 50, 1);
    }
    attachEventListeners() {
        this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
        this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
        this.canvas.addEventListener("mouseup", () => this.onMouseUp());
        this.canvas.addEventListener("mouseleave", () => this.onMouseUp());
        this.canvas.addEventListener("mousemove", (event) => this.onMouseHover(event));
    }
    onMouseDown(event) {
        this.isDragging = true;
        // Store the starting mouse position
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        // Store the initial canvas offset
        this.startX = this.offsetX;
        this.startY = this.offsetY;
    }
    onMouseMove(event) {
        if (this.isDragging) {
            // Calculate the difference in mouse movement
            const deltaX = event.clientX - this.lastMouseX;
            const deltaY = event.clientY - this.lastMouseY;
            // Update the offset
            this.offsetX = this.startX + deltaX;
            this.offsetY = this.startY + deltaY;
            // Redraw the hexagons with the new offset
            this.clear();
            this.drawHexagonGrid(this.canvas.width / 2 + this.offsetX, this.canvas.height / 2 + this.offsetY, 50, 3);
        }
    }
    onMouseUp() {
        this.isDragging = false;
    }
    createPoint(x, y) {
        return { x, y };
    }
    createPolygon(sides, radius, rotation = 0) {
        const path = [];
        const step = (Math.PI * 2) / sides;
        for (let i = 0; i < sides; i++) {
            const angle = i * step + rotation;
            path.push(this.createPoint(Math.cos(angle) * radius, Math.sin(angle) * radius));
        }
        return path;
    }
    drawHexagon(centerX, centerY, radius, cornerRadius, fillStyle, strokeStyle = "black", lineWidth = 2) {
        if (!this.ctx) {
            console.error("Canvas context is not initialized");
            return;
        }
        const TO_RADIANS = Math.PI / 180; // Convert degrees to radians
        // Calculate hexagon points
        const points = [];
        for (let i = 0; i <= 6; i++) {
            const angleDeg = i * 60 - 90; // Calculate the angle in degrees
            const angleRad = angleDeg * TO_RADIANS; // Convert to radians
            const x = centerX + Math.cos(angleRad) * radius;
            const y = centerY + Math.sin(angleRad) * radius;
            points.push({ x, y });
        }
        this.ctx.save();
        this.ctx.beginPath();
        // Move to the first point
        this.ctx.moveTo(points[0].x, points[0].y);
        // Draw hexagon with curved corners using `arcTo`
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length]; // Wrap around to the first point
            this.ctx.arcTo(p1.x, p1.y, p2.x, p2.y, cornerRadius);
        }
        this.ctx.closePath();
        // Fill the hexagon
        this.ctx.fillStyle = fillStyle || this.ctx.fillStyle;
        this.ctx.fill();
        // Stroke the hexagon
        this.ctx.lineWidth = lineWidth || this.ctx.lineWidth;
        this.ctx.strokeStyle = strokeStyle || this.ctx.strokeStyle;
        this.ctx.stroke();
        this.ctx.restore();
    }
    drawHexagonGrid(centerX, centerY, hexSize, rings) {
        let hexNumber = 0;
        this.drawHexagon(centerX, centerY, hexSize, 12, hexNumber % 2 === 0 ? "#61dafb" : "#333");
        this.displayHexNumber(centerX, centerY, hexNumber++);
        const TO_RADIANS = Math.PI / 180;
        const rc = (hexSize / 2) * Math.sqrt(3);
        for (let i = 1; i <= rings; i++) {
            for (let j = 0; j < 6; j++) {
                let currentX = centerX + Math.cos(j * 60 * TO_RADIANS) * rc * 2 * i;
                let currentY = centerY + Math.sin(j * 60 * TO_RADIANS) * rc * 2 * i;
                this.drawHexagon(currentX, currentY, hexSize, 12, "#2f0775");
                for (let k = 1; k < i; k++) {
                    let newX = currentX + Math.cos((j * 80 + 120) * TO_RADIANS) * rc * 2 * k;
                    let newY = currentY + Math.sin((j * 80 + 120) * TO_RADIANS) * rc * 2 * k;
                    this.drawHexagon(newX, newY, hexSize, 12, "#730451");
                }
            }
        }
    }
    attachHoverEvent() {
        this.canvas.addEventListener("mousemove", (event) => this.onMouseHover(event));
    }
    onMouseHover(event) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        // Define hexagon size and positioning
        const hexSize = 50;
        const hexHeight = Math.sqrt(3) * hexSize; // Height of a hexagon
        const hexWidth = 2 * hexSize; // Width of a hexagon
        const horizontalSpacing = hexWidth * 0.75; // Horizontal distance between adjacent hexagons
        const verticalSpacing = hexHeight; // Vertical distance between adjacent rows
        // Calculate the offset from the center of the canvas
        const offsetX = mouseX - this.canvas.width / 2 - this.offsetX;
        const offsetY = mouseY - this.canvas.height / 2 - this.offsetY;
        // Calculate approximate column and row index in hexagonal grid (axial coordinates)
        const q = Math.round(offsetX / horizontalSpacing);
        const r = Math.round((offsetY - (q % 2 === 0 ? 0 : verticalSpacing / 2)) / verticalSpacing);
        // Calculate the unique hexagon number based on axial coordinates
        const hexNumber = this.calculateHexNumber(q, r);
        // If the hovered hexagon is the same as the previously hovered one, do nothing
        if (this.hoveredHex &&
            this.hoveredHex.row === r &&
            this.hoveredHex.col === q) {
            return;
        }
        // Redraw the previously hovered hexagon (restore its original state)
        if (this.hoveredHex) {
            this.redrawHexagon(this.hoveredHex.row, this.hoveredHex.col, hexSize);
        }
        // Draw the new hovered hexagon with a different color
        const centerX = this.canvas.width / 2 + this.offsetX + q * horizontalSpacing;
        const centerY = this.canvas.height / 2 +
            this.offsetY +
            r * verticalSpacing +
            (q % 2 === 0 ? 0 : verticalSpacing / 2);
        this.drawHexagon(centerX, centerY, hexSize, 12, "#FF0000"); // Change the color to red when hovered
        // Display the hexagon number inside the hovered hexagon
        this.displayHexNumber(centerX, centerY, hexNumber);
        // Update the currently hovered hexagon
        this.hoveredHex = { row: r, col: q };
    }
    // Helper function to calculate the unique hexagon number based on axial coordinates (q, r)
    calculateHexNumber(q, r) {
        if (q === 0 && r === 0)
            return 0;
        const s = -q - r;
        const x = q - r;
        const y = r * 2 + q;
        const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
        if (ring === 1) {
            // Special case for the first ring
            if (q === 0 && r === -1)
                return 2;
            if (q === 1 && r === -1)
                return 3;
            if (q === 1 && r === 0)
                return 4;
            if (q === 0 && r === 1)
                return 5;
            if (q === -1 && r === 1)
                return 6;
            if (q === -1 && r === 0)
                return 1;
        }
        let number = 3 * ring * (ring - 1) + 2;
        if (y > x) {
            if (y > -x)
                number += 5 * ring - r - q;
            else
                number += 1 * ring - r;
        }
        else {
            if (y > -x)
                number += 3 * ring + r;
            else if (y < -x - ring)
                number += 7 * ring + r + q;
            else
                number += 9 * ring + r + q;
        }
        return number;
    }
    // Helper function to display hexagon number inside the hexagon
    displayHexNumber(centerX, centerY, number) {
        this.ctx.fillStyle = "white";
        this.ctx.font = "16px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(number.toString(), centerX, centerY);
    }
    // Helper function to redraw the hexagon with its original color
    redrawHexagon(row, col, hexSize) {
        // Calculate hexagon height and width
        const hexHeight = Math.sqrt(3) * hexSize;
        const hexWidth = 2 * hexSize;
        // Define horizontal and vertical spacing between hexagons
        const horizontalSpacing = hexWidth * 0.75; // 75% of hexWidth for horizontal spacing
        const verticalSpacing = hexHeight; // Full height for vertical spacing
        // Calculate center X and Y positions based on row and column
        const centerX = this.canvas.width / 2 + this.offsetX + col * horizontalSpacing;
        const centerY = this.canvas.height / 2 +
            this.offsetY +
            row * verticalSpacing +
            (col % 2 === 1 ? verticalSpacing / 2 : 0); // Offset Y position for odd columns
        // Set the fill color based on row and column
        const originalFillStyle = (row + col) % 2 === 0 ? "#333" : "#61dafb";
        // Draw the hexagon with curved corners (corner radius of 12)
        this.drawHexagon(centerX, centerY, hexSize, 12, originalFillStyle);
        // Optionally, display the hexagon number after redrawing
        const hexNumber = this.calculateHexNumber(col, row);
        this.displayHexNumber(centerX, centerY, hexNumber);
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    setStrokeStyle(style) {
        this.ctx.strokeStyle = style;
    }
    setLineWidth(width) {
        this.ctx.lineWidth = width;
    }
    get width() {
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }
}
exports.HexagonCanvas = HexagonCanvas;
