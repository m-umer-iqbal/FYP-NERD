// content.js – Translify Translation Engine

// Store original text for each translated node
const originalTexts = new Map();

// ---------- Translation API (Google Translate free endpoint) ----------
async function translateText(text, targetLang) {
    if (!text.trim()) return text;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        // data[0] is an array of sentence fragments
        return data[0].map(piece => piece[0]).join('');
    } catch (error) {
        console.warn('Translation failed:', text, error);
        return text; // fallback to original
    }
}

// ---------- Set page direction (RTL for Urdu/Arabic) ----------
function setPageDirection(targetLang) {
    const rtlLangs = ['ur', 'ar']; // Urdu and Arabic are RTL
    if (rtlLangs.includes(targetLang)) {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', targetLang);
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', targetLang);
    }
}

// ---------- Translate the whole page ----------
async function translatePage(targetLang) {
    // Set RTL if needed
    setPageDirection(targetLang);

    // 1. Collect all visible text nodes (skip script, style, and hidden elements)
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Reject if inside <script>, <style>, <noscript>, or hidden element
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                if (parent.closest('script, style, noscript, [data-no-translate]')) 
                    return NodeFilter.FILTER_REJECT;
                // Reject empty or whitespace-only text
                if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
                // Reject hidden elements (display:none, visibility:hidden)
                const style = window.getComputedStyle(parent);
                if (style.display === 'none' || style.visibility === 'hidden') 
                    return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const nodesToTranslate = [];
    while (walker.nextNode()) {
        const node = walker.currentNode;
        // Save original text only once
        if (!originalTexts.has(node)) {
            originalTexts.set(node, node.textContent);
        }
        nodesToTranslate.push(node);
    }

    // 2. Translate each node one by one (or batch them for better performance)
    //    We add a small delay between requests to avoid overwhelming the free API.
    for (let i = 0; i < nodesToTranslate.length; i++) {
        const node = nodesToTranslate[i];
        const original = originalTexts.get(node);
        if (!original.trim()) continue;
        const translated = await translateText(original, targetLang);
        node.textContent = translated;
        // Gentle delay (adjust as needed)
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

// ---------- Reset to original English (or original text) ----------
function resetPage() {
    for (let [node, original] of originalTexts.entries()) {
        if (node.parentElement) { // still in DOM
            node.textContent = original;
        }
    }
    originalTexts.clear();
    // Reset direction to LTR
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'en');
}

// ---------- Listen for messages from the popup ----------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translate') {
        translatePage(request.targetLang).catch(console.error);
        sendResponse({ status: 'translating' });
    } else if (request.action === 'reset') {
        resetPage();
        sendResponse({ status: 'reset' });
    }
    // Return true to indicate async response (not strictly needed here but good practice)
    return true;
});