import {
  HTMXAfterRequestEvent,
  HTMXAfterSettleEvent,
  HTMXBeforeSwapEvent,
} from "./htmx_types";
import { SkillTree } from "./skillTree";

import skills from "./skills.json";
import { HexagonCanvas } from "./hexGrid";

export interface AlexDunmow {
  init: () => void;
  initHTMX: () => void;
  initSidebar: () => void;
  initChatSidebar: () => void;
  initSkillTree: (canvasElement: HTMLCanvasElement) => void;
  get<T = HTMLDivElement>(id: string): T;
}
window.alexdunmow = {
  get: function <T>(id: string): T {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`Element with id ${id} not found`);
    }
    return el as unknown as T;
  },
  initHTMX: function () {
    document.body.addEventListener(
      "htmx:beforeSwap",
      (event: HTMXBeforeSwapEvent) => {
        if (event.detail.target.id === "main-content") {
          const newActiveLink =
            event.detail.pathInfo.finalResponsePath.substring(1) || "home";
          window.htmx.ajax(
            "GET",
            `/api/sidebar?activeLink=${newActiveLink}`,
            "#sidebar-container",
          );
        }
      },
    );

    document.body.addEventListener(
      "htmx:afterSettle",
      (event: HTMXAfterSettleEvent) => {
        if (event.detail.target.id === "main-content") {
          const newActiveLink = window.location.pathname.substring(1) || "home";
          window.htmx.ajax(
            "GET",
            `/api/sidebar?activeLink=${newActiveLink}`,
            "#sidebar-container",
          );
        }
      },
    );
  },
  init: function () {
    console.log("hey, welcome to my website!");
  },
  initSidebar: function () {
    const themeSwitcher = document.getElementById("theme-switcher");
    if (!themeSwitcher) return;

    themeSwitcher.addEventListener("click", function () {
      document.body.classList.toggle("dark");
    });
  },
  initChatSidebar: function () {
    // Initialize chat sidebar behavior
    const chatInput = alexdunmow.get<HTMLInputElement>("chat-input");
    const sendMessageButton = alexdunmow.get<HTMLButtonElement>("send-message");

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
  initSkillTree: function (canvasElement: HTMLCanvasElement) {
    const hexCanvas = new HexagonCanvas(canvasElement);
    // If you need to access the canvas dimensions:
    console.log(`Canvas dimensions: ${hexCanvas.width}x${hexCanvas.height}`);
  },
};

window.alexdunmow.initHTMX();
window.alexdunmow.init();
