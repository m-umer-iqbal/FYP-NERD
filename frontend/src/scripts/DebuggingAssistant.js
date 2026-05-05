/**
 * Console Error Explainer - Content Script (Fixed)
 * 
 * - Injects monitoring code into the page's main world via external file.
 * - Listens for errors via window.postMessage.
 * - Analyzes and stores them for the popup.
 */

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const CONFIG = {
    MAX_ERRORS_STORED: 50,
    STACK_TRACE_LIMIT: 10,
};

const ERROR_CATEGORIES = {
    'TypeError': 'type-error',
    'ReferenceError': 'runtime-error',
    'SyntaxError': 'syntax-error',
    'RangeError': 'type-error',
    'EvalError': 'syntax-error',
    'URIError': 'type-error',
    'CustomError': 'logic-error'
};

// ============================================
// ERROR STORAGE & MANAGEMENT
// ============================================

class ErrorManager {
    constructor() {
        this.errors = new Map();
        this.errorCounts = new Map();
        this.isMonitoring = false;
        this._pageScriptInjected = false;
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;

        // 1. Clear any previous errors (fresh start)
        this.errors.clear();
        this.notifyPopup();   // immediately update popup to empty

        // 2. Inject the page monitor (only once, it keeps listening forever)
        this._injectPageMonitor();

        console.log('[ErrorExplainer] Monitoring started (errors cleared)');
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        this.isMonitoring = false;

        // 3. Clear all errors and tell popup
        this.errors.clear();
        this.notifyPopup();

        console.log('[ErrorExplainer] Monitoring stopped (errors cleared)');
    }

    _injectPageMonitor() {
        if (this._pageScriptInjected) return;
        this._pageScriptInjected = true;

        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('page-monitor.js');
        script.onload = () => script.remove();
        (document.head || document.documentElement).appendChild(script);
    }

