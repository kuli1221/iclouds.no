/**
 * Shopping cart functionality for the iClouds store
 */

// Constants
const CART_STORAGE_KEY = 'iclouds_cart';
const RECENTLY_VIEWED_KEY = 'iclouds_recently_viewed';
const MAX_RECENTLY_VIEWED = 3;

/**
 * Adds an item to the shopping cart
 * @param {string} productId - The unique identifier for the product
 * @param {number} price - The price of the product
 * @returns {void}
 */
function addToCart(productId, price) {
    if (!productId || typeof price !== 'number') {
        console.error('Invalid product data');
        return;
    }

    try {
        window.appState.cart.push({ product: productId, price: price });
        updateCartDisplay();
        saveCartToLocalStorage();
        addToRecentlyViewed(productId);
        showToast(`Added "${productId}" to your cart! Remember: You're purchasing the idea of ${productId.toLowerCase()}.`, 'success');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add item to cart. Please try again.', 'error');
    }
}

/**
 * Toggles the shopping cart dropdown visibility
 * @returns {void}
 */
function toggleCart() {
    const dropdown = safeQuerySelector('#cart-dropdown');
    if (!dropdown) return;

    window.appState.cartVisible = !window.appState.cartVisible;
    dropdown.style.display = window.appState.cartVisible ? 'block' : 'none';
    dropdown.setAttribute('aria-hidden', !window.appState.cartVisible);

    // Set focus to first interactive element in cart when opened
    if (window.appState.cartVisible) {
        const firstButton = dropdown.querySelector('button');
        if (firstButton) {
            setTimeout(() => firstButton.focus(), 100);
        }
    }
}

/**
 * Updates the cart display with current items
 * @returns {void}
 */
function updateCartDisplay() {
    const cartCount = safeQuerySelector('#cart-count');
    const cartItems = safeQuerySelector('#cart-items');
    const cartTotal = safeQuerySelector('#cart-total');

    if (!cartCount || !cartItems || !cartTotal) return;

    const cart = window.appState.cart;
    cartCount.textContent = cart.length;
    cartCount.setAttribute('aria-label', `${cart.length} items in cart`);

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is as empty as a clear blue sky.</p>';
        cartTotal.textContent = '';
        return;
    }

    let itemsHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const sanitizedProduct = sanitizeHTML(item.product);
        itemsHTML += `
            <div class="cart-item" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${sanitizedProduct}</span>
                <span>$${item.price}</span>
            </div>`;
        total += item.price;
    });

    cartItems.innerHTML = itemsHTML;
    cartTotal.textContent = `Total: $${total} (metaphorical dollars)`;
}

/**
 * Processes checkout and clears the cart
 * @returns {void}
 */
function checkout() {
    const cart = window.appState.cart;

    if (cart.length === 0) {
        showToast("Your cart is empty! Add some cloud-inspired merchandise first.", 'warning');
        return;
    }

    try {
        const total = cart.reduce((sum, item) => sum + item.price, 0);

        const dropdown = safeQuerySelector('#cart-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
        window.appState.cartVisible = false;

        showToast(`💳 Processing your payment of $${total}... Transaction complete! Your metaphysical cloud products are being prepared for spiritual delivery.`, 'success');

        setTimeout(() => {
            window.appState.cart = [];
            updateCartDisplay();
            saveCartToLocalStorage();
        }, 1000);
    } catch (error) {
        console.error('Error during checkout:', error);
        showToast('Checkout failed. Please try again.', 'error');
    }
}

/**
 * Saves the cart to localStorage
 * @returns {void}
 */
function saveCartToLocalStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(window.appState.cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
}

/**
 * Loads the cart from localStorage
 * @returns {void}
 */
function loadCartFromLocalStorage() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            window.appState.cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        window.appState.cart = [];
    }
}

/**
 * Adds a product to recently viewed list
 * @param {string} productId - Product identifier
 * @returns {void}
 */
function addToRecentlyViewed(productId) {
    try {
        let recentlyViewed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
        
        // Remove if already exists
        recentlyViewed = recentlyViewed.filter(id => id !== productId);
        
        // Add to beginning
        recentlyViewed.unshift(productId);
        
        // Keep only last MAX_RECENTLY_VIEWED items
        recentlyViewed = recentlyViewed.slice(0, MAX_RECENTLY_VIEWED);
        
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
    } catch (error) {
        console.error('Error saving to recently viewed:', error);
    }
}

/**
 * Initializes cart functionality with event delegation
 * @returns {void}
 */
function initializeCart() {
    loadCartFromLocalStorage();

    // Event delegation for add to cart buttons
    const shopSection = safeQuerySelector('#shop');
    if (shopSection) {
        shopSection.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action="add-to-cart"]');
            if (button) {
                const productId = button.getAttribute('data-product-id');
                const price = parseFloat(button.getAttribute('data-price'));
                if (productId && !isNaN(price)) {
                    addToCart(productId, price);
                }
            }
        });
    }

    // Close cart dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const cartDropdown = safeQuerySelector('#cart-dropdown');
        const cartButton = safeQuerySelector('.cart-indicator button');

        if (cartButton && cartDropdown && 
            !cartButton.contains(event.target) && 
            !cartDropdown.contains(event.target)) {
            cartDropdown.style.display = 'none';
            window.appState.cartVisible = false;
        }
    });
}
