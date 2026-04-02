// utils.js -- Shared utility functions for Lola's Party System
// Loaded as a non-module <script> on all pages before module scripts.

/**
 * Escape a string for safe HTML insertion (prevents XSS).
 * Uses the DOM textContent/innerHTML pattern.
 * @param {*} str - Value to escape (null/undefined returns '')
 * @returns {string} HTML-escaped string
 */
window.escapeHtml = function(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
};
