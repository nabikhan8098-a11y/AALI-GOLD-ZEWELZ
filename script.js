// FORCE close wishlist/cart on Browse / Continue Shopping (CAPTURE PHASE)
window.addEventListener(
  "click",
  function (e) {
    const link = e.target.closest('a');

    if (!link) return;

    const text = link.textContent.trim().toLowerCase();
    const href = link.getAttribute("href");

    // Match ALL related buttons by text OR href
    if (
      href === "#collections" ||
      text.includes("browse") ||
      text.includes("continue")
    ) {
      // STOP everything else
      e.preventDefault();
      e.stopImmediatePropagation();

      // Close wishlist
      if (window.wishlistSidebar)
        wishlistSidebar.classList.remove("active");
      if (window.wishlistOverlay)
        wishlistOverlay.classList.remove("active");

      // Close cart
      if (window.cartSidebar)
        cartSidebar.classList.remove("active");
      if (window.cartOverlay)
        cartOverlay.classList.remove("active");

      document.body.style.overflow = "";

      // Scroll manually
      setTimeout(() => {
        const el = document.getElementById("collections");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  },
  true // ← THIS IS THE KEY (capture phase)
);
// ============================================
// PROFESSIONAL HAMBURGER MENU FUNCTIONALITY
// ============================================

function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    // Create overlay for mobile menu
    const navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    document.body.appendChild(navOverlay);
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        const isMenuOpen = mainNav.classList.contains('active');
        
        if (isMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
    
    function openMobileMenu() {
        mainNav.classList.add('active');
        hamburgerBtn.classList.add('active');
        navOverlay.classList.add('active');
        body.classList.add('nav-open');
        
        // Add escape key listener
        document.addEventListener('keydown', handleEscapeKey);
    }
    
    function closeMobileMenu() {
        mainNav.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        navOverlay.classList.remove('active');
        body.classList.remove('nav-open');
        
        // Close any open dropdowns
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
    }
    
    function handleEscapeKey(event) {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    }
    
    // Initialize dropdown functionality for mobile
    function initMobileDropdowns() {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const dropdown = this.closest('.dropdown');
                    const isActive = dropdown.classList.contains('active');
                    
                    // Close all other dropdowns
                    document.querySelectorAll('.dropdown.active').forEach(d => {
                        if (d !== dropdown) {
                            d.classList.remove('active');
                        }
                    });
                    
                    // Toggle current dropdown
                    dropdown.classList.toggle('active', !isActive);
                }
            });
        });
    }
    
    // Event Listeners
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Close menu when clicking overlay
    navOverlay.addEventListener('click', closeMobileMenu);
    
    // Close menu when clicking nav links (except dropdown toggles)
    mainNav.addEventListener('click', function(e) {
        if (e.target.classList.contains('dropdown-toggle')) {
            return; // Let dropdown toggle handle its own click
        }
        
        if (e.target.tagName === 'A' && window.innerWidth <= 1024) {
            // Close menu after clicking a link
            setTimeout(closeMobileMenu, 300);
        }
    });
    
    // Close dropdown when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
            const dropdown = e.target.closest('.dropdown');
            const isDropdownToggle = e.target.classList.contains('dropdown-toggle') || 
                                    e.target.closest('.dropdown-toggle');
            
            if (!dropdown && !isDropdownToggle) {
                document.querySelectorAll('.dropdown.active').forEach(d => {
                    d.classList.remove('active');
                });
            }
        }
    });
    
    // Handle window resize
    function handleResize() {
        if (window.innerWidth > 1024) {
            // Desktop - ensure menu is closed
            closeMobileMenu();
        }
    }
    
    // Smooth scroll for mobile nav links
    function initMobileSmoothScroll() {
        const navLinks = mainNav.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#' || href.includes('javascript')) return;
                
                if (href.startsWith('#') && window.innerWidth <= 1024) {
                    e.preventDefault();
                    
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        // Close mobile menu first
                        closeMobileMenu();
                        
                        // Smooth scroll after menu closes
                        setTimeout(() => {
                            const headerHeight = document.querySelector('.header').offsetHeight;
                            const targetPosition = targetElement.offsetTop - headerHeight;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }, 300);
                    }
                }
            });
        });
    }
    
    // Initialize all mobile functionality
    initMobileDropdowns();
    initMobileSmoothScroll();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Close menu on orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(handleResize, 100);
    });
}

// Initialize hamburger menu when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize hamburger menu
    initHamburgerMenu();
    
    // Rest of your existing DOMContentLoaded code...
    // (Keep all your existing initialization code here)
});

document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    
    if (!link) return;
    
    const text = link.textContent?.trim().toLowerCase() || '';
    const href = link.getAttribute('href');
    
    // Check if this is a "Browse" or "Continue Shopping" button
    const isBrowseButton = text.includes('browse') || 
                          text.includes('continue') || 
                          text.includes('collections');
    
    // Check if this is a collections link
    const isCollectionsLink = href === '#collections' || 
                             href?.includes('collections/') ||
                             href?.includes('collections\\');
    
    // Only handle our specific buttons
    if ((isBrowseButton || isCollectionsLink) && 
        (link.classList.contains('btn-outline1') || 
         link.classList.contains('btn-outline2') || 
         link.classList.contains('btn-gold') ||
         link.classList.contains('view-collection'))) {
        
        // Close sidebars first
        closeAllSidebars();
        
        // Only prevent default if it's a hash link (internal navigation)
        if (href && href.startsWith('#')) {
            e.preventDefault();
            e.stopPropagation();
            
            // Scroll after a short delay
            setTimeout(() => {
                const section = document.querySelector(href);
                if (section) {
                    const topPosition = section.offsetTop - (window.innerWidth <= 768 ? 80 : 100);
                    window.scrollTo({
                        top: topPosition,
                        behavior: 'smooth'
                    });
                }
            }, 200);
        }
        
        // For external links, let them work normally
        return;
    }
    
}, false); // Use bubble phase (false), NOT capture phase

