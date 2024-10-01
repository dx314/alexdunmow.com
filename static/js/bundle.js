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
      this.resizeCanvas();
      window.addEventListener("resize", () => this.resizeCanvas());
      this.setStrokeStyle("black");
      this.setLineWidth(12);
      this.drawHexagonGrid(this.canvas.width / 2, this.canvas.height / 2, 50, 1);
      this.attachEventListeners();
    }
    resizeCanvas() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      this.clear();
      this.drawHexagonGrid(this.canvas.width / 2, this.canvas.height / 2, 50, 1);
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
          3
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
    drawHexagon(centerX, centerY, radius, cornerRadius, fillStyle, strokeStyle = "black", lineWidth = 2) {
      if (!this.ctx) {
        console.error("Canvas context is not initialized");
        return;
      }
      const TO_RADIANS = Math.PI / 180;
      const points = [];
      for (let i = 0; i <= 6; i++) {
        const angleDeg = i * 60 - 90;
        const angleRad = angleDeg * TO_RADIANS;
        const x = centerX + Math.cos(angleRad) * radius;
        const y = centerY + Math.sin(angleRad) * radius;
        points.push({ x, y });
      }
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        this.ctx.arcTo(
          p1.x,
          p1.y,
          p2.x,
          p2.y,
          cornerRadius
          // Use the specified corner radius
        );
      }
      this.ctx.closePath();
      this.ctx.fillStyle = fillStyle || this.ctx.fillStyle;
      this.ctx.fill();
      this.ctx.lineWidth = lineWidth || this.ctx.lineWidth;
      this.ctx.strokeStyle = strokeStyle || this.ctx.strokeStyle;
      this.ctx.stroke();
      this.ctx.restore();
    }
    drawHexagonGrid(centerX, centerY, hexSize, rings) {
      let hexNumber = 0;
      this.drawHexagon(
        centerX,
        centerY,
        hexSize,
        12,
        hexNumber % 2 === 0 ? "#61dafb" : "#333"
      );
      this.displayHexNumber(centerX, centerY, hexNumber++);
      const TO_RADIANS = Math.PI / 180;
      const rc = hexSize / 2 * Math.sqrt(3);
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
      if (q === 0 && r === 0) return 0;
      const s = -q - r;
      const x = q - r;
      const y = r * 2 + q;
      const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
      if (ring === 1) {
        if (q === 0 && r === -1) return 2;
        if (q === 1 && r === -1) return 3;
        if (q === 1 && r === 0) return 4;
        if (q === 0 && r === 1) return 5;
        if (q === -1 && r === 1) return 6;
        if (q === -1 && r === 0) return 1;
      }
      let number = 3 * ring * (ring - 1) + 2;
      if (y > x) {
        if (y > -x) number += 5 * ring - r - q;
        else number += 1 * ring - r;
      } else {
        if (y > -x) number += 3 * ring + r;
        else if (y < -x - ring) number += 7 * ring + r + q;
        else number += 9 * ring + r + q;
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
      const hexHeight = Math.sqrt(3) * hexSize;
      const hexWidth = 2 * hexSize;
      const horizontalSpacing = hexWidth * 0.75;
      const verticalSpacing = hexHeight;
      const centerX = this.canvas.width / 2 + this.offsetX + col * horizontalSpacing;
      const centerY = this.canvas.height / 2 + this.offsetY + row * verticalSpacing + (col % 2 === 1 ? verticalSpacing / 2 : 0);
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
          const path = event.detail.pathInfo.finalRequestPath;
          const links = document.getElementsByClassName("active-link");
          if (links) {
            Array.from(links).forEach((link) => {
              link.classList.remove("active-link");
            });
          }
          const activeLink = document.querySelector(
            `a.sidebar-link[href="${path}"]`
          );
          if (activeLink) {
            activeLink.classList.add("active-link");
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
