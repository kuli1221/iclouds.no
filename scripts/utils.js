/**
 * Utility functions for the iClouds application
 */

// Toast notification queue to show one at a time
const toastQueue = [];
let isShowingToast = false;

/**
 * Shows a toast notification message to the user
 * Implements a queue system to show one toast at a time
 * @param {string} message - The message to display
 * @param {string} type - Type of toast ('info', 'success', 'warning', 'error')
 * @returns {void}
 */
function showToast(message, type = 'info') {
    toastQueue.push({ message, type });
    processToastQueue();
}

/**
 * Processes the toast notification queue
 * Shows the next toast if none is currently being displayed
 * @returns {void}
 */
function processToastQueue() {
    if (isShowingToast || toastQueue.length === 0) {
        return;
    }

    isShowingToast = true;
    const { message, type } = toastQueue.shift();
    displayToast(message, type);
}

/**
 * Displays a single toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast ('info', 'success', 'warning', 'error')
 * @returns {void}
 */
function displayToast(message, type) {
    // Remove any existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = sanitizeHTML(message);
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            isShowingToast = false;
            processToastQueue(); // Process next toast in queue
        }, 300);
    }, 4000);
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Safely gets an element by selector with error handling
 * @param {string} selector - CSS selector
 * @returns {Element|null} The element or null if not found
 */
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.error(`Error selecting element: ${selector}`, error);
        return null;
    }
}

/**
 * Safely gets all elements by selector with error handling
 * @param {string} selector - CSS selector
 * @returns {NodeList|Array} NodeList of elements or empty array
 */
function safeQuerySelectorAll(selector) {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.error(`Error selecting elements: ${selector}`, error);
        return [];
    }
}

/**
 * Creates a loading spinner element
 * @returns {HTMLElement} Loading spinner element
 */
function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-label', 'Loading');
    spinner.innerHTML = '<span class="spinner-icon">☁️</span>';
    return spinner;
}
