"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillTree = void 0;
class SkillTree {
    constructor(canvasId, skillsData) {
        this.rootSkill = "Technology Skills";
        this.nodeWidth = 200;
        this.nodeHeight = 50;
        this.levelHeight = 200;
        this.horizontalSpacing = 60;
        this.gutter = 20;
        this.canvasWidth = 1400;
        this.canvasHeight = 800;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.skills = skillsData;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.calculatePositions();
        this.setupEventListeners();
        this.draw();
    }
    calculatePositions(skill = this.rootSkill, level = 0, startX = 0) {
        const currentSkill = this.skills[skill];
        let totalWidth = this.nodeWidth;
        if (currentSkill.children.length > 0) {
            let childStartX = startX;
            const childrenWidths = currentSkill.children.map((childSkill) => {
                const childWidth = this.calculatePositions(childSkill, level + 1, childStartX);
                childStartX += childWidth + this.horizontalSpacing;
                return childWidth;
            });
            totalWidth = Math.max(this.nodeWidth, childrenWidths.reduce((a, b) => a + b, 0) +
                (childrenWidths.length - 1) * this.horizontalSpacing);
            const centerX = startX + totalWidth / 2;
            currentSkill.x = centerX;
            currentSkill.y = level * this.levelHeight;
            let childX = startX;
            currentSkill.children.forEach((childSkill, index) => {
                const childNode = this.skills[childSkill];
                childNode.x = childX + childrenWidths[index] / 2;
                childNode.y = (level + 1) * this.levelHeight;
                childX += childrenWidths[index] + this.horizontalSpacing;
            });
        }
        else {
            currentSkill.x = startX + this.nodeWidth / 2;
            currentSkill.y = level * this.levelHeight;
        }
        if (level === 0) {
            currentSkill.unlocked = true;
            this.canvasWidth = Math.max(this.canvasWidth, totalWidth + this.nodeWidth);
            this.canvas.width = this.canvasWidth;
        }
        return totalWidth;
    }
    setupEventListeners() {
        this.canvas.addEventListener("mousedown", this.startDragging.bind(this));
        this.canvas.addEventListener("mousemove", this.drag.bind(this));
        this.canvas.addEventListener("mouseup", this.stopDragging.bind(this));
        this.canvas.addEventListener("mouseleave", this.stopDragging.bind(this));
        this.canvas.addEventListener("click", this.handleClick.bind(this));
    }
    startDragging(event) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }
    drag(event) {
        if (!this.isDragging)
            return;
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        this.offsetX += deltaX;
        this.offsetY += deltaY;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.draw();
    }
    stopDragging() {
        this.isDragging = false;
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.drawConnections(this.rootSkill);
        this.drawNodes(this.rootSkill);
        this.ctx.restore();
    }
    drawConnections(skill) {
        const currentSkill = this.skills[skill];
        currentSkill.children.forEach((childSkill) => {
            const childNode = this.skills[childSkill];
            this.ctx.beginPath();
            this.ctx.moveTo(currentSkill.x, currentSkill.y + this.nodeHeight / 2);
            this.ctx.lineTo(childNode.x, childNode.y - this.nodeHeight / 2);
            this.ctx.strokeStyle = currentSkill.unlocked ? "#4CAF50" : "#999";
            this.ctx.stroke();
            this.drawConnections(childSkill);
        });
    }
    drawNodes(skill) {
        const currentSkill = this.skills[skill];
        const x = currentSkill.x - this.nodeWidth / 2;
        const y = currentSkill.y - this.nodeHeight / 2;
        // Draw rounded rectangle
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y);
        this.ctx.lineTo(x + this.nodeWidth - 10, y);
        this.ctx.quadraticCurveTo(x + this.nodeWidth, y, x + this.nodeWidth, y + 10);
        this.ctx.lineTo(x + this.nodeWidth, y + this.nodeHeight - 10);
        this.ctx.quadraticCurveTo(x + this.nodeWidth, y + this.nodeHeight, x + this.nodeWidth - 10, y + this.nodeHeight);
        this.ctx.lineTo(x + 10, y + this.nodeHeight);
        this.ctx.quadraticCurveTo(x, y + this.nodeHeight, x, y + this.nodeHeight - 10);
        this.ctx.lineTo(x, y + 10);
        this.ctx.quadraticCurveTo(x, y, x + 10, y);
        this.ctx.closePath();
        this.ctx.fillStyle = currentSkill.unlocked ? "#4CAF50" : "#F44336";
        this.ctx.fill();
        // Draw border
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        // Draw icon
        this.ctx.font = "24px Arial";
        this.ctx.fillStyle = "#FFF";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(currentSkill.icon, currentSkill.x, currentSkill.y - this.nodeHeight / 4);
        // Draw skill name with text wrapping
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#FFF";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.wrapText(currentSkill.name, currentSkill.x, currentSkill.y, this.nodeWidth - this.gutter * 2, 20);
        currentSkill.children.forEach((childSkill) => {
            this.drawNodes(childSkill);
        });
    }
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";
        let testLine = "";
        let lineCount = 0;
        for (let n = 0; n < words.length; n++) {
            testLine += `${words[n]} `;
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this.ctx.fillText(line, x, y + lineCount * lineHeight);
                line = `${words[n]} `;
                testLine = `${words[n]} `;
                lineCount++;
            }
            else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, x, y + lineCount * lineHeight);
    }
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - this.offsetX;
        const y = event.clientY - rect.top - this.offsetY;
        this.checkNodeClick(this.rootSkill, x, y);
        this.draw();
    }
    checkNodeClick(skill, x, y) {
        const currentSkill = this.skills[skill];
        const nodeLeft = currentSkill.x - this.nodeWidth / 2;
        const nodeRight = currentSkill.x + this.nodeWidth / 2;
        const nodeTop = currentSkill.y - this.nodeHeight / 2;
        const nodeBottom = currentSkill.y + this.nodeHeight / 2;
        if (x >= nodeLeft && x <= nodeRight && y >= nodeTop && y <= nodeBottom) {
            if (this.canUnlock(skill)) {
                currentSkill.unlocked = true;
                return true;
            }
        }
        for (const childSkill of currentSkill.children) {
            if (this.checkNodeClick(childSkill, x, y)) {
                return true;
            }
        }
        return false;
    }
    canUnlock(skill) {
        if (this.skills[skill].unlocked)
            return false;
        if (skill === this.rootSkill)
            return true;
        for (const key in this.skills) {
            if (this.skills[key].children.includes(skill) &&
                this.skills[key].unlocked) {
                return true;
            }
        }
        return false;
    }
}
exports.SkillTree = SkillTree;
