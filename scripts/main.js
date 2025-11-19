// Mobile Menu Toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('active');
});

// Membership Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab') + '-tab';
        document.getElementById(tabId).classList.add('active');
    });
});

// FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isActive = answer.classList.contains('active');

        document.querySelectorAll('.faq-answer').forEach(ans => {
            ans.classList.remove('active');
        });

        document.querySelectorAll('.faq-question span').forEach(icon => {
            icon.textContent = '+';
        });

        if (!isActive) {
            answer.classList.add('active');
            question.querySelector('span').textContent = '−';
        }
    });
});

// Toast Notification System
function showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Membership Functions
function joinMembership(tier) {
    const messages = {
        cirrus: "You've chosen the Cirrus Tier - floating gently into our community!",
        cumulus: "Cumulus Tier selected - you're building something substantial!",
        cumulonimbus: "Cumulonimbus Tier - prepare for a storm of exclusive benefits!"
    };

    const messageDiv = document.getElementById('membership-message');
    messageDiv.innerHTML = `
        <h3>⏳ Processing Your Application</h3>
        <p>${messages[tier]}</p>
        <p><em>Consulting atmospheric conditions... Checking cloud alignment...</em></p>
        <div class="loading">☁️ ⏳ ☁️</div>
        <p>This may take 2-5 business days (or until we see a particularly interesting cloud formation)</p>
        <button onclick="showWelcomeMessage('${tier}')" class="btn">Simulate Approval</button>
    `;
    messageDiv.style.display = 'block';
    messageDiv.scrollIntoView({ behavior: 'smooth' });
}

function showWelcomeMessage(tier) {
    const messageDiv = document.getElementById('membership-message');
    messageDiv.innerHTML = `
        <h3>🎉 Membership Approved! 🎉</h3>
        <p>Welcome to iClouds! As a ${tier} member, you now have:</p>
        <ul class="welcome-list">
            <li>Permission to look skyward during meetings</li>
            <li>Bragging rights at meteorological parties</li>
            <li>Our sincere appreciation for your excellent taste</li>
        </ul>
        <p><strong>Pro Tip:</strong> Your membership card will arrive via cumulus mail (allow 4-6 weeks)</p>
        <button onclick="closeMembershipMessage()" class="btn">Begin Cloud Appreciation</button>
    `;
}

function closeMembershipMessage() {
    document.getElementById('membership-message').style.display = 'none';
}

// Shopping Cart
let cart = [];
let cartVisible = false;

function addToCart(product, price) {
    cart.push({product, price});
    updateCartDisplay();
    showToast(`Added "${product}" to your cart! Remember: You're purchasing the idea of ${product.toLowerCase()}.`, 'success');
}

function toggleCart() {
    const dropdown = document.getElementById('cart-dropdown');
    cartVisible = !cartVisible;
    dropdown.style.display = cartVisible ? 'block' : 'none';
}