function closeAllSidebars() {
    // Close wishlist
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const wishlistOverlay = document.getElementById('wishlistOverlay');
    if (wishlistSidebar) wishlistSidebar.classList.remove('active');
    if (wishlistOverlay) wishlistOverlay.classList.remove('active');
    
    // Close cart
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartSidebar) cartSidebar.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    
    // Restore body scrolling using the auth system's method
    if (window.AaliAuth && window.AaliAuth.restoreBodyScrolling) {
        window.AaliAuth.restoreBodyScrolling();
    } else {
        // Fallback
        document.body.style.overflow = '';
        document.body.style.position = '';
    }
}

// Also add this function to ensure smooth scrolling works on mobile
function scrollToSection(sectionSelector) {
    const section = document.querySelector(sectionSelector);
    if (section) {
        // Mobile-friendly scrolling
        const offset = window.innerWidth <= 768 ? 80 : 100;
        const topPosition = Math.max(0, section.offsetTop - offset);
        
        window.scrollTo({
            top: topPosition,
            behavior: 'smooth'
        });
    }
}

// ======================================================
// REST OF YOUR EXISTING script.js CODE CONTINUES BELOW
// ======================================================
// ======================================================
// FIXED SCRIPT.JS - INTEGRATED WITH GLOBAL CART SYSTEM
// ======================================================

// Jewelry product data with Indian Rupee pricing
const jewelryProducts = [
    {
        id: 1,
        name: "Golden Sunburst Necklace",
        category: "necklaces",
        price: 125000,
        originalPrice: 149999,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        rating: 4.9,
        badge: "Bestseller",
        material: "22K Gold",
        weight: "12g",
        inWishlist: false
    },
    {
        id: 2,
        name: "Diamond Solitaire Ring",
        category: "rings",
        price: 320000,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
        rating: 5.0,
        badge: "New",
        material: "18K Gold with Diamond",
        weight: "8g",
        inWishlist: false
    },
    {
        id: 3,
        name: "Pearl & Gold Drop Earrings",
        category: "earrings",
        price: 85000,
        originalPrice: 99999,
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        rating: 4.7,
        badge: "Sale",
        material: "18K Gold with Pearl",
        weight: "6g",
        inWishlist: false
    },
    {
        id: 4,
        name: "Heritage Gold Bangle",
        category: "bracelets",
        price: 210000,
        originalPrice: 245000,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        rating: 4.8,
        badge: "Limited",
        material: "22K Gold",
        weight: "25g",
        inWishlist: false
    },
    {
        id: 5,
        name: "Emerald & Gold Pendant",
        category: "necklaces",
        price: 175000,
        originalPrice: 195000,
        image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80",
        rating: 4.6,
        badge: null,
        material: "18K Gold with Emerald",
        weight: "10g",
        inWishlist: false
    },
    {
        id: 6,
        name: "Royal Wedding Ring Set",
        category: "bridal",
        price: 550000,
        originalPrice: 620000,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        rating: 4.9,
        badge: "Bridal",
        material: "22K Gold with Diamonds",
        weight: "15g",
        inWishlist: false
    }
];

