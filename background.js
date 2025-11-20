/**
 * Background Service Worker
 * Handles context menu creation and form filling triggers
 */

// Context menu ID
const CONTEXT_MENU_ID = 'auto-fill-form';

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('Form Auto-Filler: Extension installed');
  createContextMenu();
});

/**
 * Create context menu item
 */
function createContextMenu() {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Auto-fill Form',
    contexts: ['page', 'editable'],
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Context menu creation error:', chrome.runtime.lastError);
    } else {
      console.log('Form Auto-Filler: Context menu created');
    }
  });
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab && tab.id) {
    fillFormInTab(tab.id, tab.url);
  }
});

/**
 * Fill form in the specified tab
 * @param {number} tabId - The tab ID
 * @param {string} url - The tab URL
 */
async function fillFormInTab(tabId, url) {
  // Check if it's a valid URL (not chrome:// or other restricted pages)
  if (!url || url.startsWith('chrome://') || url.startsWith('edge://') || 
      url.startsWith('about:') || url.startsWith('chrome-extension://')) {
    console.log('Form Auto-Filler: Cannot execute on this page');
    return;
  }
  
  try {
    // Inject and execute the content script
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['utils.js', 'content.js']
    });
    
    console.log('Form Auto-Filler: Content script injected successfully');
  } catch (error) {
    console.error('Form Auto-Filler: Failed to inject content script:', error);
  }
}

/**
 * Handle messages from popup or content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillForm' && sender.tab) {
    fillFormInTab(sender.tab.id, sender.tab.url);
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

/**
 * Handle extension icon click (already handled by popup, but keeping for reference)
 */
chrome.action.onClicked.addListener((tab) => {
  // This won't fire when popup is defined, but kept for reference
  if (tab && tab.id) {
    fillFormInTab(tab.id, tab.url);
  }
});

console.log('Form Auto-Filler: Background service worker loaded');

