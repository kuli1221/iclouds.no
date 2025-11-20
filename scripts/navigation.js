/**
 * Navigation and UI interaction functionality
 */

let lastFocusedElement = null;

/**
 * Smooth scrolls to a target element
 * @param {string} targetId - ID of the target element
 * @returns {void}
 */
function smoothScroll(targetId) {
    const element = safeQuerySelector(`#${targetId}`);
    if (element) {
        // Get the header height to offset the scroll position
        const header = safeQuerySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const additionalOffset = 20; // Extra spacing for better visual appearance
        
        // Calculate the target position accounting for the sticky header
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - additionalOffset;
        
        // Scroll to the calculated position
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Clear hash from URL after scrolling
        if (history.pushState) {
            history.pushState(null, null, window.location.pathname);
        } else {
            window.location.hash = '';
        }

        // Set focus to the section for screen readers after scroll completes
        setTimeout(() => {
            element.setAttribute('tabindex', '-1');
            element.focus();
            
            // Remove tabindex after focus
            setTimeout(() => {
                element.removeAttribute('tabindex');
            }, 100);
        }, 500); // Wait for smooth scroll to complete
    }
}

/**
 * Scrolls to the top of the page
 * @returns {void}
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Clear hash from URL
    if (history.pushState) {
        history.pushState(null, null, window.location.pathname);
    } else {
        window.location.hash = '';
    }
}

/**
 * Toggles the mobile navigation menu
 * @returns {void}
 */
function toggleMobileMenu() {
    const navList = safeQuerySelector('nav ul');
    const menuBtn = safeQuerySelector('.mobile-menu-btn');
    
    if (!navList || !menuBtn) return;

    const isActive = navList.classList.contains('active');
    
    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

/**
 * Opens the mobile menu with focus management
 * @returns {void}
 */
function openMobileMenu() {
    const navList = safeQuerySelector('nav ul');
    const menuBtn = safeQuerySelector('.mobile-menu-btn');
    
    if (!navList || !menuBtn) return;

    // Store the last focused element
    lastFocusedElement = document.activeElement;

    navList.classList.add('active');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    navList.setAttribute('aria-hidden', 'false');

    // Focus first link in menu
    const firstLink = navList.querySelector('a');
    if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
    }

    // Trap focus within menu
    setupFocusTrap(navList, menuBtn);
}

/**
 * Closes the mobile menu and restores focus
 * @returns {void}
 */
