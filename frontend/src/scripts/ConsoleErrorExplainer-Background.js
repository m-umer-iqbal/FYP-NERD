/**
 * Console Error Explainer – Background Service Worker (Tab‑aware badge)
 */

// ============================================
// PER‑TAB ERROR STORAGE (in memory, no persistence)
// ============================================

const tabErrors = new Map();   // tabId → errorCount

// ============================================
// BADGE UPDATE HELPER
// ============================================

async function updateBadgeForTab(tabId) {
  const count = tabErrors.get(tabId) || 0;
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString(), tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#f472b6' });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
  }
}

// ============================================
// MESSAGE HANDLER (from content scripts)
// ============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // We handle async by returning true at the end
  (async () => {
    try {
      switch (request.type) {
        case 'ERRORS_UPDATED': {
          const tabId = sender.tab?.id;
          if (tabId == null) return;

          // Store count for this tab
          const count = request.errors?.length || 0;
          tabErrors.set(tabId, count);

          // If this tab is the active one, reflect badge immediately
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab && activeTab.id === tabId) {
            updateBadgeForTab(tabId);
          }
          break;
        }

        case 'GET_STORED_ERRORS':
          // No longer used; kept for compatibility.
          sendResponse({ success: true, errors: [] });
          return;

        case 'CLEAR_STORED_ERRORS':
          // Clear errors for the requesting tab
          const clearTabId = sender.tab?.id;
          if (clearTabId != null) {
            tabErrors.delete(clearTabId);
            updateBadgeForTab(clearTabId);
          }
          sendResponse({ success: true, message: 'Errors cleared' });
          break;

        case 'GET_EXTENSION_STATUS':
          sendResponse({
            success: true,
            status: 'active',
            version: chrome.runtime.getManifest().version
          });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // async response
});

// ============================================
// TAB CHANGE & REMOVAL HANDLERS
// ============================================

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // When switching tabs, update badge for the newly active tab
  updateBadgeForTab(activeInfo.tabId);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  // Clean up memory
  tabErrors.delete(tabId);
});

// ============================================
// INITIALISATION
// ============================================

console.log('[ErrorExplainer BG] Tab‑aware service worker started');

// On startup, badge might show from previous session – we just clear it
// because we have no persistent storage. The popup will populate per‑tab.
chrome.action.setBadgeText({ text: '' });

// Context menu (unchanged)
try {
  chrome.contextMenus.create({
    id: 'open-error-explainer',
    title: 'Open Error Explainer',
    contexts: ['page']
  });
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'open-error-explainer') {
      chrome.action.openPopup();
    }
  });
} catch (e) {
  console.log('[ErrorExplainer BG] Context menu not available:', e.message);
}