// Format Indian Rupee (use global function if available)
function formatIndianRupee(amount) {
    if (window.AaliCart && window.AaliCart.formatPrice) {
        return window.AaliCart.formatPrice(amount);
    }
    
    // Fallback local function
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

// Current market data for Jan 2026
const MARKET_RATES = {
    "Guntur": { "24K": 13931, "22K": 12770, "18K": 10448, "Platinum": 6456, "Silver": 249},
    "Default": { "24K": 17062, "22K": 15640, "18K": 12797, "Platinum": 9983, "Silver": 397},
};

let userCity = "India";

// DOM Elements
const productsGrid = document.querySelector('.products-grid');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartIcon = document.getElementById('cartIcon');
const cartClose = document.getElementById('cartClose');
const cartItems = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const totalPrice = document.querySelector('.total-price');
const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const searchSubmit = document.getElementById('searchSubmit');
const contactForm = document.getElementById('contactForm');
const currentYear = document.getElementById('currentYear');

// Wishlist DOM Elements
const wishlistSidebar = document.getElementById('wishlistSidebar');
const wishlistOverlay = document.getElementById('wishlistOverlay');
const wishlistClose = document.getElementById('wishlistClose');
const wishlistItems = document.querySelector('.wishlist-items');

// Gold price elements
const gold24KPrice = document.getElementById('gold24KPrice');
const gold22KPrice = document.getElementById('gold22KPrice');
const gold18KPrice = document.getElementById('gold18KPrice');
const gold24KChange = document.getElementById('gold24KChange');
const gold22KChange = document.getElementById('gold22KChange');
const gold18KChange = document.getElementById('gold18KChange');
const lastUpdatedTime = document.getElementById('lastUpdatedTime');

// Function for smooth scrolling
function scrollToSection(sectionSelector) {
    const section = document.querySelector(sectionSelector);
    if (section) {
        window.scrollTo({
            top: section.offsetTop - 100,
            behavior: 'smooth'
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global cart system first
    if (window.AaliCart && window.AaliCart.init) {
        window.AaliCart.init();
    } else {
        console.warn('Global cart system not available. Please ensure store.js is loaded.');
    }

    // Set current year
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Set last updated time
    if (lastUpdatedTime) {
        lastUpdatedTime.textContent = new Date().toLocaleTimeString();
    }

    // Display products (only if products grid exists)
    if (productsGrid) {
        displayFeaturedProducts();
    }

    // Setup event listeners
    setupEventListeners();

    // Initialize gold pricing
    initGoldPricing();
    
    // Initialize location and ticker
    initLocationAndTicker();
});

// Initialize gold pricing
function initGoldPricing() {
    if (gold24KPrice) gold24KPrice.textContent = formatIndianRupee(6500);
    if (gold22KPrice) gold22KPrice.textContent = formatIndianRupee(5950);
    if (gold18KPrice) gold18KPrice.textContent = formatIndianRupee(4870);

    // Update every 30 seconds (simulated)
    setInterval(() => {
        updateGoldPrices();
    }, 30000);
}

// Initialize location and ticker
async function initLocationAndTicker() {
    await detectLocation();
    await updateLivePrices();

    // Update every 5 minutes
    setInterval(updateLivePrices, 300000);
}

// Detect Location using a free IP API
async function detectLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        userCity = data.city || "India";
        console.log("Detected Location:", userCity);

        // Update the subtitle in the Pricing Section
        const subTitle = document.querySelector('.metals-pricing .section-title');
        if (subTitle) subTitle.textContent = `Today's Gold Rates in ${userCity}`;
    } catch (error) {
        console.error("Location detection failed:", error);
        userCity = "India";
    }
}

// Update live prices in ticker
async function updateLivePrices() {
    const rates = MARKET_RATES[userCity] || MARKET_RATES["Default"];

    // Update Pricing Section Cards (if they exist)
    if (document.getElementById('gold24KPrice')) {
        document.getElementById('gold24KPrice').textContent = formatIndianRupee(rates["24K"]);
        document.getElementById('gold22KPrice').textContent = formatIndianRupee(rates["22K"]);
        document.getElementById('gold18KPrice').textContent = formatIndianRupee(rates["18K"]);
    }

    // Update the Top Ticker
    const ticker = document.getElementById('tickerContent');
    if (ticker) {
        const tickerHTML = `
            <div class="ticker-item">
                <span class="metal-name">Gold 24K (${userCity}):</span>
                <span class="metal-price">${formatIndianRupee(rates["24K"])}/g</span>
                <span class="metal-change down"><i class="fas fa-arrow-down"></i> 0.22%</span>
            </div>
            <div class="ticker-item">
                <span class="metal-name">Gold 22K:</span>
                <span class="metal-price">${formatIndianRupee(rates["22K"])}/g</span>
                <span class="metal-change up"><i class="fas fa-arrow-up"></i> 0.51%</span>
            </div>
            <div class="ticker-item">
                <span class="metal-name">Gold 18K:</span>
                <span class="metal-price">${formatIndianRupee(rates["18K"])}/g</span>
                <span class="metal-change up"><i class="fas fa-arrow-up"></i> 0.53%</span>
            </div>
            <div class="ticker-item">
                <span class="metal-name">Platinum :</span>
                <span class="metal-price">${formatIndianRupee(rates["Platinum"])}/g</span>
                <span class="metal-change down"><i class="fas fa-arrow-down"></i> 1.67%</span>
            </div>
            <div class="ticker-item">
                <span class="metal-name">Silver:</span>
                <span class="metal-price">${formatIndianRupee(rates["Silver"])}/g</span>
                <span class="metal-change up"><i class="fas fa-arrow-up"></i> 0.04%</span>
            </div>
        `;

        // Duplicate for seamless loop
        ticker.innerHTML = tickerHTML + tickerHTML;
    }
}

// Update gold prices (simulated)
function updateGoldPrices() {
    const changes = [25, 23, 19];
    const priceElements = [gold24KPrice, gold22KPrice, gold18KPrice];
    const changeElements = [gold24KChange, gold22KChange, gold18KChange];

    priceElements.forEach((element, index) => {
        if (element) {
            const current = parseInt(element.textContent.replace(/[^0-9]/g, ''));
            const change = Math.random() > 0.5 ? changes[index] : -changes[index];
            const newPrice = current + change;

            element.textContent = formatIndianRupee(newPrice);

            if (changeElements[index]) {
                if (change > 0) {
                    changeElements[index].className = 'price-change positive';
                    changeElements[index].innerHTML = `<i class="fas fa-arrow-up"></i><span>+₹${change} ▲</span>`;
                } else {
                    changeElements[index].className = 'price-change negative';
                    changeElements[index].innerHTML = `<i class="fas fa-arrow-down"></i><span>-₹${Math.abs(change)} ▼</span>`;
                }
            }
        }
    });

    if (lastUpdatedTime) {
        lastUpdatedTime.textContent = new Date().toLocaleTimeString();
    }
}

// Display featured products
function displayFeaturedProducts() {
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    jewelryProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        const badgeHtml = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
        const originalPriceHtml = product.originalPrice ?
            `<span class="original-price">${formatIndianRupee(product.originalPrice)}</span>` : '';
        const ratingStars = getRatingStars(product.rating);

        // Check if product is in wishlist using global system
        const isInWishlist = window.AaliCart ? window.AaliCart.isInWishlist(product.id) : false;
        const wishlistBtnClass = isInWishlist ? 'wishlist-btn active' : 'wishlist-btn';
        const wishlistIconClass = isInWishlist ? 'fas fa-heart' : 'far fa-heart';

        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${badgeHtml}
                <button class="${wishlistBtnClass}" data-id="${product.id}" title="${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                    <i class="${wishlistIconClass}"></i>
                </button>
            </div>
            <div class="product-info">
                <div class="product-category">${product.material}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${formatIndianRupee(product.price)}</span>
                    ${originalPriceHtml}
                </div>
                <div class="product-rating">
                    ${ratingStars}
                    <span>(${product.rating})</span>
                </div>
                <div class="product-weight">Weight: ${product.weight}</div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        `;

        productsGrid.appendChild(productCard);
    });

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            addToCart(productId);
        });
    });

    // Add wishlist button event listeners
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            toggleWishlist(productId, this);
        });
    });
}

// Get rating stars
function getRatingStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }

    return stars;
}

// Add to cart using global system
function addToCart(productId) {
    const product = jewelryProducts.find(p => p.id === productId);

    if (!product) return;

    // Use the global cart system
    if (window.AaliCart && window.AaliCart.addToCart) {
        window.AaliCart.addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            material: product.material,
            weight: product.weight
        });
    } else {
        console.error('Global cart system not available');
        // Fallback to local notification
        showNotification(`${product.name} added to cart!`);
    }
}

// Toggle wishlist using global system
function toggleWishlist(productId, buttonElement = null) {
    const product = jewelryProducts.find(p => p.id === productId);

    if (!product) return;

    // Prepare product data
    const productData = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        material: product.material,
        weight: product.weight
    };

    // Use the global wishlist system
    if (window.AaliCart && window.AaliCart.toggleWishlist) {
        window.AaliCart.toggleWishlist(productData);
        
        // Update button appearance
        if (buttonElement) {
            const isInWishlist = window.AaliCart.isInWishlist(productId);
            
            if (isInWishlist) {
                buttonElement.classList.add('active', 'heart-beat');
                buttonElement.innerHTML = '<i class="fas fa-heart"></i>';
                buttonElement.title = 'Remove from Wishlist';
            } else {
                buttonElement.classList.remove('active', 'heart-beat');
                buttonElement.classList.add('heart-beat');
                buttonElement.innerHTML = '<i class="far fa-heart"></i>';
                buttonElement.title = 'Add to Wishlist';
            }
            
            setTimeout(() => {
                buttonElement.classList.remove('heart-beat');
            }, 500);
        }
    } else {
        console.error('Global wishlist system not available');
        // Fallback to local notification
        showNotification(`${product.name} added to wishlist!`);
    }
}

// Show notification (use global if available)
function showNotification(message) {
    // Use auth notification system if available
    if (window.AaliAuth && window.AaliAuth.showNotification) {
        window.AaliAuth.showNotification(message, 'success');
        return;
    }
    
    // Use cart notification system if available
    if (window.AaliCart && window.AaliCart.showGlobalNotification) {
        window.AaliCart.showGlobalNotification(message);
        return;
    }
    
    // Fallback to local notification
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

// Perform search
// Comprehensive Search Function
function performSearch() {
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();

    // Close search overlay
    searchOverlay.classList.remove('active');

    if (searchTerm === '') {
        displayFeaturedProducts();
        return;
    }

    // Save search to localStorage (for recent searches feature)
    saveRecentSearch(searchTerm);

    // SECTION 1: Check for page/section navigation searches
    const navigationSearches = {
        // Home and main sections
        'home': '#home',
        'main': '#home',
        'hero': '#home',
        
        // Collections and specific items
        'collections': '#collections',
        'collection': '#collections',
        'shop': '#collections',
        'products': '#collections',
        'jewelry': '#collections',
        'jewellery': '#collections',
        
        // Metals and pricing
        'metals': '#metals',
        'metal': '#metals',
        'pricing': '#metals',
        'price': '#metals',
        'gold price': '#metals',
        'gold prices': '#metals',
        'gold rates': '#metals',
        'rate': '#metals',
        'rates': '#metals',
        'live price': '#metals',
        'live prices': '#metals',
        
        // About section
        'about': '#about',
        'about us': '#about',
        'story': '#about',
        'history': '#about',
        'craftsmanship': '#about',
        'artisans': '#about',
        
        // Contact section
        'contact': '#contact',
        'contact us': '#contact',
        'visit': '#contact',
        'store': '#contact',
        'location': '#contact',
        'address': '#contact',
        'phone': '#contact',
        'email': '#contact',
        
        // Footer related
        'faq': 'customerService/FAQ.html',
        'shipping': 'customerService/FAQ.html#shipping-delivery',
        'returns': 'customerService/FAQ.html#returns-exchange',
        'care': 'customerService/jwelleryCare.html',
        'policy': 'customerService/privacyPolicy.html',
        'privacy': 'customerService/privacyPolicy.html',
        'terms': 'customerService/privacyPolicy.html#terms'
    };

    // Check for direct navigation searches
    for (const [keyword, target] of Object.entries(navigationSearches)) {
        if (searchTerm === keyword || searchTerm.includes(keyword)) {
            if (target.startsWith('#')) {
                // Internal page section
                scrollToSection(target);
                if (target === '#collections') {
                    highlightCollection(searchTerm);
                }
                showNotification(`Navigated to ${keyword}`);
            } else {
                // External page - navigate directly
                window.location.href = target;
            }
            searchInput.value = '';
            return;
        }
    }

    // SECTION 2: Check for specific collection searches
    const collectionSearches = {
        // Gold sets
        'set': 'Gold Sets',
        'sets': 'Gold Sets',
        'gold set': 'Gold Sets',
        'gold sets': 'Gold Sets',
        'jewelry set': 'Gold Sets',
        'jewellery set': 'Gold Sets',
        'complete set': 'Gold Sets',
        'full set': 'Gold Sets',
        
        // Rings
        'ring': 'Diamond Rings',
        'rings': 'Diamond Rings',
        'diamond ring': 'Diamond Rings',
        'diamond rings': 'Diamond Rings',
        'engagement': 'Diamond Rings',
        'engagement ring': 'Diamond Rings',
        'solitaire': 'Diamond Rings',
        'wedding ring': 'Diamond Rings',
        'wedding rings': 'Diamond Rings',
        
        // Necklaces
        'necklace': 'Necklaces',
        'necklaces': 'Necklaces',
        'pendant': 'Necklaces',
        'pendants': 'Necklaces',
        'chain': 'Necklaces',
        'chains': 'Necklaces',
        'sunburst': 'Necklaces',
        'gold necklace': 'Necklaces',
        'gold chain': 'Necklaces',
        
        // Bridal
        'bridal': 'Bridal Collection',
        'bridal collection': 'Bridal Collection',
        'wedding': 'Bridal Collection',
        'wedding collection': 'Bridal Collection',
        'marriage': 'Bridal Collection',
        'bride': 'Bridal Collection',
        'bridal set': 'Bridal Collection',
        'wedding set': 'Bridal Collection',
        
        // Hipbelt
        'hipbelt': 'Hipbelt',
        'hip belt': 'Hipbelt',
        'belt': 'Hipbelt',
        'waist belt': 'Hipbelt',
        'gold belt': 'Hipbelt',
        
        // Bracelets & Bangles
        'bracelet': 'Bracelets & Bangles',
        'bracelets': 'Bracelets & Bangles',
        'bangle': 'Bracelets & Bangles',
        'bangles': 'Bracelets & Bangles',
        'bangle set': 'Bracelets & Bangles',
        
        // Anklets & Toe Rings
        'anklet': 'Anklets & Toe Rings',
        'anklets': 'Anklets & Toe Rings',
        'toe ring': 'Anklets & Toe Rings',
        'toe rings': 'Anklets & Toe Rings',
        'foot jewelry': 'Anklets & Toe Rings',
        
        // Chains
        'chain only': 'Chains',
        'gold chains': 'Chains',
        'neck chain': 'Chains',
        
        // Exclusive
        'exclusive': 'Exclusive Collection',
        'exclusive collection': 'Exclusive Collection',
        'limited': 'Exclusive Collection',
        'limited edition': 'Exclusive Collection',
        'special': 'Exclusive Collection',
        'premium': 'Exclusive Collection',
        
        // Earrings (if you add them)
        'earring': 'Earrings',
        'earrings': 'Earrings',
        'studs': 'Earrings',
        'drops': 'Earrings'
    };

    // Check for collection-specific searches
    for (const [keyword, collectionName] of Object.entries(collectionSearches)) {
        if (searchTerm.includes(keyword)) {
            scrollToSection('#collections');
            highlightCollection(collectionName);
            showNotification(`Showing ${collectionName} collection`);
            searchInput.value = '';
            return;
        }
    }

    // SECTION 3: Check for gold purity searches
    const goldPuritySearches = {
        '24k': '#metals',
        '24 karat': '#metals',
        '24 karats': '#metals',
        '99.9': '#metals',
        'pure gold': '#metals',
        'investment gold': '#metals',
        
        '22k': '#metals',
        '22 karat': '#metals',
        '22 karats': '#metals',
        '91.6': '#metals',
        'jewelry gold': '#metals',
        
        '18k': '#metals',
        '18 karat': '#metals',
        '18 karats': '#metals',
        '75%': '#metals',
        'daily wear': '#metals',
        
        'platinum': '#metals',
        'silver': '#metals'
    };

    for (const [keyword, section] of Object.entries(goldPuritySearches)) {
        if (searchTerm.includes(keyword)) {
            scrollToSection(section);
            showNotification(`Showing ${keyword} pricing`);
            searchInput.value = '';
            return;
        }
    }

    // SECTION 4: Search in products database
    const filteredProducts = searchInProducts(searchTerm);
    
    if (filteredProducts.length > 0) {
        displaySearchResults(filteredProducts, searchTerm);
        return;
    }

    // SECTION 5: Search in materials and features
    const materialSearches = {
        'gold': 'Material - Gold Jewelry',
        'diamond': 'Material - Diamond Jewelry',
        'pearl': 'Material - Pearl Jewelry',
        'emerald': 'Material - Emerald Jewelry',
        'gemstone': 'Material - Gemstone Jewelry',
        'kundan': 'Material - Kundan Jewelry',
        'polki': 'Material - Polki Jewelry',
        'handmade': 'Feature - Handcrafted Jewelry',
        'handcrafted': 'Feature - Handcrafted Jewelry',
        'traditional': 'Feature - Traditional Designs',
        'modern': 'Feature - Modern Designs',
        'luxury': 'Feature - Luxury Jewelry',
        'precious': 'Feature - Precious Jewelry',
        'hallmarked': 'Feature - BIS Hallmarked'
    };

    for (const [keyword, description] of Object.entries(materialSearches)) {
        if (searchTerm.includes(keyword)) {
            const materialProducts = jewelryProducts.filter(product =>
                product.material.toLowerCase().includes(keyword) ||
                product.name.toLowerCase().includes(keyword)
            );
            
            if (materialProducts.length > 0) {
                displaySearchResults(materialProducts, keyword);
                showNotification(`Showing ${description}`);
            } else {
                scrollToSection('#collections');
                showNotification(`Showing collections with ${keyword}`);
            }
            searchInput.value = '';
            return;
        }
    }

    // SECTION 6: Price range searches
    const pricePattern = /(\d+)\s*(k|thousand|lakh|lac|cr|crore)/i;
    const priceMatch = searchTerm.match(pricePattern);
    
    if (priceMatch) {
        const amount = parseInt(priceMatch[1]);
        const unit = priceMatch[2].toLowerCase();
        
        let minPrice = 0;
        let maxPrice = 0;
        
        if (unit === 'k' || unit === 'thousand') {
            minPrice = amount * 1000;
            maxPrice = (amount + 1) * 1000;
        } else if (unit === 'lakh' || unit === 'lac') {
            minPrice = amount * 100000;
            maxPrice = (amount + 1) * 100000;
        } else if (unit === 'cr' || unit === 'crore') {
            minPrice = amount * 10000000;
            maxPrice = (amount + 1) * 10000000;
        }
        
        const priceProducts = jewelryProducts.filter(product => 
            product.price >= minPrice && product.price < maxPrice
        );
        
        if (priceProducts.length > 0) {
            displaySearchResults(priceProducts, `₹${formatNumber(minPrice)} - ₹${formatNumber(maxPrice)} range`);
        } else {
            showNotification(`No products found in ₹${formatNumber(minPrice)} - ₹${formatNumber(maxPrice)} range`);
            scrollToSection('#collections');
        }
        searchInput.value = '';
        return;
    }

    // SECTION 7: No results found
    showNotification(`No results found for "${searchTerm}"`);
    
    // Show suggestions
    const suggestions = getSearchSuggestions(searchTerm);
    if (suggestions.length > 0) {
        setTimeout(() => {
            showNotification(`Try searching for: ${suggestions.join(', ')}`, 5000);
        }, 1000);
    }
    
    searchInput.value = '';
}

// Helper function to search in products
function searchInProducts(searchTerm) {
    return jewelryProducts.filter(product => {
        // Search in name
        if (product.name.toLowerCase().includes(searchTerm)) return true;
        
        // Search in category
        if (product.category.toLowerCase().includes(searchTerm)) return true;
        
        // Search in material
        if (product.material.toLowerCase().includes(searchTerm)) return true;
        
        // Search in badge
        if (product.badge && product.badge.toLowerCase().includes(searchTerm)) return true;
        
        // Search in weight
        if (product.weight.toLowerCase().includes(searchTerm)) return true;
        
        // Partial word matching
        const words = searchTerm.split(' ');
        for (const word of words) {
            if (word.length > 2) {
                if (product.name.toLowerCase().includes(word)) return true;
                if (product.material.toLowerCase().includes(word)) return true;
                if (product.category.toLowerCase().includes(word)) return true;
            }
        }
        
        return false;
    });
}

// Display search results
function displaySearchResults(products, searchTerm) {
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gold-light); margin-bottom: 20px;"></i>
                <h3 style="color: var(--charcoal); margin-bottom: 10px;">No products found for "${searchTerm}"</h3>
                <p style="color: var(--taupe); margin-bottom: 30px;">Try different keywords or browse our collections</p>
                <a href="#collections" class="btn-gold">Browse Collections</a>
            </div>
        `;
        return;
    }
    
    // Create results header
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'search-results-header';
    resultsHeader.style.cssText = `
        grid-column: 1/-1;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid var(--gold-light);
    `;
    resultsHeader.innerHTML = `
        <h3 style="color: var(--charcoal); margin-bottom: 10px;">
            Search Results for "${searchTerm}"
            <span style="font-size: 1rem; color: var(--taupe); margin-left: 10px;">
                (${products.length} ${products.length === 1 ? 'item' : 'items'})
            </span>
        </h3>
        <button id="clearSearch" style="
            background: none;
            border: 1px solid var(--gold-light);
            color: var(--taupe);
            padding: 8px 20px;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition);
            font-family: 'Cormorant Garamond', serif;
        ">
            <i class="fas fa-times"></i> Clear Search
        </button>
    `;
    
    productsGrid.appendChild(resultsHeader);
    
    // Add clear search event listener
    setTimeout(() => {
        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                displayFeaturedProducts();
                showNotification('Search cleared');
            });
        }
    }, 100);
    
    // Display products
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        const badgeHtml = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
        const originalPriceHtml = product.originalPrice ?
            `<span class="original-price">${formatIndianRupee(product.originalPrice)}</span>` : '';
        const ratingStars = getRatingStars(product.rating);

        const isInWishlist = wishlist.some(item => item.id === product.id);
        const wishlistBtnClass = isInWishlist ? 'wishlist-btn active' : 'wishlist-btn';
        const wishlistIconClass = isInWishlist ? 'fas fa-heart' : 'far fa-heart';

        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${badgeHtml}
                <button class="${wishlistBtnClass}" data-id="${product.id}" title="${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                    <i class="${wishlistIconClass}"></i>
                </button>
            </div>
            <div class="product-info">
                <div class="product-category">${product.material}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${formatIndianRupee(product.price)}</span>
                    ${originalPriceHtml}
                </div>
                <div class="product-rating">
                    ${ratingStars}
                    <span>(${product.rating})</span>
                </div>
                <div class="product-weight">Weight: ${product.weight}</div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        `;

        productsGrid.appendChild(productCard);
    });

    // Reattach event listeners
    setTimeout(() => {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                addToCart(productId);
            });
        });

        document.querySelectorAll('.wishlist-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                toggleWishlist(productId, this);
            });
        });
    }, 100);

    showNotification(`Found ${products.length} item(s) for "${searchTerm}"`);

    // Auto-scroll to featured products section
    setTimeout(() => {
        scrollToSection('.featured-products');
    }, 300);
}

// Highlight collection card
function highlightCollection(collectionName) {
    // Remove any existing highlights
    document.querySelectorAll('.collection-card').forEach(card => {
        card.classList.remove('highlighted');
    });

    // Find the collection card
    const collectionCards = document.querySelectorAll('.collection-card');
    let found = false;
    
    collectionCards.forEach(card => {
        const title = card.querySelector('h3');
        if (title && title.textContent.toLowerCase().includes(collectionName.toLowerCase())) {
            card.classList.add('highlighted');
            found = true;
            
            // Scroll the card into view
            setTimeout(() => {
                card.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 500);
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
                card.classList.remove('highlighted');
            }, 5000);
        }
    });
    
    if (!found) {
        // If exact match not found, highlight all collections
        collectionCards.forEach(card => {
            card.classList.add('highlighted');
        });
        setTimeout(() => {
            collectionCards.forEach(card => {
                card.classList.remove('highlighted');
            });
        }, 3000);
    }
}

// Get search suggestions
function getSearchSuggestions(searchTerm) {
    const allKeywords = [
        'gold sets', 'diamond rings', 'necklaces', 'bridal collection',
        '24k gold', '22k gold', '18k gold', 'gold prices',
        'bracelets', 'bangles', 'anklets', 'chains',
        'about us', 'contact', 'store location'
    ];
    
    return allKeywords.filter(keyword => 
        keyword.includes(searchTerm) || searchTerm.includes(keyword.split(' ')[0])
    ).slice(0, 3);
}

// Save recent search
function saveRecentSearch(searchTerm) {
    let recentSearches = JSON.parse(localStorage.getItem('aaliRecentSearches')) || [];
    recentSearches = recentSearches.filter(s => s !== searchTerm);
    recentSearches.unshift(searchTerm);
    if (recentSearches.length > 5) recentSearches.pop();
    localStorage.setItem('aaliRecentSearches', JSON.stringify(recentSearches));
}

// Format number helper
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Setup event listeners
function setupEventListeners() {
    // Search toggle
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (searchOverlay) {
                searchOverlay.classList.add('active');
            }
            if (searchInput) searchInput.focus();
        });
    }

    if (searchClose) {
        searchClose.addEventListener('click', function() {
            if (searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });
    }

    if (searchSubmit) {
        searchSubmit.addEventListener('click', function(e) {
            e.preventDefault();
            performSearch();
        });
    }

    if (searchOverlay) {
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });
    }

    // Search input - Enter key
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput.value) {
                showNotification('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add CSS animations (only if not already added by store.js)
if (!document.querySelector('#script-styles')) {
    const style = document.createElement('style');
    style.id = 'script-styles';
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

        @keyframes heartBeat {
            0% { transform: scale(1); }
            25% { transform: scale(1.3); }
            50% { transform: scale(1); }
            75% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        .heart-beat {
            animation: heartBeat 0.5s ease;
        }

        .empty-cart {
            text-align: center;
            padding: 40px 20px;
            color: var(--taupe);
            font-style: italic;
        }

        .wishlist-empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--taupe);
        }

        .wishlist-empty i {
            font-size: 3rem;
            color: var(--gold-light);
            margin-bottom: 20px;
        }

        .wishlist-empty p {
            margin-bottom: 20px;
            font-size: 1.1rem;
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
        
        .notification {
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

// Google Form submission
document.body.addEventListener("submit", function (e) {
    const form = e.target;
    if (!form.matches("form")) return;
  
    e.preventDefault(); // ✅ STOP normal submit for ALL forms
  
    const formData = new FormData(form);
  
    fetch("https://script.google.com/macros/s/AKfycbzgwRGXclePYSYqOUrvkZTJmiBELzm7zkeCIKhAByD8pyVKK9IfER_VxoaXKYkaHwrw/exec", {
      method: "POST",
      body: formData
    })
    .then(() => {
      showNotification("Submitted successfully!", "success");
      form.reset();
    })
    .catch(() => {
      showNotification("Submission failed!", "error");
    });
  });

// Function to show notification for form submission
function showNotification(message, type) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <p>${message}</p>
        <button class="close-notification">&times;</button>
    `;

    // Add styles for notification
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 100px;
            right: 20px;
            padding: 10px 10px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 400px;
            height: 100px;
            animation: slideIn 0.3s ease-out;
        }

        .notification.success {
            background: #27ae60;
            color: white;
        }

        .notification.error {
            background: #e74c3c;
            color: white;
        }

        .notification p {
            margin: 0;
            margin-right: 15px;
        }

        .close-notification {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }

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
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Auto remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';

        // Add slideOut animation
        const slideOutStyle = document.createElement('style');
        slideOutStyle.textContent = `
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
        `;
        document.head.appendChild(slideOutStyle);

        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);

    // Close button functionality
    notification.querySelector('.close-notification').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// scroll spy code 
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".main-nav a");

    function setActiveLink() {
        let scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute("id");

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => link.classList.remove("active"));

                const activeLink = document.querySelector(
                    `.main-nav a[href="#${id}"]`
                );
                if (activeLink) activeLink.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", setActiveLink);
    setActiveLink(); // run once on load
});