function closeMobileMenu() {
    const navList = safeQuerySelector('nav ul');
    const menuBtn = safeQuerySelector('.mobile-menu-btn');
    
    if (!navList || !menuBtn) return;

    navList.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    navList.setAttribute('aria-hidden', 'true');

    // Restore focus to the button
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

/**
 * Sets up focus trapping for mobile menu
 * @param {HTMLElement} container - Container element
 * @param {HTMLElement} closeButton - Button to close the menu
 * @returns {void}
 */
function setupFocusTrap(container, closeButton) {
    const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const trapFocus = (event) => {
        if (event.key !== 'Tab') return;

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                closeButton.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    };

    container.addEventListener('keydown', trapFocus);
}

/**
 * Handles membership tier selection and display
 * @param {string} tier - Membership tier (cirrus, cumulus, cumulonimbus)
 * @returns {void}
 */
function joinMembership(tier) {
    const MEMBERSHIP_MESSAGES = {
        cirrus: "You've chosen the Cirrus Tier - floating gently into our community!",
        cumulus: "Cumulus Tier selected - you're building something substantial!",
        cumulonimbus: "Cumulonimbus Tier - prepare for a storm of exclusive benefits!"
    };

    const messageDiv = safeQuerySelector('#membership-message');
    if (!messageDiv) return;

    try {
        window.appState.currentMembership = tier;

        messageDiv.innerHTML = `
            <h3>⏳ Processing Your Application</h3>
            <p>${sanitizeHTML(MEMBERSHIP_MESSAGES[tier] || 'Processing your membership...')}</p>
            <p><em>Consulting atmospheric conditions... Checking cloud alignment...</em></p>
            <div class="loading" role="status" aria-label="Loading">☁️ ⏳ ☁️</div>
            <p>This may take 2-5 business days (or until we see a particularly interesting cloud formation)</p>
            <button onclick="showWelcomeMessage('${tier}')" class="btn" data-action="simulate-approval">Simulate Approval</button>
        `;
        messageDiv.style.display = 'block';
        messageDiv.setAttribute('role', 'region');
        messageDiv.setAttribute('aria-live', 'polite');
    } catch (error) {
        console.error('Error joining membership:', error);
        showToast('Failed to process membership. Please try again.', 'error');
    }
}

/**
 * Shows welcome message after membership approval
 * @param {string} tier - Membership tier
 * @returns {void}
 */
function showWelcomeMessage(tier) {
    const messageDiv = safeQuerySelector('#membership-message');
    if (!messageDiv) return;

    messageDiv.innerHTML = `
        <h3>🎉 Membership Approved! 🎉</h3>
        <p>Welcome to iClouds! As a ${sanitizeHTML(tier)} member, you now have:</p>
        <ul class="welcome-list">
            <li>Permission to look skyward during meetings</li>
            <li>Bragging rights at meteorological parties</li>
            <li>Our sincere appreciation for your excellent taste</li>
        </ul>
        <p><strong>Pro Tip:</strong> Your membership card will arrive via cumulus mail (allow 4-6 weeks)</p>
        <button onclick="closeMembershipMessage()" class="btn" data-action="close-message">Begin Cloud Appreciation</button>
    `;
    messageDiv.setAttribute('aria-live', 'polite');
}

/**
 * Closes the membership message
 * @returns {void}
 */
function closeMembershipMessage() {
    const messageDiv = safeQuerySelector('#membership-message');
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
}

/**
 * Shows an alert for social media links
 * @param {string} platform - Social media platform name
 * @returns {void}
 */
function showSocialAlert(platform) {
    const SOCIAL_MESSAGES = {
        'Instagram': 'Follow us on Instagram for daily cloud photography and sky-gazing inspiration! 📸☁️',
        'Twitter': 'Join the conversation on Twitter using #iCloudsAppreciation! 🐦🌤️',
        'Forums': 'Our member forums are where serious cloud discussions happen. Join to participate! 💭⛅'
    };

    const message = SOCIAL_MESSAGES[platform] || 'Coming soon to a cloud near you!';
    showToast(`${platform}: ${message}`, 'info');
}

/**
 * Shows newsletter signup dialog
 * @returns {void}
 */
function showNewsletterSignup() {
    const email = prompt('Enter your email to subscribe to "The Condensation" newsletter:\n\n(Monthly cloud spotting tips, featured sightings, and atmospheric poetry)');
    
    if (email && email.includes('@')) {
        showToast('Thank you! You\'ve been added to our newsletter. Check your inbox for a confirmation cloud. 📧☁️', 'success');
    } else if (email) {
        showToast('That doesn\'t look like a valid email address. Please try again with a real cloud... I mean, email. 🌥️', 'warning');
    }
}

/**
 * Initializes navigation and UI interactions
 * @returns {void}
 */
function initializeNavigation() {
    // Mobile menu button
    const mobileMenuBtn = safeQuerySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Open menu');
        mobileMenuBtn.setAttribute('aria-controls', 'main-navigation');
    }

    // Navigation links - smooth scrolling
    const navLinks = safeQuerySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            smoothScroll(targetId);
            closeMobileMenu();
        });
    });

    // Footer links - smooth scrolling
    const footerLinks = safeQuerySelectorAll('.footer-links a[href^="#"]');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            smoothScroll(targetId);
        });
    });

    // Logo click - scroll to top
    const logo = safeQuerySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', scrollToTop);
        logo.setAttribute('role', 'button');
        logo.setAttribute('tabindex', '0');
        logo.setAttribute('aria-label', 'Scroll to top');
        
        // Keyboard support for logo
        logo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToTop();
            }
        });
    }

    // Close mobile menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const navList = safeQuerySelector('nav ul');
            if (navList && navList.classList.contains('active')) {
                closeMobileMenu();
            }
            
            // Also close cart dropdown
            const cartDropdown = safeQuerySelector('#cart-dropdown');
            if (cartDropdown && cartDropdown.style.display === 'block') {
                cartDropdown.style.display = 'none';
                window.appState.cartVisible = false;
            }
        }
    });

    // Membership tabs
    const tabBtns = safeQuerySelectorAll('.tab-btn');
    const tabContents = safeQuerySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab') + '-tab';
            
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-hidden', 'true');
            });
            
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            
            const targetTab = safeQuerySelector(`#${tabId}`);
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.setAttribute('aria-hidden', 'false');
            }
        });

        // Keyboard support for tabs
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');
    });

    // FAQ Accordion
    const faqQuestions = safeQuerySelectorAll('.faq-question');
    faqQuestions.forEach((question, index) => {
        const answer = question.nextElementSibling;
        const questionId = `faq-question-${index}`;
        const answerId = `faq-answer-${index}`;

        // Set up ARIA attributes
        question.id = questionId;
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        question.setAttribute('aria-controls', answerId);
        question.setAttribute('tabindex', '0');

        if (answer) {
            answer.id = answerId;
            answer.setAttribute('role', 'region');
            answer.setAttribute('aria-labelledby', questionId);
        }

        question.addEventListener('click', () => toggleFAQ(question));
        
        // Keyboard support
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ(question);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextQuestion = faqQuestions[index + 1];
                if (nextQuestion) nextQuestion.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevQuestion = faqQuestions[index - 1];
                if (prevQuestion) prevQuestion.focus();
            }
        });
    });
}

/**
 * Toggles FAQ accordion item
 * @param {HTMLElement} question - FAQ question element
 * @returns {void}
 */
function toggleFAQ(question) {
    const answer = question.nextElementSibling;
    const isActive = answer.classList.contains('active');

    // Close all FAQs
    const allAnswers = safeQuerySelectorAll('.faq-answer');
    const allQuestions = safeQuerySelectorAll('.faq-question');
    
    allAnswers.forEach(ans => ans.classList.remove('active'));
    allQuestions.forEach(q => {
        q.setAttribute('aria-expanded', 'false');
        const icon = q.querySelector('span');
        if (icon) icon.textContent = '+';
    });

    // Open clicked FAQ if it wasn't active
    if (!isActive) {
        answer.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        const icon = question.querySelector('span');
        if (icon) icon.textContent = '−';
    }
}
