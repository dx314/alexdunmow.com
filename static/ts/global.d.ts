import { AlexDunmow } from "./index.ts";
import { HTMXBeforeSwapEvent, HTMXAfterSettleEvent } from "./htmx_types";

declare global {
  interface HTMLElementEventMap {
    "htmx:beforeSwap": HTMXBeforeSwapEvent;
    "htmx:afterSettle": HTMXAfterSettleEvent;
    // Add other HTMX events as needed
  }

  interface Window {
    alexdunmow: AlexDunmow;
    htmx: {
      ajax: (method: string, url: string, target: string) => void;
      // Add other htmx methods as needed
    };
  }

  const alexdunmow: AlexDunmow;
}

// This empty export is necessary to make this a module
export {};
