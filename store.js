// ======================================================
// GLOBAL CART & WISHLIST MANAGEMENT SYSTEM
// ======================================================

// Global variables (accessible across all pages)
let globalCart = JSON.parse(localStorage.getItem('aaliGlobalCart')) || [];
let globalWishlist = JSON.parse(localStorage.getItem('aaliGlobalWishlist')) || [];




// Add this in store.js after globalCart initialization
const METAL_PROPERTIES = {
    '22K': {
        currentRate: 13355,
        purity: 91.6,
        gst: 0.03,
        makingCharge: 0.10
    },
    '24K': {
        currentRate: 14569,
        purity: 99.9,
        gst: 0.03,
        makingCharge: 0.12
    },
    '18K': {
        currentRate: 10927,
        purity: 75.0,
        gst: 0.03,
        makingCharge: 0.08
    },
    'silver': {
        currentRate: 85,  // per gram
        purity: 92.5,
        gst: 0.03,
        makingCharge: 0.15
    },
    'platinum': {
        currentRate: 3200,  // per gram
        purity: 95.0,
        gst: 0.03,
        makingCharge: 0.20
    }
};

// Update the addToGlobalCart function to include metal
function addToGlobalCart(product) {
    if (!product || !product.id) {
        console.error('Invalid product data');
        return false;
    }

    const existingItem = globalCart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        globalCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            image: product.image || '',
            quantity: 1,
            category: product.category || 'general',
            material: product.material || '22K',
            weight: product.weight || '',
            stone: product.stone || '',
            carat: product.carat || '',
            metal: product.metal || '22K'
        });
    }

    saveCartToStorage();
    updateCartUI();
    showGlobalNotification(`${product.name} added to cart!`);
    return true;
}

// Format Indian Rupee (shared function)
function formatIndianRupee(amount) {
    if (!amount) return '₹0';

    let amountStr = amount.toString();
    let lastThree = amountStr.substring(amountStr.length - 3);
    let otherNumbers = amountStr.substring(0, amountStr.length - 3);

    if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
    }

    let result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return '₹' + result;
}

// ======================================================
// CART FUNCTIONS
// ======================================================

function addToGlobalCart(product) {
    // Ensure product has required properties
    if (!product || !product.id) {
        console.error('Invalid product data');
        return false;
    }

    const existingItem = globalCart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        globalCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || '',
            quantity: 1,
            category: product.category || 'general',
            material: product.material || '',
            weight: product.weight || ''
        });
    }

    saveCartToStorage();
    updateCartUI();
    showGlobalNotification(`${product.name} added to cart!`);
    return true;
}

function updateGlobalCartItem(productId, change) {
    const item = globalCart.find(item => item.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        globalCart = globalCart.filter(item => item.id !== productId);
    }

    saveCartToStorage();
    updateCartUI();
}

function removeFromGlobalCart(productId) {
    const item = globalCart.find(item => item.id === productId);
    if (item) {
        globalCart = globalCart.filter(item => item.id !== productId);
        saveCartToStorage();
        updateCartUI();
        showGlobalNotification(`${item.name} removed from cart.`);
    }
}

function getCartTotalItems() {
    return globalCart.reduce((total, item) => total + (item.quantity || 1), 0);
}

function getCartTotalPrice() {
    return globalCart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
}

// ======================================================
// WISHLIST FUNCTIONS
// ======================================================

function toggleGlobalWishlist(product) {
    if (!product || !product.id) {
        console.error('Invalid product data');
        return false;
    }

    const existingIndex = globalWishlist.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
        // Remove from wishlist
        globalWishlist.splice(existingIndex, 1);
        showGlobalNotification(`${product.name} removed from wishlist.`);
    } else {
        // Add to wishlist
        globalWishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || '',
            material: product.material || '',
            weight: product.weight || ''
        });
        showGlobalNotification(`${product.name} added to wishlist!`);
    }

    saveWishlistToStorage();
    updateWishlistUI();
    return true;
}

function isInWishlist(productId) {
    return globalWishlist.some(item => item.id === productId);
}

function getWishlistCount() {
    return globalWishlist.length;
}

// ======================================================
// STORAGE FUNCTIONS
// ======================================================

