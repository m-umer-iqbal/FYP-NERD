// page-monitor.js – injected into the page's main world

(function () {
    // Prevent double injection
    if (window.__consoleErrorExplainerInjected) return;
    window.__consoleErrorExplainerInjected = true;

    function postError(errorObj) {
        // Build a serializable snapshot
        const snapshot = {
            name: errorObj.name || 'Error',
            message: errorObj.message || String(errorObj),
            stack: errorObj.stack || '',
            fileName: errorObj.fileName || '',
            lineNumber: errorObj.lineNumber || 0,
            columnNumber: errorObj.columnNumber || 0,
            timestamp: Date.now()
        };
        // Send to content script
        window.postMessage({
            type: 'PAGE_ERROR',
            error: snapshot
        }, '*');
    }

    // 1. Hook console.error
    const originalError = console.error;
    console.error = function (...args) {
        originalError.apply(console, args);
        if (args[0] instanceof Error) {
            postError(args[0]);
        }
    };

    // 2. Global error listener
    window.addEventListener('error', (event) => {
        if (event.error) {
            postError(event.error);
        }
    });

    // 3. Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const error = reason instanceof Error ? reason : new Error(String(reason));
        postError(error);
    });
})();