function updateCartDisplay() {
    document.getElementById('cart-count').textContent = cart.length;

    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is as empty as a clear blue sky.</p>';
        cartTotal.textContent = '';
        return;
    }

    let itemsHTML = '';
    let total = 0;

    cart.forEach(item => {
        itemsHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>${item.product}</span>
            <span>$${item.price}</span>
        </div>`;
        total += item.price;
    });

    cartItems.innerHTML = itemsHTML;
    cartTotal.textContent = `Total: $${total} (metaphorical dollars)`;
}

function checkout() {
    if (cart.length === 0) {
        showToast("Your cart is empty! Add some cloud-inspired merchandise first.", 'warning');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    document.getElementById('cart-dropdown').style.display = 'none';
    cartVisible = false;

    showToast(`💳 Processing your payment of $${total}... Transaction complete! Your metaphysical cloud products are being prepared for spiritual delivery.`, 'success');
    
    setTimeout(() => {
        cart = [];
        updateCartDisplay();
    }, 1000);
}

// Close cart dropdown when clicking outside
document.addEventListener('click', function(event) {
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartButton = document.querySelector('.cart-indicator button');

    if (cartButton && !cartButton.contains(event.target) && !cartDropdown.contains(event.target)) {
        cartDropdown.style.display = 'none';
        cartVisible = false;
    }
});

// Sighting Form
document.getElementById('sightingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const cloudType = formData.get('cloud-type');
    const emotionalImpact = formData.get('emotional-impact');
    const narrative = formData.get('narrative');

    if (narrative.length < 50) {
        showToast("Your narrative is too brief! Please provide at least 50 words of profound reflection.", 'warning');
        return;
    }

    if (narrative.length > 500) {
        showToast("Your narrative exceeds 500 words. Please condense your atmospheric poetry.", 'warning');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Consulting Atmospheric Records...';
    submitBtn.disabled = true;

    setTimeout(() => {
        showToast(`🌤️ Sighting Successfully Recorded! Your ${cloudType} sighting has been added to our archives with a classification of "${emotionalImpact}".`, 'success');

        this.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        const counter = document.getElementById('narrative-counter');
        if (counter) {
            counter.textContent = '0/500 characters (500 remaining)';
            counter.style.color = '#666';
        }
    }, 2000);
});

// Narrative Character Counter
document.getElementById('narrative').addEventListener('input', function() {
    const charCount = this.value.length;
    const counter = document.getElementById('narrative-counter') ||
        (function() {
            const counter = document.createElement('div');
            counter.id = 'narrative-counter';
            counter.style.fontSize = '0.8rem';
            counter.style.color = '#666';
            counter.style.marginTop = '0.5rem';
            this.parentNode.appendChild(counter);
            return counter;
        }).call(this);

    counter.textContent = `${charCount}/500 characters (${500 - charCount} remaining)`;

    if (charCount > 450) {
        counter.style.color = '#e74c3c';
    } else if (charCount > 400) {
        counter.style.color = '#f39c12';
    } else {
        counter.style.color = '#666';
    }
});

// Cloud Game
const cloudTypes = ['cirrus', 'cumulus', 'stratus', 'nimbus'];
let currentCloud = 'cumulus';

function checkAnswer(guess, button) {
    const result = document.getElementById('game-result');

    if (guess === currentCloud) {
        result.textContent = "✅ Correct! You're a natural cloud spotter!";
        result.style.color = '#27ae60';
        button.style.backgroundColor = '#27ae60';
        button.style.color = 'white';
    } else {
        result.textContent = `❌ Not quite! That was a ${currentCloud} cloud. Keep practicing!`;
        result.style.color = '#e74c3c';
        button.style.backgroundColor = '#e74c3c';
        button.style.color = 'white';
    }

    setTimeout(() => {
        document.querySelectorAll('.cloud-game .btn').forEach(btn => {
            btn.style.backgroundColor = '';
            btn.style.color = '';
        });
    }, 3000);
}

function resetGame() {
    currentCloud = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];
    document.getElementById('game-result').textContent = '';
    document.querySelectorAll('.cloud-game .btn').forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.color = '';
    });

    const cloudShape = document.querySelector('.cloud-shape');
    cloudShape.style.animation = 'none';
    cloudShape.offsetHeight;
    cloudShape.style.animation = null;
}

// Smooth Scrolling
function smoothScroll(targetId) {
    const element = document.getElementById(targetId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        // Clear hash from URL after scrolling
        if (history.pushState) {
            history.pushState(null, null, window.location.pathname);
        } else {
            window.location.hash = '';
        }
    }
}

// Scroll to top function
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

// Social Media and Newsletter
function showSocialAlert(platform) {
    const messages = {
        'Instagram': 'Follow us on Instagram for daily cloud photography and sky-gazing inspiration! 📸☁️',
        'Twitter': 'Join the conversation on Twitter using #iCloudsAppreciation! 🐦🌤️',
        'Forums': 'Our member forums are where serious cloud discussions happen. Join to participate! 💭⛅'
    };

    showToast(`${platform}: ${messages[platform] || 'Coming soon to a cloud near you!'}`, 'info');
}

function showNewsletterSignup() {
    const email = prompt('Enter your email to subscribe to "The Condensation" newsletter:\n\n(Monthly cloud spotting tips, featured sightings, and atmospheric poetry)');
    if (email && email.includes('@')) {
        showToast('Thank you! You\'ve been added to our newsletter. Check your inbox for a confirmation cloud. 📧☁️', 'success');
    } else if (email) {
        showToast('That doesn\'t look like a valid email address. Please try again with a real cloud... I mean, email. 🌥️', 'warning');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            smoothScroll(targetId);
            document.querySelector('nav ul').classList.remove('active');
        });
    });

    // Footer links
    const footerLinks = document.querySelectorAll('.footer-links a[href^="#"]');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            smoothScroll(targetId);
        });
    });

    // Make logo clickable to scroll to top
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', scrollToTop);
    }

    // Initialize game
    resetGame();
});
