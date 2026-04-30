(function () {
  // ------------------- helpers -------------------

  /**
 * Check if an element belongs to the NERD extension UI (floating buttons, modals)
 */
  function isExtensionUI(element) {
    let el = element;
    while (el) {
      if (el.id === 'ext-form-saver-btn' || el.id === 'ext-form-saver-modal') {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  // ---------- Element Highlighting ----------
  let currentHighlightedElement = null;

  function highlightElement(selector) {
    // Remove previous highlight
    if (currentHighlightedElement) {
      currentHighlightedElement.style.outline =
        currentHighlightedElement.dataset.nerdOriginalOutline || '';
      delete currentHighlightedElement.dataset.nerdOriginalOutline;
      currentHighlightedElement = null;
    }

    if (!selector) return;
    const el = document.querySelector(selector);
    if (el) {
      el.dataset.nerdOriginalOutline = el.style.outline;
      el.style.outline = '2px dashed #f472b6';
      currentHighlightedElement = el;
    }
  }

  function unhighlightElement(selector) {
    if (currentHighlightedElement) {
      const el = document.querySelector(selector);
      if (el === currentHighlightedElement) {
        el.style.outline = el.dataset.nerdOriginalOutline || '';
        delete el.dataset.nerdOriginalOutline;
        currentHighlightedElement = null;
      }
    }
  }

  /**
   * Gets CSS selector for element (improved)
   */
  function getSelector(element) {
    if (element.id) return `#${element.id}`;
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.className) {
        const cls = element.className.trim().split(/\s+/)[0];
        if (cls) selector += '.' + cls;
      }
      path.unshift(selector);
      element = element.parentElement;
    }
    return path.join(' > ');
  }

  /**
   * Safely compare two URLs
   */
  function normalizeUrl(url, baseUrl = window.location.href) {
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return null;
    }
  }

  // Contrast calculation (WCAG 2.0)
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastRatio(color1, color2) {
    // Validate colors
    if (!color1 || !color2 || color1.length < 3 || color2.length < 3) {
      return 4.5; // Default safe ratio
    }
    const lum1 = getLuminance(color1[0], color1[1], color1[2]);
    const lum2 = getLuminance(color2[0], color2[1], color2[2]);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * IMPROVED: Parse color from CSS - supports hex, rgb, rgba, hsl, hsla, named colors
   */
  function parseColor(cssColor) {
    if (!cssColor) return null;

    // Handle hex colors (#fff, #ffffff)
    if (cssColor.startsWith('#')) {
      const hex = cssColor.slice(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16)
        ];
      } else if (hex.length === 6) {
        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16)
        ];
      }
    }

    // Handle rgb/rgba
    if (cssColor.startsWith('rgb')) {
      const match = cssColor.match(/[\d.]+/g);
      if (match && match.length >= 3) {
        return [
          parseInt(match[0]),
          parseInt(match[1]),
          parseInt(match[2])
        ];
      }
    }

    // Handle hsl/hsla
    if (cssColor.startsWith('hsl')) {
      const match = cssColor.match(/[\d.]+/g);
      if (match && match.length >= 3) {
        const h = parseFloat(match[0]) / 360;
        const s = parseFloat(match[1]) / 100;
        const l = parseFloat(match[2]) / 100;
        return hslToRgb(h, s, l);
      }
    }

    // Handle common named colors
    const namedColors = {
      white: [255, 255, 255],
      black: [0, 0, 0],
      red: [255, 0, 0],
      green: [0, 128, 0],
      blue: [0, 0, 255],
      gray: [128, 128, 128],
      grey: [128, 128, 128],
      transparent: null
    };

    const color = namedColors[cssColor.toLowerCase()];
    return color || null;
  }

  /**
   * Convert HSL to RGB
   */
  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  }

  /**
 * Convert RGB to HSL (returns h:0-360, s:0-1, l:0-1)
 */
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s, l];
  }

  /**
   * Convert HSL back to RGB (returns [r,g,b] 0-255)
   */
  function hslToRgb2(h, s, l) {
    h /= 360;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Find a text colour that meets the required contrast ratio on the given background.
   * Tries to keep the original hue, adjusting lightness only.
   * Returns a hex string (e.g. "#2a2a2a").
   */
  function getAccessibleTextColor(bg, currentTextRgb, isLargeText) {
    const requiredRatio = isLargeText ? 3 : 4.5;
    const bgLuminance = getLuminance(bg[0], bg[1], bg[2]);

    // Convert current text to HSL
    const [h, s] = rgbToHsl(currentTextRgb[0], currentTextRgb[1], currentTextRgb[2]);

    // Decide direction: if background is dark, we need lighter text; if light, darker text.
    const bgIsLight = bgLuminance > 0.5;

    // Binary search on lightness to meet ratio
    let lo = bgIsLight ? 0 : 0.5, hi = bgIsLight ? 0.5 : 1;
    let bestL = bgIsLight ? 0 : 1; // fallback
    let found = false;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      const testRgb = hslToRgb2(h, s, mid);
      const testLum = getLuminance(testRgb[0], testRgb[1], testRgb[2]);
      let ratio;
      if (bgIsLight) {
        ratio = (bgLuminance + 0.05) / (testLum + 0.05);
      } else {
        ratio = (testLum + 0.05) / (bgLuminance + 0.05);
      }
      if (ratio >= requiredRatio) {
        bestL = mid;
        found = true;
        if (bgIsLight) lo = mid; // need even darker? no, we just need at least this, but we can try to get closer to original lightness if possible
        else hi = mid;
        // Actually we want the closest to the original lightness still meeting ratio.
        // We'll record the best and continue to see if we can get closer to original L.
        if (bgIsLight) lo = mid + 0.001; // try darker
        else hi = mid - 0.001; // try lighter
      } else {
        if (bgIsLight) hi = mid;
        else lo = mid;
      }
    }
    if (!found) {
      // Fallback: pure black or white
      return bgIsLight ? '#000000' : '#ffffff';
    }

    // Now bestL is the closest to the original but still meeting requirement? Not necessarily.
    // We'll do a second pass to find the lightness that is closest to originalL while still meeting ratio.
    const originalL = rgbToHsl(currentTextRgb[0], currentTextRgb[1], currentTextRgb[2])[2];

    // Optimisation: search the whole range and pick the one with minimum difference in L
    let bestDiff = Infinity;
    let finalL = bestL;
    for (let l = 0; l <= 1; l += 0.01) {
      const testRgb = hslToRgb2(h, s, l);
      const testLum = getLuminance(testRgb[0], testRgb[1], testRgb[2]);
      let ratio;
      if (bgIsLight) {
        ratio = (bgLuminance + 0.05) / (testLum + 0.05);
      } else {
        ratio = (testLum + 0.05) / (bgLuminance + 0.05);
      }
      if (ratio >= requiredRatio) {
        const diff = Math.abs(l - originalL);
        if (diff < bestDiff) {
          bestDiff = diff;
          finalL = l;
        }
      }
    }

    const finalRgb = hslToRgb2(h, s, finalL);
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(finalRgb[0])}${toHex(finalRgb[1])}${toHex(finalRgb[2])}`;
  }

  /**
   * IMPROVED: Get effective background color with better fallback
   */
  function getEffectiveBackground(element) {
    let el = element;
    while (el) {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        const parsed = parseColor(bg);
        if (parsed) return parsed;
      }
      el = el.parentElement;
    }
    // Better fallback: check document background
    const htmlBg = parseColor(window.getComputedStyle(document.documentElement).backgroundColor);
    if (htmlBg) return htmlBg;
    const bodyBg = parseColor(window.getComputedStyle(document.body).backgroundColor);
    if (bodyBg) return bodyBg;
    return [255, 255, 255]; // Default white
  }

  function isLargeText(element) {
    const style = window.getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;
    const isBold = fontWeight >= '600' || fontWeight === 'bold';
    // WCAG: large text = at least 18pt (24px) or bold and at least 14pt (18.66px)
    const pxSize = fontSize;
    return (pxSize >= 24) || (isBold && pxSize >= 18.66);
  }

  // ------------------- Analysis functions -------------------

  /**
   * IMPROVED: Large images detection with better URL handling
   */
  function analyzeLargeImages() {
    const issues = [];
    const resources = performance.getEntriesByType('resource');
    const imgs = document.querySelectorAll('img');

    for (const img of imgs) {
      const src = img.currentSrc || img.src;
      if (!src) continue;

      const normalizedSrc = normalizeUrl(src);
      if (!normalizedSrc) continue;

      const entry = resources.find(r => {
        const normalizedResource = normalizeUrl(r.name);
        return normalizedResource === normalizedSrc && r.initiatorType === 'img';
      });

      if (!entry) continue;

      const sizeBytes = entry.transferSize || entry.encodedBodySize || entry.decodedBodySize || 0;
      if (sizeBytes === 0) continue;

      const sizeMB = sizeBytes / (1024 * 1024);
      if (sizeMB < 0.2) continue; // under 200KB, ignore

      const srcClean = src.split('?')[0];        // no query params
      const ext = srcClean.split('.').pop().toLowerCase();
      const modernFormat = ext === 'webp' || ext === 'avif' || ext === 'svg';

      // If the image is a modern format, only suggest compression
      let formatSuggestion = '';
      let recommendedExt = ext;
      if (!modernFormat) {
        recommendedExt = 'webp';   // widely supported, smaller
        formatSuggestion = `Convert from .${ext} to .${recommendedExt} (typically 25–35% smaller). `;
      }

      const targetKB = 200;
      const neededReduction = ((sizeKB - targetKB) / sizeKB * 100).toFixed(0);
      const compressSuggestion = sizeMB > 0.5 ?
        `Compress from ${(sizeBytes / 1024).toFixed(0)} KB to under ${targetKB} KB (reduce by ~${neededReduction}%). ` : '';

      const lazySuggestion = img.loading !== 'lazy' ? 'Add loading="lazy" for lazy loading. ' : '';

      const suggestion = (formatSuggestion + compressSuggestion + lazySuggestion).trim();

      const codeFixSrc = srcClean.replace(/\.[^.]+$/, `.${recommendedExt}`);
      const codeFix = `<img src="${codeFixSrc}" alt="..." loading="lazy" />`;

      issues.push({
        id: crypto.randomUUID(),
        category: 'performance',
        type: 'large-image',
        title: 'Large Image Detected',
        description: `${src.split('/').pop()} is ${sizeMB.toFixed(1)} MB`,
        location: {
          file: window.location.href,
          line: 'N/A',
          element: getSelector(img)
        },
        suggestion: suggestion || 'Optimise image size and format.',
        codeFix: codeFix,
        impact: {
          performance: sizeMB > 1 ? 'high' : 'medium',
          accessibility: 'low',
          seo: sizeMB > 0.5 ? 'medium' : 'low'
        }
      });
    }
    return issues;
  }

  /**
   * IMPROVED: Slow scripts detection with better blocking detection
   */
  function analyzeSlowScripts() {
    const issues = [];
    const scripts = document.querySelectorAll('script[src]');
    const resources = performance.getEntriesByType('resource');

    for (const script of scripts) {
      const src = script.src;
      if (!src) continue;

      const normalizedSrc = normalizeUrl(src);
      const entry = resources.find(r => {
        const normalizedResource = normalizeUrl(r.name);
        return normalizedResource === normalizedSrc && r.initiatorType === 'script';
      });

      if (!entry) continue;

      const duration = entry.responseEnd - entry.startTime;
      const sizeKB = (entry.transferSize || entry.encodedBodySize || 0) / 1024;
      const isAsync = script.async || script.defer || script.type === 'module';
      const isBlocking = !isAsync && script.src;

      if (duration > 300 || sizeKB > 100 || isBlocking) {
        const suggestionParts = [];

        if (isBlocking) {
          suggestionParts.push('Add `defer` (or `async` if order doesn’t matter) to stop blocking render.');
        }
        if (duration > 300) {
          suggestionParts.push(`Load time is ${duration.toFixed(0)} ms – consider lazy‑loading this script or splitting it.`);
        }
        if (sizeKB > 100) {
          suggestionParts.push(`File size is ${Math.round(sizeKB)} KB. Try to keep it under 100 KB; use code‑splitting or dynamic imports.`);
        }

        const suggestion = suggestionParts.join(' ');

        const codeFix = `<script src="${src.split('/').pop()}" defer></script>`;

        issues.push({
          id: crypto.randomUUID(),
          category: 'performance',
          type: 'slow-script',
          title: 'Slow / Blocking Script',
          description: `${src.split('/').pop()} is ${isBlocking ? 'render‑blocking' : 'slow'} (${duration.toFixed(0)} ms, ${Math.round(sizeKB)} KB)`,
          location: {
            file: window.location.href,
            line: 'N/A',
            element: getSelector(script)
          },
          suggestion,
          codeFix,
          impact: {
            performance: (duration > 500 || sizeKB > 200) ? 'high' : 'medium',
            accessibility: 'none',
            seo: 'medium'
          }
        });
      }
    }
    return issues;
  }

  function analyzeMissingAlt() {
    const issues = [];
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === '') {
        const src = img.currentSrc || img.src;
        const filename = src ? src.split('/').pop() : 'image';
        issues.push({
          id: crypto.randomUUID(),
          category: 'accessibility',
          type: 'missing-alt',
          title: 'Missing Alt Text',
          description: 'Image has no alt attribute',
          location: {
            file: window.location.href,
            line: 'N/A',
            element: getSelector(img)
          },
          suggestion: 'Add a descriptive alt text for screen readers and SEO.',
          codeFix: `<img src="${filename}" alt="Descriptive text">`,
          impact: {
            performance: 'none',
            accessibility: 'high',
            seo: 'high'
          }
        });
      }
    }
    return issues;
  }

  /**
   * IMPROVED: Color contrast analysis - checks full text content
   */
  function analyzeColorContrast() {
    const issues = [];
    const allTextElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, div, label, button');
    const textElements = Array.from(allTextElements).filter(el => !isExtensionUI(el));
    const seen = new Set();

    for (const el of textElements) {
      const text = el.textContent?.trim();
      if (!text || text.length < 2) continue;

      const elKey = el.toString();
      if (seen.has(elKey)) continue;
      seen.add(elKey);

      try {
        const style = window.getComputedStyle(el);
        const textColor = parseColor(style.color);
        const bgColor = getEffectiveBackground(el);
        if (!textColor || !bgColor) continue;

        const ratio = getContrastRatio(textColor, bgColor);
        const isLarge = isLargeText(el);
        const threshold = isLarge ? 3 : 4.5;

        if (ratio < threshold) {
          // Compute a proper accessible text colour
          const accessibleColor = getAccessibleTextColor(bgColor, textColor, isLarge);
          const ratioWouldBe = getContrastRatio(parseColor(accessibleColor), bgColor);

          issues.push({
            id: crypto.randomUUID(),
            category: 'accessibility',
            type: 'low-contrast',
            title: 'Low Color Contrast',
            description: `Contrast ratio ${ratio.toFixed(1)}:1 (minimum ${threshold}:1). Text: ${style.color}, Background: ${window.getComputedStyle(getEffectiveBackgroundElement(el)).backgroundColor}`,
            location: {
              file: window.location.href,
              line: 'N/A',
              element: getSelector(el)
            },
            suggestion: `Change text colour to ${accessibleColor} – this will give a ratio of ${ratioWouldBe.toFixed(1)}:1 and keep the same hue.`,
            codeFix: `color: ${accessibleColor}; /* was ${style.color} */`,
            impact: {
              performance: 'none',
              accessibility: 'high',
              seo: 'medium'
            }
          });
        }
      } catch (err) {
        console.warn('Error analyzing contrast for element:', el, err);
      }
    }
    return issues;
  }

  // Helper: get the actual DOM element used for background calculation (needed for style string in description)
  function getEffectiveBackgroundElement(element) {
    let el = element;
    while (el) {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return el;
      }
      el = el.parentElement;
    }
    return document.body;
  }

  /**
   * IMPROVED: Heading structure validation
   */
  function analyzeHeadingStructure() {
    const issues = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;

    for (const heading of headings) {
      const level = parseInt(heading.tagName.substring(1));

      // Allow jump to h1 (new section), but not other skips
      const isNewSection = level === 1;
      const skippedLevels = level > previousLevel + 1;

      if (previousLevel > 0 && skippedLevels && !isNewSection) {
        issues.push({
          id: crypto.randomUUID(),
          category: 'accessibility',
          type: 'heading-structure',
          title: 'Heading Structure Skipped',
          description: `Heading level jumped from h${previousLevel} to h${level}`,
          location: {
            file: window.location.href,
            line: 'N/A',
            element: getSelector(heading)
          },
          suggestion: `Change <h${level}> to <h${previousLevel + 1}> to maintain proper hierarchy.`,
          codeFix: `<h${previousLevel + 1}>${heading.textContent.trim()}</h${previousLevel + 1}>`,
          impact: {
            performance: 'none',
            accessibility: 'high',
            seo: 'high'
          }
        });
      }
      previousLevel = level;
    }
    return issues;
  }

  /**
   * IMPROVED: Inline styles detection with better threshold
   */
  function analyzeInlineStyles() {
    const issues = [];
    const elementsWithStyle = Array.from(document.querySelectorAll('[style]'))
      .filter(el => !isExtensionUI(el));

    for (const el of elementsWithStyle) {
      const styleAttr = el.getAttribute('style');
      if (!styleAttr) continue;

      // Count number of CSS properties instead of character length
      const propertyCount = styleAttr.split(';').filter(s => s.trim() && s.includes(':')).length;

      // Flag only if multiple properties (3+) are inlined
      if (propertyCount >= 3) {
        issues.push({
          id: crypto.randomUUID(),
          category: 'code-quality',
          type: 'inline-styles',
          title: 'Inline Styles Detected',
          description: `Element has ${propertyCount} inlined CSS properties`,
          location: {
            file: window.location.href,
            line: 'N/A',
            element: getSelector(el)
          },
          suggestion: 'Move styles to a CSS class for maintainability and performance.',
          codeFix: `<!-- Replace style="..." with class="my-class" -->`,
          impact: {
            performance: 'low',
            accessibility: 'none',
            seo: 'none'
          }
        });
      }
      if (issues.length > 10) break; // limit spam
    }
    return issues;
  }

  /**
   * IMPROVED: Inline event handlers detection - now includes modern handlers
   */
  function analyzeInlineEventHandlers() {
    const issues = [];
    // FIXED: Comprehensive list of event handlers including modern ones
    const eventAttrs = [
      'onclick', 'onmouseover', 'onmouseout', 'onchange', 'onkeydown', 'onkeyup',
      'onload', 'onsubmit', 'oninput', 'onfocus', 'onblur', 'ondrag', 'ondrop',
      'onwheel', 'onscroll', 'ontouchstart', 'ontouchend', 'ontouchmove',
      'oncontextmenu', 'ondblclick', 'onmousedown', 'onmouseup', 'onmousemove'
    ];

    const allElements = Array.from(document.querySelectorAll('*'))
      .filter(el => !isExtensionUI(el));
    const seen = new Set();

    for (const el of allElements) {
      for (const attr of eventAttrs) {
        if (el.hasAttribute(attr)) {
          const key = getSelector(el) + ':' + attr;
          if (seen.has(key)) continue;
          seen.add(key);

          issues.push({
            id: crypto.randomUUID(),
            category: 'code-quality',
            type: 'inline-events',
            title: 'Inline Event Handler',
            description: `Element uses ${attr} attribute`,
            location: {
              file: window.location.href,
              line: 'N/A',
              element: getSelector(el)
            },
            suggestion: 'Replace with addEventListener in your JavaScript for better separation of concerns.',
            codeFix: `element.addEventListener('${attr.replace('on', '')}', handler);`,
            impact: {
              performance: 'low',
              accessibility: 'none',
              seo: 'none'
            }
          });

          if (issues.length > 20) break;
        }
      }
      if (issues.length > 20) break;
    }
    return issues;
  }

  // Main analysis runner
  async function runFullAnalysis() {
    // IMPROVED: Wait for document to be fully loaded instead of arbitrary timeout
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve, { once: true });
      });
    }

    // Give a small delay for resource entries to be populated
    await new Promise(resolve => setTimeout(resolve, 200));

    const allIssues = [
      ...analyzeLargeImages(),
      ...analyzeSlowScripts(),
      ...analyzeMissingAlt(),
      ...analyzeColorContrast(),
      ...analyzeHeadingStructure(),
      ...analyzeInlineStyles(),
      ...analyzeInlineEventHandlers()
    ];

    return allIssues;
  }

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'runWebsiteAuditor') {
      runFullAnalysis().then(issues => {
        sendResponse({ success: true, issues });
      }).catch(err => {
        sendResponse({ success: false, error: err.message });
      });
      return true; // async response
    }

    if (message.action === 'highlightElement') {
      highlightElement(message.selector);
      sendResponse({ success: true });
      return false; // synchronous
    }

    if (message.action === 'unhighlightElement') {
      unhighlightElement(message.selector);
      sendResponse({ success: true });
      return false;
    }

    return false;
  });

})();