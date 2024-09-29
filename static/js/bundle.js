"use strict";
(() => {
  // skillTree.ts
  var SkillTree = class {
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
          const childWidth = this.calculatePositions(
            childSkill,
            level + 1,
            childStartX
          );
          childStartX += childWidth + this.horizontalSpacing;
          return childWidth;
        });
        totalWidth = Math.max(
          this.nodeWidth,
          childrenWidths.reduce((a, b) => a + b, 0) + (childrenWidths.length - 1) * this.horizontalSpacing
        );
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
      } else {
        currentSkill.x = startX + this.nodeWidth / 2;
        currentSkill.y = level * this.levelHeight;
      }
      if (level === 0) {
        currentSkill.unlocked = true;
        this.canvasWidth = Math.max(
          this.canvasWidth,
          totalWidth + this.nodeWidth
        );
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
      if (!this.isDragging) return;
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
      this.ctx.beginPath();
      this.ctx.moveTo(x + 10, y);
      this.ctx.lineTo(x + this.nodeWidth - 10, y);
      this.ctx.quadraticCurveTo(
        x + this.nodeWidth,
        y,
        x + this.nodeWidth,
        y + 10
      );
      this.ctx.lineTo(x + this.nodeWidth, y + this.nodeHeight - 10);
      this.ctx.quadraticCurveTo(
        x + this.nodeWidth,
        y + this.nodeHeight,
        x + this.nodeWidth - 10,
        y + this.nodeHeight
      );
      this.ctx.lineTo(x + 10, y + this.nodeHeight);
      this.ctx.quadraticCurveTo(
        x,
        y + this.nodeHeight,
        x,
        y + this.nodeHeight - 10
      );
      this.ctx.lineTo(x, y + 10);
      this.ctx.quadraticCurveTo(x, y, x + 10, y);
      this.ctx.closePath();
      this.ctx.fillStyle = currentSkill.unlocked ? "#4CAF50" : "#F44336";
      this.ctx.fill();
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.font = "24px Arial";
      this.ctx.fillStyle = "#FFF";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(
        currentSkill.icon,
        currentSkill.x,
        currentSkill.y - this.nodeHeight / 4
      );
      this.ctx.font = "16px Arial";
      this.ctx.fillStyle = "#FFF";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "top";
      this.wrapText(
        currentSkill.name,
        currentSkill.x,
        currentSkill.y,
        this.nodeWidth - this.gutter * 2,
        20
      );
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
        } else {
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
      if (this.skills[skill].unlocked) return false;
      if (skill === this.rootSkill) return true;
      for (const key in this.skills) {
        if (this.skills[key].children.includes(skill) && this.skills[key].unlocked) {
          return true;
        }
      }
      return false;
    }
  };

  // skills.json
  var skills_default = {
    "Technology Skills": {
      name: "Technology Skills",
      children: ["Software Engineering", "Hardware Infrastructure", "Datacenter Engineering", "Office Suite Skills"],
      love: 5,
      icon: "\u{1F5A5}\uFE0F"
    },
    "Software Engineering": {
      name: "Software Engineering",
      children: ["Programming Languages", "Web Development", "Database", "Version Control", "DevOps"],
      love: 5,
      icon: "\u{1F468}\u200D\u{1F4BB}"
    },
    "Programming Languages": {
      name: "Programming Languages",
      children: [
        "By Paradigm",
        "By Type System",
        "By Compilation",
        "By Level of Abstraction"
      ],
      love: 5,
      icon: "\u{1F23A}"
    },
    "By Paradigm": {
      name: "By Paradigm",
      children: ["Object-Oriented", "Functional", "Imperative", "Declarative", "Procedural"],
      love: 4,
      icon: "\u{1F9E0}"
    },
    "By Type System": {
      name: "By Type System",
      children: ["Strongly Typed", "Weakly Typed", "Statically Typed", "Dynamically Typed"],
      love: 4,
      icon: "\u{1F3F7}\uFE0F"
    },
    "By Compilation": {
      name: "By Compilation",
      children: ["Compiled", "Interpreted", "Hybrid"],
      love: 3,
      icon: "\u{1F528}"
    },
    "By Level of Abstraction": {
      name: "By Level of Abstraction",
      children: ["Low-Level", "High-Level"],
      love: 3,
      icon: "\u{1F4CA}"
    },
    "Object-Oriented": {
      name: "Object-Oriented",
      children: ["Java", "C++", "Python", "Ruby"],
      love: 4,
      icon: "\u{1F3AD}"
    },
    Functional: {
      name: "Functional",
      children: ["Haskell", "Scala", "F#", "Clojure"],
      love: 4,
      icon: "\u03BB"
    },
    Imperative: {
      name: "Imperative",
      children: ["C", "Pascal", "Fortran"],
      love: 3,
      icon: "\u2699\uFE0F"
    },
    Declarative: {
      name: "Declarative",
      children: ["SQL", "Prolog", "HTML"],
      love: 4,
      icon: "\u{1F4DC}"
    },
    Procedural: {
      name: "Procedural",
      children: ["C", "Pascal", "BASIC"],
      love: 3,
      icon: "\u{1F522}"
    },
    "Strongly Typed": {
      name: "Strongly Typed",
      children: ["Python", "Java", "Rust"],
      love: 5,
      icon: "\u{1F4AA}"
    },
    "Weakly Typed": {
      name: "Weakly Typed",
      children: ["JavaScript", "PHP", "C"],
      love: 3,
      icon: "\u{1F939}"
    },
    "Statically Typed": {
      name: "Statically Typed",
      children: ["Java", "C++", "Go", "Rust"],
      love: 4,
      icon: "\u{1F3DB}\uFE0F"
    },
    "Dynamically Typed": {
      name: "Dynamically Typed",
      children: ["Python", "JavaScript", "Ruby"],
      love: 4,
      icon: "\u{1F3AD}"
    },
    Compiled: {
      name: "Compiled",
      children: ["C", "C++", "Rust", "Go"],
      love: 4,
      icon: "\u{1F3ED}"
    },
    Interpreted: {
      name: "Interpreted",
      children: ["Python", "JavaScript", "Ruby"],
      love: 4,
      icon: "\u{1F5E3}\uFE0F"
    },
    Hybrid: {
      name: "Hybrid",
      children: ["Java", "C#"],
      love: 4,
      icon: "\u{1F984}"
    },
    "Low-Level": {
      name: "Low-Level",
      children: ["Assembly", "Machine Code"],
      love: 3,
      icon: "\u2699\uFE0F"
    },
    "High-Level": {
      name: "High-Level",
      children: ["Python", "Java", "C#", "JavaScript"],
      love: 5,
      icon: "\u{1F680}"
    },
    Java: { name: "Java", children: [], love: 4, icon: "\u2615" },
    "C++": { name: "C++", children: [], love: 4, icon: "\u{1F1E8}\u2795\u2795" },
    Python: { name: "Python", children: [], love: 5, icon: "\u{1F40D}" },
    Ruby: { name: "Ruby", children: [], love: 4, icon: "\u{1F48E}" },
    Haskell: { name: "Haskell", children: [], love: 3, icon: "\u03BB" },
    Scala: { name: "Scala", children: [], love: 4, icon: "\u{1F9D7}" },
    "F#": { name: "F#", children: [], love: 3, icon: "\u{1F3BC}" },
    Clojure: { name: "Clojure", children: [], love: 4, icon: "\u{1F512}" },
    C: { name: "C", children: [], love: 4, icon: "\u{1F1E8}" },
    Pascal: { name: "Pascal", children: [], love: 2, icon: "\u{1F4D0}" },
    Fortran: { name: "Fortran", children: [], love: 2, icon: "\u{1F522}" },
    SQL: { name: "SQL", children: [], love: 4, icon: "\u{1F5C3}\uFE0F" },
    Prolog: { name: "Prolog", children: [], love: 3, icon: "\u{1F9E0}" },
    HTML: { name: "HTML", children: [], love: 4, icon: "\u{1F310}" },
    BASIC: { name: "BASIC", children: [], love: 2, icon: "\u{1F524}" },
    JavaScript: { name: "JavaScript", children: [], love: 5, icon: "\u{1F7E8}" },
    PHP: { name: "PHP", children: [], love: 3, icon: "\u{1F418}" },
    Go: { name: "Go", children: [], love: 4, icon: "\u{1F439}" },
    Rust: { name: "Rust", children: [], love: 5, icon: "\u{1F980}" },
    "C#": { name: "C#", children: [], love: 4, icon: "\u{1F3B5}" },
    Assembly: { name: "Assembly", children: [], love: 3, icon: "\u{1F52C}" },
    "Machine Code": { name: "Machine Code", children: [], love: 2, icon: "0\uFE0F\u20E31\uFE0F\u20E3" },
    "Web Development": {
      name: "Web Development",
      children: ["Frontend", "Backend"],
      love: 5,
      icon: "\u{1F310}"
    },
    Frontend: {
      name: "Frontend",
      children: ["HTML", "CSS", "JavaScript", "Frameworks"],
      love: 5,
      icon: "\u{1F5A5}\uFE0F"
    },
    CSS: { name: "CSS", children: [], love: 4, icon: "\u{1F3A8}" },
    Frameworks: {
      name: "Frameworks",
      children: ["React", "Angular", "Vue.js"],
      love: 5,
      icon: "\u{1F9F0}"
    },
    React: { name: "React", children: [], love: 5, icon: "\u269B\uFE0F" },
    Angular: { name: "Angular", children: [], love: 4, icon: "\u{1F170}\uFE0F" },
    "Vue.js": { name: "Vue.js", children: [], love: 5, icon: "\u{1F53A}" },
    Backend: {
      name: "Backend",
      children: ["Node.js", "Django", "Ruby on Rails"],
      love: 5,
      icon: "\u{1F5A7}"
    },
    "Node.js": { name: "Node.js", children: [], love: 5, icon: "\u{1F7E9}" },
    Django: { name: "Django", children: [], love: 4, icon: "\u{1F40D}" },
    "Ruby on Rails": { name: "Ruby on Rails", children: [], love: 4, icon: "\u{1F6E4}\uFE0F" },
    Database: {
      name: "Database",
      children: ["Relational", "NoSQL"],
      love: 4,
      icon: "\u{1F5C4}\uFE0F"
    },
    Relational: {
      name: "Relational",
      children: ["SQL", "MySQL", "PostgreSQL"],
      love: 4,
      icon: "\u{1F4CA}"
    },
    MySQL: { name: "MySQL", children: [], love: 4, icon: "\u{1F42C}" },
    PostgreSQL: { name: "PostgreSQL", children: [], love: 5, icon: "\u{1F418}" },
    NoSQL: {
      name: "NoSQL",
      children: ["MongoDB", "Cassandra", "Redis"],
      love: 4,
      icon: "\u{1F527}"
    },
    MongoDB: { name: "MongoDB", children: [], love: 4, icon: "\u{1F343}" },
    Cassandra: { name: "Cassandra", children: [], love: 3, icon: "\u{1F441}\uFE0F" },
    Redis: { name: "Redis", children: [], love: 5, icon: "\u{1F534}" },
    "Version Control": {
      name: "Version Control",
      children: ["Git", "SVN"],
      love: 5,
      icon: "\u{1F516}"
    },
    Git: { name: "Git", children: [], love: 5, icon: "\u{1F33F}" },
    SVN: { name: "SVN", children: [], love: 3, icon: "\u{1F5C2}\uFE0F" },
    DevOps: {
      name: "DevOps",
      children: ["CI/CD", "Containerization"],
      love: 5,
      icon: "\u{1F504}"
    },
    "CI/CD": {
      name: "CI/CD",
      children: ["Jenkins", "GitLab CI", "Travis CI"],
      love: 4,
      icon: "\u{1F501}"
    },
    Jenkins: { name: "Jenkins", children: [], love: 4, icon: "\u{1F468}\u200D\u{1F527}" },
    "GitLab CI": { name: "GitLab CI", children: [], love: 5, icon: "\u{1F98A}" },
    "Travis CI": { name: "Travis CI", children: [], love: 4, icon: "\u{1F3D7}\uFE0F" },
    Containerization: {
      name: "Containerization",
      children: ["Docker", "Kubernetes"],
      love: 5,
      icon: "\u{1F4E6}"
    },
    Docker: { name: "Docker", children: [], love: 5, icon: "\u{1F433}" },
    Kubernetes: { name: "Kubernetes", children: [], love: 5, icon: "\u2638\uFE0F" },
    "Hardware Infrastructure": {
      name: "Hardware Infrastructure",
      children: ["Networking", "Server Administration", "Storage"],
      love: 4,
      icon: "\u{1F5A5}\uFE0F"
    },
    Networking: {
      name: "Networking",
      children: ["Protocols", "Equipment"],
      love: 4,
      icon: "\u{1F310}"
    },
    Protocols: {
      name: "Protocols",
      children: ["TCP/IP", "HTTP", "DNS"],
      love: 4,
      icon: "\u{1F4DC}"
    },
    "TCP/IP": { name: "TCP/IP", children: [], love: 4, icon: "\u{1F310}" },
    HTTP: { name: "HTTP", children: [], love: 5, icon: "\u{1F30D}" },
    DNS: { name: "DNS", children: [], love: 4, icon: "\u{1F4DE}" },
    Equipment: {
      name: "Equipment",
      children: ["Routers", "Switches", "Firewalls"],
      love: 3,
      icon: "\u{1F50C}"
    },
    Routers: { name: "Routers", children: [], love: 3, icon: "\u{1F6E3}\uFE0F" },
    Switches: { name: "Switches", children: [], love: 3, icon: "\u{1F500}" },
    Firewalls: { name: "Firewalls", children: [], love: 4, icon: "\u{1F9F1}" },
    "Server Administration": {
      name: "Server Administration",
      children: ["Operating Systems", "Virtualization"],
      love: 4,
      icon: "\u{1F5A5}\uFE0F"
    },
    "Operating Systems": {
      name: "Operating Systems",
      children: ["Linux", "Windows Server"],
      love: 5,
      icon: "\u{1F4BB}"
    },
    Linux: { name: "Linux", children: [], love: 5, icon: "\u{1F427}" },
    "Windows Server": { name: "Windows Server", children: [], love: 4, icon: "\u{1FA9F}" },
    Virtualization: {
      name: "Virtualization",
      children: ["VMware", "Hyper-V"],
      love: 4,
      icon: "\u{1F5A5}\uFE0F"
    },
    VMware: { name: "VMware", children: [], love: 4, icon: "\u{1F532}" },
    "Hyper-V": { name: "Hyper-V", children: [], love: 3, icon: "\u{1F7E6}" },
    Storage: {
      name: "Storage",
      children: ["SAN", "NAS", "RAID"],
      love: 3,
      icon: "\u{1F4BE}"
    },
    SAN: { name: "SAN", children: [], love: 3, icon: "\u{1F5C4}\uFE0F" },
    NAS: { name: "NAS", children: [], love: 3, icon: "\u{1F4C1}" },
    RAID: { name: "RAID", children: [], love: 4, icon: "\u{1F522}" },
    "Datacenter Engineering": {
      name: "Datacenter Engineering",
      children: ["Power Management", "Cooling Systems", "Physical Security", "Disaster Recovery"],
      love: 4,
      icon: "\u{1F3E2}"
    },
    "Power Management": {
      name: "Power Management",
      children: ["UPS Systems", "Power Distribution Units"],
      love: 3,
      icon: "\u26A1"
    },
    "UPS Systems": { name: "UPS Systems", children: [], love: 3, icon: "\u{1F50B}" },
    "Power Distribution Units": { name: "Power Distribution Units", children: [], love: 3, icon: "\u{1F50C}" },
    "Cooling Systems": {
      name: "Cooling Systems",
      children: ["HVAC", "Liquid Cooling"],
      love: 3,
      icon: "\u2744\uFE0F"
    },
    HVAC: { name: "HVAC", children: [], love: 3, icon: "\u{1F321}\uFE0F" },
    "Liquid Cooling": { name: "Liquid Cooling", children: [], love: 4, icon: "\u{1F4A7}" },
    "Physical Security": {
      name: "Physical Security",
      children: ["Access Control", "Surveillance"],
      love: 4,
      icon: "\u{1F512}"
    },
    "Access Control": { name: "Access Control", children: [], love: 4, icon: "\u{1F6AA}" },
    Surveillance: { name: "Surveillance", children: [], love: 3, icon: "\u{1F4F9}" },
    "Disaster Recovery": {
      name: "Disaster Recovery",
      children: ["Backup Systems", "Failover Strategies"],
      love: 5,
      icon: "\u{1F198}"
    },
    "Backup Systems": { name: "Backup Systems", children: [], love: 5, icon: "\u{1F4BE}" },
    "Failover Strategies": { name: "Failover Strategies", children: [], love: 5, icon: "\u{1F504}" },
    "Office Suite Skills": {
      name: "Office Suite Skills",
      children: ["Word Processing", "Spreadsheets", "Presentations", "Email and Calendar", "Collaboration Tools"],
      love: 3,
      icon: "\u{1F3E2}"
    },
    "Word Processing": {
      name: "Word Processing",
      children: ["Microsoft Word", "Google Docs"],
      love: 3,
      icon: "\u{1F4DD}"
    },
    "Microsoft Word": { name: "Microsoft Word", children: [], love: 3, icon: "\u{1F4D8}" },
    "Google Docs": { name: "Google Docs", children: [], love: 4, icon: "\u{1F4C4}" },
    Spreadsheets: {
      name: "Spreadsheets",
      children: ["Microsoft Excel", "Google Sheets"],
      love: 4,
      icon: "\u{1F4CA}"
    },
    "Microsoft Excel": { name: "Microsoft Excel", children: [], love: 4, icon: "\u{1F4D7}" },
    "Google Sheets": { name: "Google Sheets", children: [], love: 4, icon: "\u{1F9EE}" },
    Presentations: {
      name: "Presentations",
      children: ["Microsoft PowerPoint", "Google Slides"],
      love: 3,
      icon: "\u{1F3AD}"
    },
    "Microsoft PowerPoint": { name: "Microsoft PowerPoint", children: [], love: 3, icon: "\u{1F4D9}" },
    "Google Slides": { name: "Google Slides", children: [], love: 4, icon: "\u{1F5BC}\uFE0F" },
    "Email and Calendar": {
      name: "Email and Calendar",
      children: ["Microsoft Outlook", "Google Workspace"],
      love: 3,
      icon: "\u{1F4C5}"
    },
    "Microsoft Outlook": { name: "Microsoft Outlook", children: [], love: 3, icon: "\u{1F4E8}" },
    "Google Workspace": { name: "Google Workspace", children: [], love: 4, icon: "\u{1F9F0}" },
    "Collaboration Tools": {
      name: "Collaboration Tools",
      children: ["Microsoft Teams", "Slack", "Zoom"],
      love: 4,
      icon: "\u{1F465}"
    },
    "Microsoft Teams": { name: "Microsoft Teams", children: [], love: 3, icon: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}" },
    Slack: { name: "Slack", children: [], love: 4, icon: "#\uFE0F\u20E3" },
    Zoom: { name: "Zoom", children: [], love: 4, icon: "\u{1F3A5}" }
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
    initSkillTree: function() {
      console.log(skills_default);
      new SkillTree("skillTreeCanvas", skills_default);
    }
  };
  window.alexdunmow.initHTMX();
  window.alexdunmow.init();
})();
