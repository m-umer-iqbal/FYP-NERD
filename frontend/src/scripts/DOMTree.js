// src/scripts/DOMTree.js

(function() {
  'use strict';

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeDOM') {
      try {
        const result = analyzePageDOM();
        sendResponse({ success: true, data: result });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      return true; // Keep the message channel open for async response
    }
  });

  /**
   * Analyzes the current page's DOM and returns statistics and tree.
   * (Same function as before, now inside the content script)
   */
  function analyzePageDOM() {
    const count = (sel) => document.querySelectorAll(sel).length;

    const getDepth = (el) => {
      if (!el.children.length) return 0;
      return 1 + Math.max(...Array.from(el.children).map(getDepth));
    };

    const buildTree = (node) => {
      if (!node || node.nodeType !== 1) return null;
      return {
        tagName: node.tagName.toLowerCase(),
        children: Array.from(node.children)
          .map(child => buildTree(child))
          .filter(Boolean)
      };
    };

    const allElements = document.querySelectorAll('*');

    return {
      page_info: {
        title: document.title,
        url: window.location.href,
        doctype: document.doctype?.name || 'HTML5'
      },
      treeData: buildTree(document.documentElement),
      total_elements: allElements.length,
      divs: count('div'),
      spans: count('span'),
      paragraphs: count('p'),
      headings: count('h1,h2,h3,h4,h5,h6'),
      links: count('a'),
      images: count('img'),
      buttons: count('button'),
      inputs: count('input'),
      forms: count('form'),
      lists: count('ul,ol'),
      tables: count('table'),
      dom_depth: getDepth(document.body),
      elements_with_id: [...allElements].filter(el => el.id).length,
      elements_with_class: [...allElements].filter(el =>
        typeof el.className === 'string' && el.className.trim()
      ).length,
      timestamp: new Date().toLocaleString()
    };
  }
})();