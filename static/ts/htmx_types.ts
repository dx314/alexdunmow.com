// htmx_types.ts

// Common properties for all HTMX events
export interface HTMXEventDetail {
    elt: HTMLElement;
    target: HTMLElement;
    requestConfig: {
        method: string;
        url: string;
        headers: Record<string, string>;
    };
}


export interface HTMXAfterRequestEvent extends CustomEvent {
    detail: HTMXEventDetail & {
        xhr: XMLHttpRequest;  // The underlying XMLHttpRequest object
        requestConfig: any;   // Configuration object of the request
        target: HTMLElement;  // The target element for the request
        pathInfo: {
            requestPath: string;       // The initial request path
            finalRequestPath: string;   // The final path after redirections or modifications
            responsePath: string;       // Path of the received response
            finalResponsePath: string;  // The final response path
        };
    };
}

// BeforeSwap event
export interface HTMXBeforeSwapEvent extends CustomEvent {
    detail: HTMXEventDetail & {
        xhr: XMLHttpRequest;
        pathInfo: {
            requestPath: string;
            finalRequestPath: string;
            responsePath: string;
            finalResponsePath: string;
        };
    };
}

// AfterSettle event
export interface HTMXAfterSettleEvent extends CustomEvent {
    detail: HTMXEventDetail & {
        xhr: XMLHttpRequest;
        pathInfo: {
            requestPath: string;
            responsePath: string;
        };
    };
}