// ===============================
// STATS COUNT ANIMATION (FIXED)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const statsSection = document.querySelector(".stats-grid");
    const counters = document.querySelectorAll(".stat-number");

    if (!statsSection || counters.length === 0) return;

    let hasAnimated = false;

    const startCount = () => {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute("data-count"), 10);
            let current = 0;
            const increment = Math.ceil(target / 200);

            const update = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = current;
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                }
            };

            update();
        });
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                startCount();
                observer.disconnect();
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(statsSection);
});

// cart code shopping button
// close cart when clicking browse collections
document.querySelectorAll('#wishlistSidebar .btn-outline1').forEach(btn => {
    btn.addEventListener('click', function () {
        // Close wishlist sidebar
        wishlistSidebar.classList.remove('active');

        // Close wishlist overlay
        wishlistOverlay.classList.remove('active');
    });
});

// Close cart when clicking Continue Shopping
document.querySelectorAll('.btn-outline2').forEach(btn => {
    btn.addEventListener('click', function () {
        // Close cart sidebar
        cartSidebar.classList.remove('active');

        // Close overlay
        cartOverlay.classList.remove('active');
    });
});

// code for wishlist
// Close wishlist when clicking Continue Shopping
document.querySelectorAll('#wishlistSidebar .btn-gold').forEach(btn => {
    btn.addEventListener('click', function () {
        // Close wishlist sidebar
        wishlistSidebar.classList.remove('active');

        // Close wishlist overlay
        wishlistOverlay.classList.remove('active');
    });
});
 
