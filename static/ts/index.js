"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const skillTree_1 = require("./skillTree");
const skills_json_1 = __importDefault(require("./skills.json"));
window.alexdunmow = {
    get: function (id) {
        const el = document.getElementById(id);
        if (!el) {
            throw new Error(`Element with id ${id} not found`);
        }
        return el;
    },
    initHTMX: function () {
        document.body.addEventListener("htmx:beforeSwap", (event) => {
            if (event.detail.target.id === "main-content") {
                const newActiveLink = event.detail.pathInfo.finalResponsePath.substring(1) || "home";
                window.htmx.ajax("GET", `/api/sidebar?activeLink=${newActiveLink}`, "#sidebar-container");
            }
        });
        document.body.addEventListener("htmx:afterSettle", (event) => {
            if (event.detail.target.id === "main-content") {
                const newActiveLink = window.location.pathname.substring(1) || "home";
                window.htmx.ajax("GET", `/api/sidebar?activeLink=${newActiveLink}`, "#sidebar-container");
            }
        });
    },
    init: function () {
        console.log("hey, welcome to my website!");
    },
    initSidebar: function () {
        const themeSwitcher = document.getElementById("theme-switcher");
        if (!themeSwitcher)
            return;
        themeSwitcher.addEventListener("click", function () {
            document.body.classList.toggle("dark");
        });
    },
    initChatSidebar: function () {
        // Initialize chat sidebar behavior
        const chatInput = alexdunmow.get("chat-input");
        const sendMessageButton = alexdunmow.get("send-message");
        sendMessageButton.addEventListener("click", function () {
            const message = chatInput.value;
            if (message) {
                const chatMessagesContainer = alexdunmow.get("chat-messages");
                chatMessagesContainer.innerHTML += `
            <div class="bg-accent p-2 rounded-lg shadow self-end text-primary">
                <p class="text-sm"><strong>You:</strong> ${message}</p>
            </div>
        `;
                chatInput.value = ""; // Clear input
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
            }
        });
    },
    initSkillTree: function () {
        console.log(skills_json_1.default);
        new skillTree_1.SkillTree("skillTreeCanvas", skills_json_1.default);
    },
};
window.alexdunmow.initHTMX();
window.alexdunmow.init();
