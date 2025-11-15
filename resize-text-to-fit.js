/**
 * Resizes text within an element to fit within its fixed dimensions
 * @param {string} elementId - The ID of the element to resize
 * @param {number} minFontSize - Minimum font size in pixels (default: 8)
 */
function resizeTextToFit(elementId, minFontSize) {
  minFontSize = minFontSize || 8;
  var element = document.getElementById(elementId);
  if (!element) {
    console.warn('resizeTextToFit: Element with id "' + elementId + '" not found');
    return;
  }

  // Get all child spans
  var textElements = element.querySelectorAll('span, p, div');
  if (textElements.length === 0) return;

  // Get initial font sizes from inline styles
  var initialSizes = [];
  for (var i = 0; i < textElements.length; i++) {
    var styleAttr = textElements[i].getAttribute('style');
    var match = styleAttr ? styleAttr.match(/font-size:\s*([0-9.]+)pt/) : null;
    if (match) {
      initialSizes[i] = parseFloat(match[1]) * 1.333; // Convert pt to px
    } else {
      initialSizes[i] = parseFloat(window.getComputedStyle(textElements[i]).fontSize);
    }
  }

  // Reset to original sizes
  for (var i = 0; i < textElements.length; i++) {
    textElements[i].style.fontSize = initialSizes[i] + 'px';
  }

  // Get container font size to control br spacing
  var containerStyle = window.getComputedStyle(element);
  var initialContainerFontSize = parseFloat(containerStyle.fontSize);
  element.style.fontSize = initialContainerFontSize + 'px';

  var scaleFactor = 1.0;

  // Find max initial size for minimum check
  var maxInitialSize = 0;
  for (var i = 0; i < initialSizes.length; i++) {
    if (initialSizes[i] > maxInitialSize) maxInitialSize = initialSizes[i];
  }

  // Shrink proportionally until it fits
  while ((element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) && scaleFactor > minFontSize / maxInitialSize) {
    scaleFactor -= 0.025;

    // Scale child span font sizes
    for (var i = 0; i < textElements.length; i++) {
      var newSize = initialSizes[i] * scaleFactor;
      if (newSize >= minFontSize) {
        textElements[i].style.fontSize = newSize + 'px';
      }
    }

    // Scale container font size to reduce br spacing
    element.style.fontSize = (initialContainerFontSize * scaleFactor) + 'px';
  }
}

/**
 * Automatically resize all elements with data-resize-to-fit attribute
 */
function resizeAllMarkedElements() {
  var elements = document.querySelectorAll('[data-resize-to-fit]');
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].id) {
      var minSize = elements[i].getAttribute('data-min-font-size') || 8;
      resizeTextToFit(elements[i].id, parseInt(minSize));
    }
  }
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
