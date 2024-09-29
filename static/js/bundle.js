"use strict";
(() => {
  // hexGrid.ts
  var HexagonCanvas = class {
    constructor(canvas) {
      this.isDragging = false;
      this.lastMouseX = 0;
      this.lastMouseY = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.startX = 0;
      this.startY = 0;
      this.hoveredHex = null;
      this.canvas = canvas;
      const context = this.canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not get 2D context");
      }
      this.ctx = context;
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
        0
      );
      this.attachEventListeners();
    }
    resizeCanvas() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      this.clear();
      this.drawHexagonGrid(
        this.canvas.width / 2,
        this.canvas.height / 2,
        50,
        8,
        8,
        0
      );
    }
    attachEventListeners() {
      this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
      this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
      this.canvas.addEventListener("mouseup", () => this.onMouseUp());
      this.canvas.addEventListener("mouseleave", () => this.onMouseUp());
      this.canvas.addEventListener(
        "mousemove",
        (event) => this.onMouseHover(event)
      );
    }
    onMouseDown(event) {
      this.isDragging = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      this.startX = this.offsetX;
      this.startY = this.offsetY;
    }
    onMouseMove(event) {
      if (this.isDragging) {
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        this.offsetX = this.startX + deltaX;
        this.offsetY = this.startY + deltaY;
        this.clear();
        this.drawHexagonGrid(
          this.canvas.width / 2 + this.offsetX,
          this.canvas.height / 2 + this.offsetY,
          50,
          8,
          8,
          0
        );
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
      const step = Math.PI * 2 / sides;
      for (let i = 0; i < sides; i++) {
        const angle = i * step + rotation;
        path.push(
          this.createPoint(Math.cos(angle) * radius, Math.sin(angle) * radius)
        );
      }
      return path;
    }
    drawHexagon(centerX, centerY, size, cornerRadius, fillStyle, strokeStyle = "black", lineWidth = 2) {
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
            cornerRadius
          );
        }
      }
      this.ctx.closePath();
      this.ctx.fillStyle = fillStyle || this.ctx.fillStyle;
      this.ctx.fill();
      this.ctx.lineWidth = lineWidth || this.ctx.lineWidth;
      this.ctx.strokeStyle = strokeStyle || this.ctx.strokeStyle;
      this.ctx.stroke();
      this.ctx.restore();
    }
    drawHexagonGrid(centerX, centerY, hexSize, gridWidth, gridHeight, gutter) {
      const hexHeight = Math.sqrt(3) * hexSize;
      const hexWidth = 2 * hexSize;
      const horizontalSpacing = hexWidth * 0.75;
      const verticalSpacing = hexHeight;
      for (let row = -gridHeight; row <= gridHeight; row++) {
        for (let col = -gridWidth; col <= gridWidth; col++) {
          const x = centerX + col * horizontalSpacing;
          const y = centerY + row * verticalSpacing + (col % 2 === 0 ? 0 : verticalSpacing / 2);
          let fillStyle = "#333";
          if ((row + col) % 2 === 0) {
            fillStyle = "#61dafb";
          }
          this.drawHexagon(x, y, hexSize, 12, fillStyle);
        }
      }
    }
    attachHoverEvent() {
      this.canvas.addEventListener(
        "mousemove",
        (event) => this.onMouseHover(event)
      );
    }
    onMouseHover(event) {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;
      const hexSize = 50;
      const hexHeight = Math.sqrt(3) * hexSize;
      const hexWidth = 2 * hexSize;
      const horizontalSpacing = hexWidth * 0.75;
      const verticalSpacing = hexHeight;
      const offsetX = mouseX - this.canvas.width / 2 - this.offsetX;
      const offsetY = mouseY - this.canvas.height / 2 - this.offsetY;
      const q = Math.round(offsetX / horizontalSpacing);
      const r = Math.round(
        (offsetY - (q % 2 === 0 ? 0 : verticalSpacing / 2)) / verticalSpacing
      );
      const hexNumber = this.calculateHexNumber(q, r);
      if (this.hoveredHex && this.hoveredHex.row === r && this.hoveredHex.col === q) {
        return;
      }
      if (this.hoveredHex) {
        this.redrawHexagon(this.hoveredHex.row, this.hoveredHex.col, hexSize);
      }
      const centerX = this.canvas.width / 2 + this.offsetX + q * horizontalSpacing;
      const centerY = this.canvas.height / 2 + this.offsetY + r * verticalSpacing + (q % 2 === 0 ? 0 : verticalSpacing / 2);
      this.drawHexagon(centerX, centerY, hexSize, 12, "#FF0000");
      this.displayHexNumber(centerX, centerY, hexNumber);
      this.hoveredHex = { row: r, col: q };
    }
    // Helper function to calculate the unique hexagon number based on axial coordinates (q, r)
    calculateHexNumber(q, r) {
      return q + r * 100;
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
      const hexHeight = Math.sqrt(3) * hexSize;
      const hexWidth = 2 * hexSize;
      const horizontalSpacing = hexWidth * 0.75;
      const verticalSpacing = hexHeight;
      const centerX = this.canvas.width / 2 + this.offsetX + col * horizontalSpacing;
      const centerY = this.canvas.height / 2 + this.offsetY + row * verticalSpacing + (col % 2 ? verticalSpacing / 2 : 0);
      const originalFillStyle = (row + col) % 2 === 0 ? "#333" : "#61dafb";
      this.drawHexagon(centerX, centerY, hexSize, 12, originalFillStyle);
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
  };

  // index.ts
  window.alexdunmow = {
    get: function(id) {
      const el = document.getElementById(id);
      if (!el) {
        throw new Error(`Element with id ${id} not found`);
      }
      return el;
    },
    initHTMX: function() {
      document.body.addEventListener(
        "htmx:beforeSwap",
        (event) => {
          if (event.detail.target.id === "main-content") {
            const newActiveLink = event.detail.pathInfo.finalResponsePath.substring(1) || "home";
            window.htmx.ajax(
              "GET",
              `/api/sidebar?activeLink=${newActiveLink}`,
              "#sidebar-container"
            );
          }
        }
      );
      document.body.addEventListener(
        "htmx:afterSettle",
        (event) => {
          if (event.detail.target.id === "main-content") {
            const newActiveLink = window.location.pathname.substring(1) || "home";
            window.htmx.ajax(
              "GET",
              `/api/sidebar?activeLink=${newActiveLink}`,
              "#sidebar-container"
            );
          }
        }
      );
    },
    init: function() {
      console.log("hey, welcome to my website!");
    },
    initSidebar: function() {
      const themeSwitcher = document.getElementById("theme-switcher");
      if (!themeSwitcher) return;
      themeSwitcher.addEventListener("click", function() {
        document.body.classList.toggle("dark");
      });
    },
    initChatSidebar: function() {
      const chatInput = alexdunmow.get("chat-input");
      const sendMessageButton = alexdunmow.get("send-message");
      sendMessageButton.addEventListener("click", function() {
        const message = chatInput.value;
        if (message) {
          const chatMessagesContainer = alexdunmow.get("chat-messages");
          chatMessagesContainer.innerHTML += `
            <div class="bg-accent p-2 rounded-lg shadow self-end text-primary">
                <p class="text-sm"><strong>You:</strong> ${message}</p>
            </div>
        `;
          chatInput.value = "";
          chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
      });
    },
    initSkillTree: function(canvasElement) {
      const hexCanvas = new HexagonCanvas(canvasElement);
      console.log(`Canvas dimensions: ${hexCanvas.width}x${hexCanvas.height}`);
    }
  };
  window.alexdunmow.initHTMX();
  window.alexdunmow.init();
})();
