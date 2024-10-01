"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hexGrid_1 = require("./hexGrid");
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
            const path = event.detail.pathInfo.finalRequestPath;
            const links = document.getElementsByClassName("active-link");
            if (links) {
                Array.from(links).forEach((link) => {
                    link.classList.remove("active-link");
                });
            }
            const activeLink = document.querySelector(`a.sidebar-link[href="${path}"]`);
            if (activeLink) {
                activeLink.classList.add("active-link");
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
    initSkillTree: function (canvasElement) {
        const hexCanvas = new hexGrid_1.HexagonCanvas(canvasElement);
        // If you need to access the canvas dimensions:
        console.log(`Canvas dimensions: ${hexCanvas.width}x${hexCanvas.height}`);
    },
};
window.alexdunmow.initHTMX();
window.alexdunmow.init();
