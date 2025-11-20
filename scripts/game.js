/**
 * Cloud identification game functionality
 */

// Constants
const CLOUD_TYPES = ['cirrus', 'cumulus', 'stratus', 'nimbus'];
const HIGH_SCORE_KEY = 'iclouds_high_score';

/**
 * Checks the user's answer against the current cloud type
 * @param {string} guess - The cloud type guessed by the user
 * @param {HTMLElement} button - The button element that was clicked
 * @returns {void}
 */
function checkAnswer(guess, button) {
    if (!guess || !button) {
        console.error('Invalid game parameters');
        return;
    }

    const result = safeQuerySelector('#game-result');
    if (!result) return;

    const currentCloud = window.appState.currentCloud;

    if (guess === currentCloud) {
        result.textContent = "✅ Correct! You're a natural cloud spotter!";
        result.style.color = '#27ae60';
        result.setAttribute('aria-live', 'polite');
        button.style.backgroundColor = '#27ae60';
        button.style.color = 'white';

        // Increment score
        window.appState.gameScore++;
        updateHighScore();
    } else {
        result.textContent = `❌ Not quite! That was a ${currentCloud} cloud. Keep practicing!`;
        result.style.color = '#e74c3c';
        result.setAttribute('aria-live', 'polite');
        button.style.backgroundColor = '#e74c3c';
        button.style.color = 'white';
    }

    // Reset button styles after 3 seconds
    setTimeout(() => {
        const gameButtons = safeQuerySelectorAll('.cloud-game .btn');
        gameButtons.forEach(btn => {
            btn.style.backgroundColor = '';
            btn.style.color = '';
        });
    }, 3000);
}

/**
 * Resets the game with a new random cloud type
 * @returns {void}
 */
function resetGame() {
    // Select random cloud type
    window.appState.currentCloud = CLOUD_TYPES[Math.floor(Math.random() * CLOUD_TYPES.length)];
    
    const result = safeQuerySelector('#game-result');
    if (result) {
        result.textContent = '';
        result.removeAttribute('aria-live');
    }

    // Reset button styles
    const gameButtons = safeQuerySelectorAll('.cloud-game .btn');
    gameButtons.forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.color = '';
    });

    // Animate cloud shape
    const cloudShape = safeQuerySelector('.cloud-shape');
    if (cloudShape) {
        cloudShape.style.animation = 'none';
        // Trigger reflow to restart animation
        void cloudShape.offsetHeight;
        cloudShape.style.animation = null;
    }
}

/**
 * Updates and saves the high score if current score is higher
 * @returns {void}
 */
function updateHighScore() {
    try {
        const currentScore = window.appState.gameScore;
        const savedHighScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);

        if (currentScore > savedHighScore) {
            localStorage.setItem(HIGH_SCORE_KEY, currentScore.toString());
            showToast(`🎉 New High Score: ${currentScore}! You're becoming a true cloud expert!`, 'success');
        }
    } catch (error) {
        console.error('Error updating high score:', error);
    }
}

/**
 * Loads the high score from localStorage
 * @returns {number} The saved high score
 */
function loadHighScore() {
    try {
        return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
    } catch (error) {
        console.error('Error loading high score:', error);
        return 0;
    }
}

/**
 * Displays the current game score and high score
 * @returns {void}
 */
function displayScore() {
    const scoreDisplay = safeQuerySelector('#game-score');
    if (scoreDisplay) {
        const highScore = loadHighScore();
        scoreDisplay.textContent = `Score: ${window.appState.gameScore} | High Score: ${highScore}`;
    }
}

/**
 * Initializes the cloud identification game
 * @returns {void}
 */
function initializeGame() {
    window.appState.gameScore = 0;
    resetGame();

    // Add keyboard navigation for game buttons
    const gameOptions = safeQuerySelector('.game-options');
    if (gameOptions) {
        gameOptions.addEventListener('keydown', (event) => {
            const buttons = Array.from(gameOptions.querySelectorAll('.btn'));
            const currentIndex = buttons.indexOf(document.activeElement);

            if (event.key === 'ArrowRight' && currentIndex < buttons.length - 1) {
                event.preventDefault();
                buttons[currentIndex + 1].focus();
            } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
                event.preventDefault();
                buttons[currentIndex - 1].focus();
            }
        });
    }
}