    analyzeError(error, event = null, isPromiseRejection = false) {
        const errorId = this.generateErrorId(error);
        const existingError = this.errors.get(errorId);

        if (existingError) {
            existingError.count += 1;
            existingError.lastOccurrence = new Date().toISOString();
            return existingError;
        }

        const errorType = error.name || 'Error';
        const message = error.message || String(error);
        const stack = error.stack || '';
        const stackLines = stack.split('\n');

        const location = this.extractLocationFromStack(stackLines);
        const analysis = this.generateAnalysis(errorType, message, stack);

        const errorData = {
            id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: errorType,
            category: ERROR_CATEGORIES[errorType] || 'logic-error',
            message: message,
            file: location.file || 'unknown',
            line: location.line || 0,
            column: location.column || 0,
            stack: stack,
            stackTrace: stackLines.slice(0, CONFIG.STACK_TRACE_LIMIT),
            count: 1,
            firstOccurrence: new Date().toISOString(),
            lastOccurrence: new Date().toISOString(),
            timestamp: Date.now(),
            isPromiseRejection: isPromiseRejection,
            meaning: analysis.meaning,
            rootCauses: analysis.rootCauses,
            fixes: analysis.fixes,
            impact: analysis.impact,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        return errorData;
    }

    extractLocationFromStack(stackLines) {
        const location = { file: 'unknown', line: 0, column: 0 };
        if (stackLines.length < 2) return location;

        const stackLine = stackLines[1] || stackLines[0];
        const patterns = [
            /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/,
            /at\s+(.+?):(\d+):(\d+)/,
            /(.+?):(\d+):(\d+)/
        ];
        for (const pattern of patterns) {
            const match = stackLine.match(pattern);
            if (match) {
                const fileMatch = match[match.length - 3];
                const lineMatch = match[match.length - 2];
                const colMatch = match[match.length - 1];
                if (fileMatch && !fileMatch.startsWith('eval')) {
                    location.file = this.extractFilename(fileMatch);
                    location.line = parseInt(lineMatch) || 0;
                    location.column = parseInt(colMatch) || 0;
                }
                break;
            }
        }
        return location;
    }

    extractFilename(fullPath) {
        if (!fullPath) return 'unknown';
        let path = fullPath.replace(/^https?:\/\/[^\/]+/, '');
        const parts = path.split('/');
        return parts[parts.length - 1] || 'unknown';
    }

    generateAnalysis(errorType, message, stack) {
        return {
            meaning: this.generateMeaning(errorType, message),
            rootCauses: this.generateRootCauses(errorType, message, stack),
            fixes: this.generateFixes(errorType, message, stack),
            impact: this.generateImpact(errorType, message)
        };
    }

    generateMeaning(errorType, message) {
        const meanings = {
            'TypeError': `A TypeError occurs when a variable or operation is used in a way that doesn't match its type. ${message.includes('undefined') ? 'You are trying to access a property of something that is undefined.' : 'You are using a value in an operation that expects a different type.'}`,
            'ReferenceError': `A ReferenceError means the code is trying to use a variable or function that hasn't been defined. Check for typos in variable names or ensure the variable is declared before use.`,
            'SyntaxError': `A SyntaxError indicates the code violates JavaScript syntax rules. This is usually caught at parse time, not runtime. Check for missing brackets, semicolons, or malformed statements.`,
            'RangeError': `A RangeError occurs when a numeric value is outside the acceptable range. For example, array methods receiving invalid index values.`,
            'UnhandledPromiseRejection': `An async operation (Promise) rejected without being caught. Always use .catch() or try/catch in async functions to handle promise rejections.`,
            'CustomError': `A custom error was thrown by the application. Check the error message and stack trace for details about what went wrong.`
        };
        return meanings[errorType] || `An unexpected error of type ${errorType} occurred: ${message}`;
    }

    generateRootCauses(errorType, message, stack) {
        const causes = {
            'TypeError': ['Trying to access a property of undefined or null', 'Calling a method on a non-function value', 'Variable not initialized before use', 'Incorrect data type passed to function', 'DOM element not found on page load'],
            'ReferenceError': ['Variable declared in wrong scope', 'Typo in variable or function name', 'Variable used before declaration', 'Missing import or require statement', 'Function called before it was defined'],
            'SyntaxError': ['Missing or extra brackets { } [ ]', 'Missing semicolon at end of statement', 'Invalid operator or keyword usage', 'Unmatched quotes or string literals', 'Invalid JSON or template literal syntax'],
            'RangeError': ['Array index out of bounds', 'Recursion depth exceeded', 'Invalid numeric parameter', 'Number too large or too small for operation', 'Invalid precision value']
        };
        return causes[errorType] || ['Check the error message and stack trace', 'Review recent code changes', 'Verify all dependencies are loaded', 'Check browser console for additional details'];
    }

    generateFixes(errorType, message, stack) {
        const fixes = {
            'TypeError': [
                { description: 'Check if value exists before accessing properties', code: `if (obj && obj.property) {\n  // safe to use\n}`, confidence: 'high' },
                { description: 'Use optional chaining operator', code: `const value = obj?.property?.nested;`, confidence: 'high' },
                { description: 'Use nullish coalescing for defaults', code: `const value = obj?.property ?? 'default';`, confidence: 'medium' }
            ],
            'ReferenceError': [
                { description: 'Declare variable before using it', code: `let myVar = 'value';\nconsole.log(myVar);`, confidence: 'high' },
                { description: 'Check for typos in variable names', code: `// Look for similar names\n// myVariable vs myVarible`, confidence: 'high' },
                { description: 'Ensure function is defined before calling', code: `function myFunc() { }\nmyFunc();`, confidence: 'medium' }
            ],
            'SyntaxError': [
                { description: 'Check all brackets are matched', code: `// Bad: {\n//   console.log('test')\n// } }\n\n// Good:\n// {\n//   console.log('test');\n// }`, confidence: 'high' },
                { description: 'Ensure all strings are properly quoted', code: `// Bad:\nlet str = "unclosed string;\n\n// Good:\nlet str = "closed string";`, confidence: 'high' }
            ],
            'RangeError': [
                { description: 'Check array bounds before access', code: `if (index >= 0 && index < array.length) {\n  return array[index];\n}`, confidence: 'high' },
                { description: 'Limit recursion depth', code: `function recursive(n, limit = 100) {\n  if (n > limit) return;\n  recursive(n + 1);\n}`, confidence: 'high' }
            ]
        };
        return fixes[errorType] || [
            { description: 'Review the error message and stack trace', code: `console.log(error.message);\nconsole.log(error.stack);`, confidence: 'medium' },
            { description: 'Add error handling', code: `try {\n  // code\n} catch (error) {\n  console.error('Error:', error);\n}`, confidence: 'high' }
        ];
    }

    generateImpact(errorType, message) {
        const criticalErrors = ['TypeError', 'ReferenceError', 'SyntaxError'];
        return {
            functionality: message.toLowerCase().includes('undefined') || message.toLowerCase().includes('not a function') ? 'high' : 'medium',
            crash: criticalErrors.includes(errorType) ? true : false,
            ux: message.toLowerCase().includes('dom') || message.toLowerCase().includes('element') ? 'high' : 'medium'
        };
    }

    generateErrorId(error) {
        const stack = error.stack || error.message;
        let hash = 0;
        for (let i = 0; i < stack.length; i++) {
            const char = stack.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `error_${Math.abs(hash)}`;
    }

    storeError(errorData) {
        const errorId = this.generateErrorId({ stack: errorData.stack });
        if (this.errors.has(errorId)) {
            const existing = this.errors.get(errorId);
            existing.count += 1;
            existing.lastOccurrence = new Date().toISOString();
        } else {
            if (this.errors.size >= CONFIG.MAX_ERRORS_STORED) {
                const firstKey = this.errors.keys().next().value;
                this.errors.delete(firstKey);
            }
            this.errors.set(errorId, errorData);
        }
        this.notifyPopup();
    }

    getErrors() {
        return Array.from(this.errors.values()).sort((a, b) => b.timestamp - a.timestamp);
    }

    getErrorsByCategory(category) {
        return this.getErrors().filter(err => err.category === category);
    }

    clearErrors() {
        this.errors.clear();
        this.notifyPopup();
    }

    notifyPopup() {
        try {
            chrome.runtime.sendMessage({
                type: 'ERRORS_UPDATED',
                errors: this.getErrors()
            }).catch(() => { });
        } catch (e) { }
    }

    getErrorDetails(errorId) {
        return Array.from(this.errors.values()).find(e => e.id === errorId) || null;
    }
}

// ============================================
// INITIALIZE ERROR MANAGER
// ============================================

const errorManager = new ErrorManager();

// ============================================
// LISTEN FOR MESSAGES FROM THE INJECTED PAGE SCRIPT
// ============================================
window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== 'PAGE_ERROR') return;

