interface Point {
  x: number;
  y: number;
}

export class HexagonCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private startX: number = 0;
  private startY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context");
    }
    this.ctx = context;

    // Set up canvas sizing and initial draw
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    this.setStrokeStyle("black");
    this.setLineWidth(12);
    this.drawHexagonGrid(
      this.canvas.width / 2,
      this.canvas.height / 2,
      50,
      8,
      8,
      0,
    );

    // Attach event listeners for panning
    this.attachEventListeners();
  }

  private resizeCanvas(): void {
    // Set the canvas width and height to the CSS size of the element
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    // Clear the canvas and redraw everything
    this.clear();
    this.drawHexagonGrid(
      this.canvas.width / 2,
      this.canvas.height / 2,
      50,
      8,
      8,
      0,
    );
  }

  private attachEventListeners(): void {
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.onMouseUp());
    this.canvas.addEventListener("mouseleave", () => this.onMouseUp());
    this.canvas.addEventListener("mousemove", (event) =>
      this.onMouseHover(event),
    );
  }

  private onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    // Store the starting mouse position
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    // Store the initial canvas offset
    this.startX = this.offsetX;
    this.startY = this.offsetY;
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      // Calculate the difference in mouse movement
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;

      // Update the offset
      this.offsetX = this.startX + deltaX;
      this.offsetY = this.startY + deltaY;

      // Redraw the hexagons with the new offset
      this.clear();
      this.drawHexagonGrid(
        this.canvas.width / 2 + this.offsetX,
        this.canvas.height / 2 + this.offsetY,
        50,
        8,
        8,
        0,
      );
    }
  }

  private onMouseUp(): void {
    this.isDragging = false;
  }

  private createPoint(x: number, y: number): Point {
    return { x, y };
  }

  private createPolygon(
    sides: number,
    radius: number,
    rotation: number = 0,
  ): Point[] {
    const path: Point[] = [];
    const step = (Math.PI * 2) / sides;
    for (let i = 0; i < sides; i++) {
      const angle = i * step + rotation;
      path.push(
        this.createPoint(Math.cos(angle) * radius, Math.sin(angle) * radius),
      );
    }
    return path;
  }

  private drawHexagon(
    centerX: number,
    centerY: number,
    size: number,
    cornerRadius: number,
    fillStyle: string,
    strokeStyle: string = "black",
    lineWidth: number = 2,
  ): void {
    if (!this.ctx) {
      console.error("Canvas context is not initialized");
      return;
    }

    const hexagon = this.createPolygon(6, size);

    this.ctx.save();
    this.ctx.translate(centerX, centerY);

    this.ctx.beginPath();

    for (let i = 0; i <= hexagon.length; i++) {
      const p1 = hexagon[i % hexagon.length];
      const p2 = hexagon[(i + 1) % hexagon.length];
      if (i === 0) {
        this.ctx.moveTo((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
      } else {
        this.ctx.arcTo(
          p1.x,
          p1.y,
          (p1.x + p2.x) / 2,
          (p1.y + p2.y) / 2,
          cornerRadius,
        );
      }
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

  public drawHexagonGrid(
    centerX: number,
    centerY: number,
    hexSize: number,
    gridWidth: number,
    gridHeight: number,
    gutter: number,
  ): void {
    const hexHeight = Math.sqrt(3) * hexSize; // Height of a hexagon
    const hexWidth = 2 * hexSize; // Width of a hexagon
    const horizontalSpacing = hexWidth * 0.75; // 75% of hex width for horizontal spacing
    const verticalSpacing = hexHeight; // Vertical spacing is the height of the hexagon

    for (let row = -gridHeight; row <= gridHeight; row++) {
      for (let col = -gridWidth; col <= gridWidth; col++) {
        // Calculate x and y position for each hexagon, centering them around centerX and centerY
        const x = centerX + col * horizontalSpacing;
        const y =
          centerY +
          row * verticalSpacing +
          (col % 2 === 0 ? 0 : verticalSpacing / 2);

        // Use a different color for alternating hexagons for better visualization
        let fillStyle = "#333"; // Default fill color
        if ((row + col) % 2 === 0) {
          fillStyle = "#61dafb"; // Alternate color
        }

        // Draw the hexagon
        this.drawHexagon(x, y, hexSize, 12, fillStyle);
      }
    }
  }

  private hoveredHex: { row: number; col: number } | null = null;

  private attachHoverEvent(): void {
    this.canvas.addEventListener("mousemove", (event) =>
      this.onMouseHover(event),
    );
  }

  private onMouseHover(event: MouseEvent): void {
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
    const r = Math.round(
      (offsetY - (q % 2 === 0 ? 0 : verticalSpacing / 2)) / verticalSpacing,
    );

    // Calculate the unique hexagon number based on axial coordinates
    const hexNumber = this.calculateHexNumber(q, r);

    // If the hovered hexagon is the same as the previously hovered one, do nothing
    if (
      this.hoveredHex &&
      this.hoveredHex.row === r &&
      this.hoveredHex.col === q
    ) {
      return;
    }

    // Redraw the previously hovered hexagon (restore its original state)
    if (this.hoveredHex) {
      this.redrawHexagon(this.hoveredHex.row, this.hoveredHex.col, hexSize);
    }

    // Draw the new hovered hexagon with a different color
    const centerX =
      this.canvas.width / 2 + this.offsetX + q * horizontalSpacing;
    const centerY =
      this.canvas.height / 2 +
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
  private calculateHexNumber(q: number, r: number): number {
    // Assume that the center (0, 0) is number 0 and numbers increase from left to right
    // Example numbering convention: Left of center is -1, Right of center is +1, etc.
    return q + r * 100; // Adjust this formula as needed for your numbering scheme
  }

  // Helper function to display hexagon number inside the hexagon
  private displayHexNumber(
    centerX: number,
    centerY: number,
    number: number,
  ): void {
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(number.toString(), centerX, centerY);
  }

  // Helper function to redraw the hexagon with its original color
  private redrawHexagon(row: number, col: number, hexSize: number): void {
    const hexHeight = Math.sqrt(3) * hexSize;
    const hexWidth = 2 * hexSize;
    const horizontalSpacing = hexWidth * 0.75;
    const verticalSpacing = hexHeight;

    const centerX =
      this.canvas.width / 2 + this.offsetX + col * horizontalSpacing;
    const centerY =
      this.canvas.height / 2 +
      this.offsetY +
      row * verticalSpacing +
      (col % 2 ? verticalSpacing / 2 : 0);

    // Use the original fill color here; adjust logic as needed
    const originalFillStyle = (row + col) % 2 === 0 ? "#333" : "#61dafb";

    this.drawHexagon(centerX, centerY, hexSize, 12, originalFillStyle); // Redraw the hexagon with its original color

    // Optionally re-display the hexagon number after redrawing
    const hexNumber = this.calculateHexNumber(col, row);
    this.displayHexNumber(centerX, centerY, hexNumber);
  }

  public clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public setStrokeStyle(style: string): void {
    this.ctx.strokeStyle = style;
  }

  public setLineWidth(width: number): void {
    this.ctx.lineWidth = width;
  }

  public get width(): number {
    return this.canvas.width;
  }

  public get height(): number {
    return this.canvas.height;
  }
}
