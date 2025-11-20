/**
 * Main application initialization for iClouds.no
 * Coordinates all modules and manages centralized application state
 */

// Constants for membership pricing
const MEMBERSHIP_PRICES = {
    CIRRUS: 0,
    CUMULUS: 49,
    CUMULONIMBUS: 199
};

// Centralized application state
window.appState = {
    cart: [],
    currentMembership: null,
    gameScore: 0,
    currentCloud: 'cumulus',
    cartVisible: false
};

/**
 * Initializes all application modules
 * @returns {void}
 */
function initializeApp() {
    try {
        // Initialize all modules
        initializeNavigation();
        initializeCart();
        initializeForms();
        initializeGame();

        console.log('iClouds application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showToast('An error occurred while loading the application. Please refresh the page.', 'error');
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}