// ==========================================

let testimonialSliderInterval; // Global variable for the timer

function initTestimonialsSlider() {
    const track = document.getElementById('testimonialsTrack');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    
    // Safety check
    if (!track || !slides.length) return;
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // 1. Clear and Recreate Dots
    if (dotsContainer) {
        dotsContainer.innerHTML = ''; 
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'testimonial-dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(i);
                resetTimer();
            });
            dotsContainer.appendChild(dot);
        }
    }
    
    // 2. Slide Function
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        
        // Move track
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update active classes on slides
        const allSlides = document.querySelectorAll('.testimonial-slide');
        allSlides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        
        // Update dots
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.testimonial-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
    }
    
    // 3. Navigation Logic
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(currentSlide);
    }

    // 4. Timer Logic
    function startTimer() {
        if (testimonialSliderInterval) clearInterval(testimonialSliderInterval);
        testimonialSliderInterval = setInterval(nextSlide, 5000);
    }

    function resetTimer() {
        if (testimonialSliderInterval) clearInterval(testimonialSliderInterval);
        startTimer();
    }
    
    // 5. Attach Events
    if(nextBtn) nextBtn.onclick = () => { nextSlide(); resetTimer(); };
    if(prevBtn) prevBtn.onclick = () => { prevSlide(); resetTimer(); };
    
    track.onmouseenter = () => clearInterval(testimonialSliderInterval);
    track.onmouseleave = () => startTimer();
    
    // Start
    goToSlide(0); 
    startTimer();
}

