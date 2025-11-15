/**
 * Resizes text within an element to fit within its fixed dimensions
 * @param {string} elementId - The ID of the element to resize
 * @param {number} minFontSize - Minimum font size in pixels (default: 8)
 */
function resizeTextToFit(elementId, minFontSize = 8) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`resizeTextToFit: Element with id "${elementId}" not found`);
    return;
  }

  // Get all text-containing children (spans, divs, p, etc.)
  const textElements = element.querySelectorAll('span, p, div');

  // Get all br elements for spacing
  const brElements = element.querySelectorAll('br');

  // If no children found, resize the element itself
  if (textElements.length === 0) {
    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    element.style.fontSize = fontSize + 'px';

    while ((element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) && fontSize > minFontSize) {
      fontSize -= 0.5;
      element.style.fontSize = fontSize + 'px';
    }
    return;
  }

  // Get initial font sizes for all children from their inline styles or computed styles
  const initialSizes = Array.from(textElements).map(el => {
    // Try to get from style attribute first (original), fallback to computed
    const styleAttr = el.getAttribute('style');
    if (styleAttr && styleAttr.includes('font-size')) {
      const match = styleAttr.match(/font-size:\s*([0-9.]+)pt/);
      if (match) {
        // Convert pt to px (1pt = 1.333px approximately)
        return parseFloat(match[1]) * 1.333;
      }
    }
    return parseFloat(window.getComputedStyle(el).fontSize);
  });

  // Reset all elements to their original sizes before measuring
  textElements.forEach((el, i) => {
    el.style.fontSize = initialSizes[i] + 'px';
  });

  // Set container font-size to control br spacing
  const containerStyle = window.getComputedStyle(element);
  const initialContainerFontSize = parseFloat(containerStyle.fontSize);
  element.style.fontSize = initialContainerFontSize + 'px';

  let scaleFactor = 1.0;

  // Reduce font size and spacing proportionally for all children until container fits
  while ((element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) && scaleFactor > minFontSize / Math.max(...initialSizes)) {
    scaleFactor -= 0.025;

    // Scale font sizes for all child elements
    textElements.forEach((el, i) => {
      const newSize = initialSizes[i] * scaleFactor;
      if (newSize >= minFontSize) {
        el.style.fontSize = newSize + 'px';
      }
    });

    // Scale container font size to reduce br spacing (br height is based on parent font-size)
    element.style.fontSize = (initialContainerFontSize * scaleFactor) + 'px';
  }
}

/**
 * Automatically resize all elements with data-resize-to-fit attribute
 */
function resizeAllMarkedElements() {
  const elements = document.querySelectorAll('[data-resize-to-fit]');
  elements.forEach(element => {
    if (element.id) {
      const minSize = element.getAttribute('data-min-font-size') || 8;
      resizeTextToFit(element.id, parseInt(minSize));
    }
  });
}

// Auto-run on multiple triggers to ensure it executes before PDF capture
if (typeof window !== 'undefined') {
  // Try immediate execution if DOM is already interactive or complete
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    resizeAllMarkedElements();
  }

  // Also listen for DOMContentLoaded as backup
  document.addEventListener('DOMContentLoaded', resizeAllMarkedElements);

  // And window load as final backup
  window.addEventListener('load', resizeAllMarkedElements);
}