    // 4. Only capture errors while monitoring is ON
    if (!errorManager.isMonitoring) return;

    const errorSnapshot = event.data.error;
    if (errorSnapshot) {
        const analyzed = errorManager.analyzeError(errorSnapshot);
        errorManager.storeError(analyzed);
    }
});

// ============================================
// MESSAGE LISTENER (from popup/background)
// ============================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        switch (request.action) {
            case 'startErrorMonitoring':
                errorManager.startMonitoring();
                sendResponse({
                    success: true,
                    message: 'Monitoring started',
                    errors: errorManager.getErrors()   // empty now
                });
                break;
            case 'stopErrorMonitoring':
                errorManager.stopMonitoring();
                sendResponse({ success: true, message: 'Monitoring stopped' });
                break;
            case 'getErrors':
                sendResponse({ success: true, errors: errorManager.getErrors() });
                break;
            case 'getErrorsByCategory':
                sendResponse({ success: true, errors: errorManager.getErrorsByCategory(request.category) });
                break;
            case 'getErrorDetails':
                sendResponse({ success: true, error: errorManager.getErrorDetails(request.errorId) });
                break;
            case 'clearErrors':
                errorManager.clearErrors();
                sendResponse({ success: true, message: 'All errors cleared' });
                break;
            case 'getMonitoringStatus':
                sendResponse({ success: true, isMonitoring: errorManager.isMonitoring });
                break;
            case 'highlightElement':
                if (request.selector) highlightElement(request.selector);
                sendResponse({ success: true });
                break;
            case 'unhighlightElement':
                if (request.selector) unhighlightElement(request.selector);
                sendResponse({ success: true });
                break;
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
    return true;
});

// ============================================
// UTILITY FUNCTIONS
// ============================================
let highlightedElement = null;

function highlightElement(selector) {
    try {
        const element = document.querySelector(selector);
        if (element) {
            highlightedElement = element;
            const originalStyle = {
                outline: element.style.outline,
                backgroundColor: element.style.backgroundColor,
                zIndex: element.style.zIndex
            };
            element.style.outline = '3px solid #f472b6';
            element.style.zIndex = '999999';
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.setAttribute('data-highlighted', 'true');
            element.setAttribute('data-original-style', JSON.stringify(originalStyle));
        }
    } catch (e) { }
}

function unhighlightElement(selector) {
    try {
        const element = document.querySelector(selector);
        if (element) {
            const originalStyle = JSON.parse(element.getAttribute('data-original-style') || '{}');
            element.style.outline = originalStyle.outline || '';
            element.style.backgroundColor = originalStyle.backgroundColor || '';
            element.style.zIndex = originalStyle.zIndex || '';
            element.removeAttribute('data-highlighted');
            element.removeAttribute('data-original-style');
        }
    } catch (e) { }
}