// Function to add Testimonials link to nav (Kept from your original code)
function addTestimonialsToNav() {
    const mainNav = document.querySelector('.main-nav ul');
    if (mainNav) {
        const metalsPricingItem = Array.from(mainNav.querySelectorAll('li')).find(li => 
            li.querySelector('a[href="#metals"]')
        );
        
        // Check if it already exists to avoid duplicates
        const existingTestimonial = Array.from(mainNav.querySelectorAll('li')).find(li => 
            li.querySelector('a[href="#testimonials"]')
        );

        if (metalsPricingItem && !existingTestimonial) {
            const testimonialsItem = document.createElement('li');
            testimonialsItem.innerHTML = '<a href="#testimonials">Testimonials</a>';
            metalsPricingItem.parentNode.insertBefore(testimonialsItem, metalsPricingItem.nextSibling);
        }
    }
}

// ==========================================
// REVIEW FORM HANDLING & INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Initialize Slider and Nav
    setTimeout(() => {
        addTestimonialsToNav();
        initTestimonialsSlider();
    }, 500);

    // 2. Modal Elements
    const reviewBtn = document.querySelector('.testimonials-cta .btn-gold');
    const modal = document.getElementById('reviewModal');
    const closeModalBtn = document.getElementById('closeReviewModal');
    const reviewForm = document.getElementById('reviewForm');

    // 3. Open Modal
    if (reviewBtn && modal) {
        reviewBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        });
    }

    // 4. Close Modal Logic
    function closeReviewModal() {
        if(modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeReviewModal);
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeReviewModal();
        });
    }

    // 5. Handle Form Submit & Add Slide
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get Values
            const name = document.getElementById('reviewerName').value;
            const city = document.getElementById('reviewerCity').value;
            const item = document.getElementById('reviewerItem').value;
            const text = document.getElementById('reviewerText').value;
            
            // Get selected rating
            const ratingInput = document.querySelector('input[name="rating"]:checked');
            const rating = ratingInput ? ratingInput.value : 5;

            // Generate Stars HTML
            let starsHtml = '';
            for(let i=1; i<=5; i++) {
                if(i <= rating) starsHtml += '<i class="fas fa-star"></i>';
                else starsHtml += '<i class="far fa-star"></i>';
            }

            // Create Avatar (Initials)
            const initials = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
            const bgColors = ['#C5A028', '#8B6914', '#D4B483'];
            const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

            // Create New Slide HTML
            const newSlideDiv = document.createElement('div');
            newSlideDiv.className = 'testimonial-slide';
            newSlideDiv.innerHTML = `
                <div class="testimonial-card">
                    <div class="testimonial-content">
                        <p class="testimonial-quote">"${text}"</p>
                        <div class="testimonial-rating">
                            ${starsHtml}
                            <span class="rating-value">${rating}.0</span>
                        </div>
                    </div>
                    <div class="testimonial-author">
                        <div class="author-avatar" style="background-color: ${randomBg}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">
                            ${initials}
                        </div>
                        <div class="author-info">
                            <h4 class="author-name">${name}</h4>
                            <p class="author-city">
                                <i class="fas fa-map-marker-alt"></i> ${city}
                            </p>
                            <span class="testimonial-jewellery">${item}</span>
                        </div>
                    </div>
                </div>
            `;

            // Append to Track
            const track = document.getElementById('testimonialsTrack');
            // Add it before the last slide or just append it
            track.appendChild(newSlideDiv);

            // Re-Initialize Slider
            initTestimonialsSlider();

            // Show Success & Close
            // Use your existing showNotification function
            if(typeof showNotification === 'function') {
                showNotification('Review submitted successfully!');
            } else {
                alert('Review submitted successfully!');
            }
            
            reviewForm.reset();
            closeReviewModal();
            
            // Scroll to testimonials
            document.getElementById('testimonials').scrollIntoView({behavior: 'smooth'});
        });
    }
});