function saveCartToStorage() {
    localStorage.setItem('aaliGlobalCart', JSON.stringify(globalCart));
}

function saveWishlistToStorage() {
    localStorage.setItem('aaliGlobalWishlist', JSON.stringify(globalWishlist));
}

// ======================================================
// UI UPDATE FUNCTIONS
// ======================================================

function updateCartUI() {
    // Update cart count in header
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = getCartTotalItems();
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });

    // Update cart sidebar if it exists
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        const cartItemsContainer = cartSidebar.querySelector('.cart-items');
        const totalPriceElement = cartSidebar.querySelector('.total-price');
        
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            
            if (globalCart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            } else {
                globalCart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.name}</h4>
                            <div class="cart-item-price">${formatIndianRupee(item.price)}</div>
                            <div class="cart-item-actions">
                                <button class="quantity-btn minus" data-id="${item.id}">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity">${item.quantity || 1}</span>
                                <button class="quantity-btn plus" data-id="${item.id}">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="remove-item" data-id="${item.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                });
            }
        }
        
        if (totalPriceElement) {
            totalPriceElement.textContent = formatIndianRupee(getCartTotalPrice());
        }
    }
}

function updateWishlistUI() {
    // Update wishlist count in header
    const wishlistCountElements = document.querySelectorAll('.wishlist-count');
    const wishlistCount = getWishlistCount();
    
    wishlistCountElements.forEach(element => {
        element.textContent = wishlistCount;
    });

    // Update wishlist sidebar if it exists
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    if (wishlistSidebar) {
        const wishlistItemsContainer = wishlistSidebar.querySelector('.wishlist-items');
        
        if (wishlistItemsContainer) {
            wishlistItemsContainer.innerHTML = '';
            
            if (globalWishlist.length === 0) {
                wishlistItemsContainer.innerHTML = `
                    <div class="wishlist-empty">
                        <i class="far fa-heart"></i>
                        <p>Your wishlist is empty</p>
                        <a href="#collections" class="btn-outline">Browse Collections</a>
                    </div>
                `;
            } else {
                globalWishlist.forEach(item => {
                    const wishlistItem = document.createElement('div');
                    wishlistItem.className = 'wishlist-item';
                    wishlistItem.innerHTML = `
                        <div class="wishlist-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="wishlist-item-details">
                            <h4 class="wishlist-item-title">${item.name}</h4>
                            <div class="wishlist-item-price">${formatIndianRupee(item.price)}</div>
                            <div class="wishlist-item-actions">
                                <button class="btn-outline add-to-cart-wishlist" data-id="${item.id}">
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                        <button class="remove-wishlist-item" data-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    wishlistItemsContainer.appendChild(wishlistItem);
                });
            }
        }
    }
}

// ======================================================
// NOTIFICATION SYSTEM
// ======================================================

function showGlobalNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.global-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'global-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #C5A028, #8B6914);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(197, 160, 40, 0.25);
        z-index: 1300;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        font-family: 'Cormorant Garamond', serif;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ======================================================
// INITIALIZATION
// ======================================================

function initGlobalCartSystem() {
    // Load cart and wishlist from storage
    const savedCart = localStorage.getItem('aaliGlobalCart');
    const savedWishlist = localStorage.getItem('aaliGlobalWishlist');
    
    if (savedCart) {
        globalCart = JSON.parse(savedCart);
    }
    
    if (savedWishlist) {
        globalWishlist = JSON.parse(savedWishlist);
    }
    
    // Update UI on page load
    updateCartUI();
    updateWishlistUI();
    
    // Setup event listeners for cart/wishlist icons
    setupGlobalEventListeners();
}

function setupGlobalEventListeners() {
    // Cart toggle (works across all pages)
    document.addEventListener('click', function(e) {
        // Cart icon click
        if (e.target.closest('#cartIcon')) {
            e.preventDefault();
            const cartSidebar = document.getElementById('cartSidebar');
            const cartOverlay = document.getElementById('cartOverlay');
            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.add('active');
                cartOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        
        // Wishlist icon click
        if (e.target.closest('#wishlistIcon')) {
            e.preventDefault();
            const wishlistSidebar = document.getElementById('wishlistSidebar');
            const wishlistOverlay = document.getElementById('wishlistOverlay');
            if (wishlistSidebar && wishlistOverlay) {
                wishlistSidebar.classList.add('active');
                wishlistOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        
        // Close buttons
        if (e.target.closest('#cartClose') || e.target.closest('#wishlistClose')) {
            const cartSidebar = document.getElementById('cartSidebar');
            const wishlistSidebar = document.getElementById('wishlistSidebar');
            const cartOverlay = document.getElementById('cartOverlay');
            const wishlistOverlay = document.getElementById('wishlistOverlay');
            
            if (cartSidebar) cartSidebar.classList.remove('active');
            if (wishlistSidebar) wishlistSidebar.classList.remove('active');
            if (cartOverlay) cartOverlay.classList.remove('active');
            if (wishlistOverlay) wishlistOverlay.classList.remove('active');
            
            document.body.style.overflow = 'auto';
        }
        
        // Cart item actions (delegated events)
        if (e.target.closest('.cart-items')) {
            const target = e.target.closest('.quantity-btn.minus, .quantity-btn.plus, .remove-item');
            if (target) {
                const productId = parseInt(target.dataset.id);
                
                if (target.classList.contains('minus')) {
                    updateGlobalCartItem(productId, -1);
                } else if (target.classList.contains('plus')) {
                    updateGlobalCartItem(productId, 1);
                } else if (target.classList.contains('remove-item')) {
                    removeFromGlobalCart(productId);
                }
            }
        }
        
        // Wishlist item actions (delegated events)
        if (e.target.closest('.wishlist-items')) {
            const target = e.target.closest('.remove-wishlist-item, .add-to-cart-wishlist');
            if (target) {
                const productId = parseInt(target.dataset.id);
                const product = globalWishlist.find(item => item.id === productId);
                
                if (target.classList.contains('remove-wishlist-item') && product) {
                    toggleGlobalWishlist(product);
                } else if (target.classList.contains('add-to-cart-wishlist') && product) {
                    addToGlobalCart(product);
                    // Close wishlist sidebar after adding to cart
                    const wishlistSidebar = document.getElementById('wishlistSidebar');
                    const wishlistOverlay = document.getElementById('wishlistOverlay');
                    if (wishlistSidebar) wishlistSidebar.classList.remove('active');
                    if (wishlistOverlay) wishlistOverlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            }
        }
    });
}

// ======================================================
// EXPORT FUNCTIONS FOR USE IN OTHER PAGES
// ======================================================

// Make these functions available globally
window.AaliCart = {
    addToCart: addToGlobalCart,
    toggleWishlist: toggleGlobalWishlist,
    isInWishlist: isInWishlist,
    getCart: () => globalCart,
    getWishlist: () => globalWishlist,
    getCartTotal: getCartTotalPrice,
    getCartCount: getCartTotalItems,
    getWishlistCount: getWishlistCount,
    init: initGlobalCartSystem,
    formatPrice: formatIndianRupee
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGlobalCartSystem);

// Add CSS animations for notifications
if (!document.querySelector('#global-cart-styles')) {
    const style = document.createElement('style');
    style.id = 'global-cart-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .global-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #C5A028, #8B6914);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(197, 160, 40, 0.25);
            z-index: 1300;
            animation: slideIn 0.3s ease;
            font-weight: 600;
            font-family: 'Cormorant Garamond', serif;
        }
    `;
    document.head.appendChild(style);
}




// ======================================================
// CHECKOUT FUNCTIONS (Add to existing store.js)
// ======================================================

function checkoutRedirect() {
    // Save current cart for checkout
    saveCartToStorage();
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

function getCheckoutData() {
    return {
        cart: globalCart,
        wishlist: globalWishlist,
        timestamp: new Date().toISOString(),
        total: getCartTotalPrice()
    };
}

function clearCartAfterOrder() {
    globalCart = [];
    saveCartToStorage();
    updateCartUI();
}

// Add checkout functions to global object
window.AaliCart = {
    ...window.AaliCart,
    checkoutRedirect: checkoutRedirect,
    getCheckoutData: getCheckoutData,
    clearCartAfterOrder: clearCartAfterOrder
};