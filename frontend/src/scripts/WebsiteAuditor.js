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

      // Normalize URL for comparison
      const normalizedSrc = normalizeUrl(src);
      if (!normalizedSrc) continue;

      // Find resource entry with better matching
      const entry = resources.find(r => {
        const normalizedResource = normalizeUrl(r.name);
        return normalizedResource === normalizedSrc && r.initiatorType === 'img';
      });

      if (!entry) continue;

      const sizeBytes = entry.transferSize || entry.encodedBodySize || entry.decodedBodySize || 0;
      if (sizeBytes === 0) continue;

      const sizeMB = sizeBytes / (1024 * 1024);
      if (sizeMB < 0.2) continue; // under 200KB, ignore

      // FIXED: Remove query parameters before checking format
      const format = src.split('?')[0].split('.').pop().toLowerCase();
      const modernFormats = ['webp', 'avif', 'svg'];
      const needsModernFormat = !modernFormats.includes(format);

      const suggestion = [
        needsModernFormat ? `Convert to WebP/AVIF format.` : '',
        sizeMB > 0.5 ? `Compress image below 200KB (currently ${sizeMB.toFixed(1)}MB).` : '',
        img.loading !== 'lazy' ? 'Add loading="lazy" for lazy loading.' : ''
      ].filter(Boolean).join(' ');

      issues.push({
        id: crypto.randomUUID(),
        category: 'performance',
        type: 'large-image',
        title: 'Large Image Detected',
        description: `${src.split('/').pop()} is ${sizeMB.toFixed(1)}MB`,
        location: {
          file: window.location.href,
          line: 'N/A',
          element: getSelector(img)
        },
        suggestion: suggestion || 'Optimize image size and format.',
        codeFix: `<img src="image.webp" alt="..." loading="lazy" />`,
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

      // FIXED: Module scripts are async by default
      const isAsync = script.async || script.defer || script.type === 'module';
      const isBlocking = !isAsync && script.src;

      if (duration > 300 || sizeKB > 100 || isBlocking) {
        const suggestion = [];
        if (isBlocking) suggestion.push('Add `defer` or `async` attribute to avoid blocking rendering.');
        if (duration > 300) suggestion.push(`Script took ${duration.toFixed(0)}ms to load – consider code splitting or lazy loading.`);
        if (sizeKB > 100) suggestion.push(`Script is large (${Math.round(sizeKB)}KB). Use dynamic imports or code splitting.`);

        issues.push({
          id: crypto.randomUUID(),
          category: 'performance',
          type: 'slow-script',
          title: 'Slow / Blocking Script',
          description: `${src.split('/').pop()} is ${isBlocking ? 'render‑blocking' : 'slow'} (${duration.toFixed(0)}ms, ${Math.round(sizeKB)}KB)`,
          location: {
            file: window.location.href,
            line: 'N/A',
            element: getSelector(script)
          },
          suggestion: suggestion.join(' '),
          codeFix: `<script src="${src.split('/').pop()}" defer></script>`,
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
          codeFix: `<img src="..." alt="Descriptive text">`,
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
      // FIXED: Check full text content, not just first child node
      const text = el.textContent?.trim();
      if (!text || text.length < 2) continue;

      // Avoid analyzing same element twice
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
          issues.push({
            id: crypto.randomUUID(),
            category: 'accessibility',
            type: 'low-contrast',
            title: 'Low Color Contrast',
            description: `Contrast ratio ${ratio.toFixed(1)}:1 (minimum ${threshold}:1)`,
            location: {
              file: window.location.href,
              line: 'N/A',
              element: getSelector(el)
            },
            suggestion: `Use darker text or lighter background. Current: ${style.color} on background.`,
            codeFix: `color: #333333; /* or adjust background */`,
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
      return true; // indicates async response
    }
    return false;
  });

})();