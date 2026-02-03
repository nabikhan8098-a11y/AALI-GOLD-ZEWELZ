// checkout.js - Professional Jewelry Checkout System with Enhanced Features
// Includes quantity management, remove functionality, and simplified GST breakdown

document.addEventListener('DOMContentLoaded', function() {
    // Metal Properties Configuration (Prices per gram)
    const METAL_PROPERTIES = {
        '22K': {
            currentRate: 13355,
            purity: 91.6,
            gst: 0.03,
            makingCharge: 0.10,
            displayName: '22K Gold'
        },
        '24K': {
            currentRate: 14569,
            purity: 99.9,
            gst: 0.03,
            makingCharge: 0.12,
            displayName: '24K Gold'
        },
        '18K': {
            currentRate: 10927,
            purity: 75.0,
            gst: 0.03,
            makingCharge: 0.08,
            displayName: '18K Gold'
        },
        'silver': {
            currentRate: 85,
            purity: 92.5,
            gst: 0.03,
            makingCharge: 0.15,
            displayName: 'Silver'
        },
        'platinum': {
            currentRate: 3200,
            purity: 95.0,
            gst: 0.03,
            makingCharge: 0.20,
            displayName: 'Platinum'
        }
    };

    // DOM Elements
    const orderItemsContainer = document.getElementById('orderItems');
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const backToCartBtn = document.getElementById('backToCart');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
    const successModal = document.getElementById('successModal');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const paymentDetailsContainer = document.getElementById('paymentDetails');
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    // Order Data
    let orderData = {
        cart: [],
        customerInfo: {},
        priceBreakdown: {},
        orderId: '',
        timestamp: '',
        totalSavings: 0
    };
    
    // Initialize checkout system
    initCheckout();
    
    function initCheckout() {
        loadCart();
        updateCartCount();
        setupEventListeners();
        restoreFormData();
    }
    
    function loadCart() {
        // Get cart from global system or localStorage
        if (window.AaliCart && window.AaliCart.getCart) {
            orderData.cart = window.AaliCart.getCart();
        } else {
            const savedCart = localStorage.getItem('aaliGlobalCart');
            orderData.cart = savedCart ? JSON.parse(savedCart) : [];
        }
        
        if (orderData.cart.length === 0) {
            showEmptyCartMessage();
            return;
        }
        
        displayOrderItems();
        calculatePrices();
    }
    
    function showEmptyCartMessage() {
        // Clear order items container
        orderItemsContainer.innerHTML = '';
        
        // Create empty cart message
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-cart-message';
        emptyMessage.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-shopping-cart" style="font-size: 80px; color: #C5A028; margin-bottom: 25px; opacity: 0.5;"></i>
                <h2 style="color: #333; margin-bottom: 15px; font-family: 'Cormorant Garamond', serif;">Your Cart is Empty</h2>
                <p style="color: #666; margin-bottom: 35px; font-size: 1.1rem; max-width: 500px; margin-left: auto; margin-right: auto;">
                    You haven't added any jewelry items to your cart yet. Browse our exquisite collections to find your perfect piece.
                </p>
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <a href="index.html" class="btn-gold" style="display: inline-flex; align-items: center; gap: 12px; padding: 15px 30px; text-decoration: none; background: linear-gradient(135deg, #C5A028, #8B6914); color: white; border-radius: 6px; font-weight: 600; font-size: 1.1rem;">
                        <i class="fas fa-home"></i> Back to Home
                    </a>
                    <a href="index.html#collections" class="btn-outline" style="display: inline-flex; align-items: center; gap: 12px; padding: 15px 30px; text-decoration: none; border: 2px solid #C5A028; color: #C5A028; border-radius: 6px; font-weight: 600; font-size: 1.1rem; background: white;">
                        <i class="fas fa-gem"></i> Browse Collections
                    </a>
                </div>
            </div>
        `;
        
        orderItemsContainer.appendChild(emptyMessage);
        
        // Hide the checkout form and price breakdown
        checkoutForm.style.display = 'none';
        
        // Hide price breakdown section
        const priceBreakdownSection = document.querySelector('.price-breakdown');
        if (priceBreakdownSection) {
            priceBreakdownSection.style.display = 'none';
        }
        
        // Hide order summary header
        const orderSummaryHeader = document.querySelector('.order-summary h2');
        if (orderSummaryHeader) {
            orderSummaryHeader.style.display = 'none';
        }
        
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-ban"></i> Cart is Empty';
        
        // Update cart count
        updateCartCount();
    }
    
    function displayOrderItems() {
    orderItemsContainer.innerHTML = '';
    orderData.totalSavings = 0;
    
    orderData.cart.forEach(item => {
        const metalType = item.metal || extractMetalType(item);
        const weight = extractWeight(item);
        const metalProps = METAL_PROPERTIES[metalType] || METAL_PROPERTIES['22K'];
        const savings = calculateSavings(item);
        orderData.totalSavings += savings;
        
        // FIX: Normalize image path for checkout page
        let imagePath = item.image || 'gold-images/placeholder.jpg';
        // Remove leading "../" if present (from subdirectory collections)
        if (imagePath.startsWith('../')) {
            imagePath = imagePath.substring(3); // Remove "../"
        }
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="order-item-image">
                <img src="${imagePath}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='gold-images/placeholder.jpg';">
            </div>
            <div class="order-item-details">
                <h4>${item.name}</h4>
                <div class="order-item-specs">
                    <span class="metal-type" style="background: ${getMetalColor(metalType)}; color: white; padding: 3px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">
                        ${metalProps.displayName}
                    </span>
                    ${weight ? `<span class="weight" style="background: #f8f9fa; padding: 3px 10px; border-radius: 4px; font-size: 0.8rem; border: 1px solid #e9ecef;">${weight}g</span>` : ''}
                    ${item.stone ? `<span class="stone" style="background: #e3f2fd; padding: 3px 10px; border-radius: 4px; font-size: 0.8rem; border: 1px solid #bbdefb;">${item.stone}</span>` : ''}
                    ${item.carat ? `<span class="carat" style="background: #f8f9fa; padding: 3px 10px; border-radius: 4px; font-size: 0.8rem; border: 1px solid #e9ecef;">${item.carat}ct</span>` : ''}
                </div>
                ${savings > 0 ? `
                    <div class="item-savings" style="color:#27ae60; font-size:0.9rem; margin-top:8px; display:flex; align-items:center; gap:6px; font-weight:600;">
                        <i class="fas fa-tag"></i> You save ${formatIndianRupee(savings)}
                    </div>
                ` : ''}
                <div class="item-actions" style="margin-top: 15px; display: flex; align-items: center; gap: 10px;">
                    <div class="quantity-controls" style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                        <button class="quantity-decrease" data-id="${item.id}" style="background: #f8f9fa; border: none; padding: 8px 12px; cursor: pointer; font-size: 1rem; color: #333; border-right: 1px solid #ddd;">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display" style="padding: 8px 15px; font-weight: 600; min-width: 40px; text-align: center; background: white;">
                            ${item.quantity || 1}
                        </span>
                        <button class="quantity-increase" data-id="${item.id}" style="background: #f8f9fa; border: none; padding: 8px 12px; cursor: pointer; font-size: 1rem; color: #333; border-left: 1px solid #ddd;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}" style="background: none; border: 1px solid #ff6b6b; color: #ff6b6b; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="order-item-price">
                <div class="item-total" style="font-size: 1.3rem; font-weight: 700; color: #C5A028; margin-bottom: 8px;">
                    ${formatIndianRupee(item.price * (item.quantity || 1))}
                </div>
                <div class="item-quantity" style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">Qty: ${item.quantity || 1}</div>
                <div class="item-unit-price" style="font-size: 0.85rem; color: #999;">${formatIndianRupee(item.price)} each</div>
                ${item.originalPrice && item.originalPrice > item.price ? `
                    <div class="item-original" style="font-size: 0.85rem; color: #999; text-decoration: line-through; margin-top: 3px;">
                        ${formatIndianRupee(item.originalPrice * (item.quantity || 1))}
                    </div>
                ` : ''}
            </div>
        `;
        
        orderItemsContainer.appendChild(itemElement);
        
        // Store metal properties for calculations
        item.metalType = metalType;
        item.metalProps = metalProps;
        item.weight = weight;
        item.savings = savings;
    });
    
    // Add event listeners for quantity controls and remove buttons
    setupItemEventListeners();
}
    function setupItemEventListeners() {
        // Quantity decrease buttons
        document.querySelectorAll('.quantity-decrease').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.id);
                updateItemQuantity(itemId, -1);
            });
        });
        
        // Quantity increase buttons
        document.querySelectorAll('.quantity-increase').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.id);
                updateItemQuantity(itemId, 1);
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.id);
                removeItemFromCart(itemId);
            });
        });
    }
    
    function updateItemQuantity(itemId, change) {
        // Find item in cart
        const itemIndex = orderData.cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        
        const item = orderData.cart[itemIndex];
        const currentQuantity = item.quantity || 1;
        const newQuantity = currentQuantity + change;
        
        // If quantity becomes 0 or less, remove the item
        if (newQuantity <= 0) {
            removeItemFromCart(itemId);
            return;
        }
        
        // Update quantity
        item.quantity = newQuantity;
        
        // Update in localStorage
        if (window.AaliCart && window.AaliCart.getCart) {
            // Update in global cart system
            const globalCart = window.AaliCart.getCart();
            const globalItemIndex = globalCart.findIndex(item => item.id === itemId);
            if (globalItemIndex !== -1) {
                globalCart[globalItemIndex].quantity = newQuantity;
                localStorage.setItem('aaliGlobalCart', JSON.stringify(globalCart));
            }
        } else {
            // Update in localStorage directly
            const savedCart = localStorage.getItem('aaliGlobalCart');
            if (savedCart) {
                const cart = JSON.parse(savedCart);
                const cartItemIndex = cart.findIndex(item => item.id === itemId);
                if (cartItemIndex !== -1) {
                    cart[cartItemIndex].quantity = newQuantity;
                    localStorage.setItem('aaliGlobalCart', JSON.stringify(cart));
                }
            }
        }
        
        // Update UI
        const quantityDisplay = document.querySelector(`.quantity-decrease[data-id="${itemId}"]`).parentNode.querySelector('.quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = newQuantity;
        }
        
        // Update item total price
        const itemElement = document.querySelector(`.remove-item-btn[data-id="${itemId}"]`).closest('.order-item');
        if (itemElement) {
            const itemTotal = itemElement.querySelector('.item-total');
            const itemQuantity = itemElement.querySelector('.item-quantity');
            const itemOriginal = itemElement.querySelector('.item-original');
            
            if (itemTotal) {
                itemTotal.textContent = formatIndianRupee(item.price * newQuantity);
            }
            
            if (itemQuantity) {
                itemQuantity.textContent = `Qty: ${newQuantity}`;
            }
            
            if (item.originalPrice && itemOriginal) {
                itemOriginal.textContent = formatIndianRupee(item.originalPrice * newQuantity);
            }
        }
        
        // Recalculate prices
        calculatePrices();
        updateCartCount();
        
        // Show notification
        showNotification(`Quantity updated to ${newQuantity}`, 'success');
    }
    
    function removeItemFromCart(itemId) {
        // Remove from orderData cart
        const itemIndex = orderData.cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        
        const itemName = orderData.cart[itemIndex].name;
        orderData.cart.splice(itemIndex, 1);
        
        // Remove from localStorage
        if (window.AaliCart && window.AaliCart.removeFromGlobalCart) {
            window.AaliCart.removeFromGlobalCart(itemId);
        } else {
            const savedCart = localStorage.getItem('aaliGlobalCart');
            if (savedCart) {
                let cart = JSON.parse(savedCart);
                cart = cart.filter(item => item.id !== itemId);
                localStorage.setItem('aaliGlobalCart', JSON.stringify(cart));
            }
        }
        
        // Show notification
        showNotification(`${itemName} removed from cart`, 'success');
        
        // Reload cart display
        if (orderData.cart.length === 0) {
            showEmptyCartMessage();
        } else {
            displayOrderItems();
            calculatePrices();
        }
        
        updateCartCount();
    }
    
    function getMetalColor(metalType) {
        const colors = {
            '22K': '#C5A028',
            '24K': '#FFD700',
            '18K': '#D4AF37',
            'silver': '#C0C0C0',
            'platinum': '#E5E4E2'
        };
        return colors[metalType] || '#C5A028';
    }
    
    function extractMetalType(item) {
        if (item.metal) return item.metal;
        
        const name = (item.name || '').toLowerCase();
        const material = (item.material || '').toLowerCase();
        
        if (name.includes('24k') || name.includes('24ct') || material.includes('24k')) return '24K';
        if (name.includes('18k') || name.includes('18ct') || material.includes('18k')) return '18K';
        if (name.includes('silver') || material.includes('silver')) return 'silver';
        if (name.includes('platinum') || material.includes('platinum')) return 'platinum';
        
        return '22K';
    }
    
    function extractWeight(item) {
        if (item.weight) {
            const weightMatch = item.weight.toString().match(/(\d+(\.\d+)?)/);
            return weightMatch ? parseFloat(weightMatch[1]) : null;
        }
        
        // Estimate based on product type
        const name = (item.name || '').toLowerCase();
        if (name.includes('ring')) return 3.5;
        if (name.includes('bangle') || name.includes('bracelet')) return 12;
        if (name.includes('necklace')) return 8;
        if (name.includes('earring')) return 4;
        if (name.includes('pendant')) return 5;
        
        return 6;
    }
    
    function calculateSavings(item) {
        if (item.originalPrice && item.originalPrice > item.price) {
            return (item.originalPrice - item.price) * (item.quantity || 1);
        }
        return 0;
    }
    
    function calculatePrices() {
        let totalGoldValue = 0;
        let totalMakingCharges = 0;
        let totalGST = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let cartTotal = 0;
        
        // First, calculate cart total
        orderData.cart.forEach(item => {
            const totalItemPrice = item.price * (item.quantity || 1);
            cartTotal += totalItemPrice;
        });
        
        // Now calculate breakdown for each item
        orderData.cart.forEach(item => {
            const metalProps = item.metalProps || METAL_PROPERTIES[item.metalType || '22K'];
            const weight = item.weight || extractWeight(item);
            const totalItemPrice = item.price * (item.quantity || 1);
            
            if (weight && metalProps) {
                // Calculate approximate gold/metal value based on weight
                const estimatedGoldValue = weight * metalProps.currentRate;
                
                // Calculate approximate making charges (percentage of gold value)
                const estimatedMakingCharges = estimatedGoldValue * metalProps.makingCharge;
                
                // Calculate total before GST
                const estimatedTotalBeforeGST = estimatedGoldValue + estimatedMakingCharges;
                
                // Calculate GST (3% of totalBeforeGST)
                const estimatedGST = estimatedTotalBeforeGST * 0.03;
                
                // Calculate the actual ratios based on the final price
                // We need to reverse calculate from the final price
                const finalPrice = totalItemPrice;
                
                // Calculate the base value (Gold + Making) from final price
                // finalPrice = baseValue + (baseValue * 0.03)
                // finalPrice = baseValue * 1.03
                // baseValue = finalPrice / 1.03
                const baseValue = finalPrice / 1.03;
                
                // Calculate GST amount (3% total)
                const gstAmount = finalPrice - baseValue;
                const cgstAmount = gstAmount / 2; // CGST half of total GST (1.5%)
                const sgstAmount = gstAmount / 2; // SGST half of total GST (1.5%)
                
                // Now we need to split baseValue into Gold Value and Making Charges
                // Using the estimated ratio from weight calculation
                const goldToMakingRatio = estimatedGoldValue / estimatedMakingCharges;
                
                // goldValue + makingCharges = baseValue
                // goldValue = goldToMakingRatio * makingCharges
                // So: (goldToMakingRatio * makingCharges) + makingCharges = baseValue
                // makingCharges * (goldToMakingRatio + 1) = baseValue
                const makingCharges = baseValue / (goldToMakingRatio + 1);
                const goldValue = baseValue - makingCharges;
                
                // Store calculated values
                item.calculatedGoldValue = Math.round(goldValue);
                item.calculatedMakingCharges = Math.round(makingCharges);
                item.calculatedGST = Math.round(gstAmount);
                item.calculatedCGST = Math.round(cgstAmount);
                item.calculatedSGST = Math.round(sgstAmount);
                item.calculatedTotal = Math.round(finalPrice);
                
                totalGoldValue += item.calculatedGoldValue;
                totalMakingCharges += item.calculatedMakingCharges;
                totalGST += item.calculatedGST;
                totalCGST += item.calculatedCGST;
                totalSGST += item.calculatedSGST;
            } else {
                // If we can't calculate based on weight, use default breakdown
                // Assume 70% gold value, 20% making charges, 10% GST (5% CGST + 5% SGST)
                const goldValue = totalItemPrice * 0.70;
                const makingCharges = totalItemPrice * 0.20;
                const gstAmount = totalItemPrice * 0.10;
                const cgstAmount = gstAmount / 2; // 5% CGST
                const sgstAmount = gstAmount / 2; // 5% SGST
                
                item.calculatedGoldValue = Math.round(goldValue);
                item.calculatedMakingCharges = Math.round(makingCharges);
                item.calculatedGST = Math.round(gstAmount);
                item.calculatedCGST = Math.round(cgstAmount);
                item.calculatedSGST = Math.round(sgstAmount);
                item.calculatedTotal = Math.round(totalItemPrice);
                
                totalGoldValue += item.calculatedGoldValue;
                totalMakingCharges += item.calculatedMakingCharges;
                totalGST += item.calculatedGST;
                totalCGST += item.calculatedCGST;
                totalSGST += item.calculatedSGST;
            }
        });
        
        // Store in orderData
        orderData.priceBreakdown = {
            goldValue: Math.round(totalGoldValue),
            makingCharges: Math.round(totalMakingCharges),
            totalGST: Math.round(totalGST),
            cgst: Math.round(totalCGST),
            sgst: Math.round(totalSGST),
            cartTotal: Math.round(cartTotal),
            totalSavings: Math.round(orderData.totalSavings)
        };
        
        updatePriceDisplay();
    }
    
    function updatePriceDisplay() {
        const pb = orderData.priceBreakdown;
        
        // Update the price breakdown HTML
        const priceBreakdownSection = document.querySelector('.price-breakdown');
        if (priceBreakdownSection) {
            // Create new breakdown rows with clean GST breakdown
            priceBreakdownSection.innerHTML = `
                <h3><i class="fas fa-calculator"></i> Price Breakdown</h3>
                
                <div class="breakdown-row">
                    <span>Gold/Metal Value</span>
                    <span>${formatIndianRupee(pb.goldValue)}</span>
                </div>
                
                <div class="breakdown-row">
                    <span>Making Charges</span>
                    <span>${formatIndianRupee(pb.makingCharges)}</span>
                </div>
                
                <div class="gst-breakdown">
                    <h4>GST Breakdown (3%)</h4>
                    <div class="breakdown-row">
                        <span>CGST (1.5%)</span>
                        <span>${formatIndianRupee(pb.cgst)}</span>
                    </div>
                    <div class="breakdown-row">
                        <span>SGST (1.5%)</span>
                        <span>${formatIndianRupee(pb.sgst)}</span>
                    </div>
                    <div class="breakdown-row">
                        <span>Total GST</span>
                        <span>${formatIndianRupee(pb.totalGST)}</span>
                    </div>
                </div>
                
                ${pb.totalSavings > 0 ? `
                    <div class="breakdown-row" style="color: #27ae60; font-weight: 600;">
                        <span>Total Savings</span>
                        <span>-${formatIndianRupee(pb.totalSavings)}</span>
                    </div>
                ` : ''}
                
                <div class="breakdown-row total">
                    <strong>Total Amount</strong>
                    <strong>${formatIndianRupee(pb.cartTotal)}</strong>
                </div>
            `;
        }
    }
    
    function updateCartCount() {
        let count = 0;
        
        if (window.AaliCart && window.AaliCart.getCartCount) {
            count = window.AaliCart.getCartCount();
        } else {
            const savedCart = localStorage.getItem('aaliGlobalCart');
            const cart = savedCart ? JSON.parse(savedCart) : [];
            count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        }
        
        cartCountElements.forEach(element => {
            element.textContent = count;
        });
    }
    
    function setupEventListeners() {
        // Back to Cart button
        if (backToCartBtn) {
            backToCartBtn.addEventListener('click', function() {
                window.history.back();
            });
        }
        
        // Payment method change
        if (paymentMethodSelect) {
            paymentMethodSelect.addEventListener('change', function() {
                showPaymentDetails(this.value);
            });
        }
        
        // Form submission
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (validateForm()) {
                    processOrder();
                }
            });
        }
        
        // Back to Home button in success modal
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', function() {
                window.location.href = 'index.html';
            });
        }
        
        // Download Invoice button
        if (downloadInvoiceBtn) {
            downloadInvoiceBtn.addEventListener('click', generateProfessionalInvoice);
        }
        
        // Input change - save to localStorage
        checkoutForm.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('change', saveFormData);
            element.addEventListener('input', saveFormData);
        });
    }
    
    function showPaymentDetails(method) {
        paymentDetailsContainer.innerHTML = '';
        paymentDetailsContainer.style.display = 'none';
        
        if (!method) return;
        
        paymentDetailsContainer.style.display = 'block';
        
        switch(method) {
            case 'upi':
                paymentDetailsContainer.innerHTML = `
                    <div class="payment-details-group">
                        <div class="form-group">
                            <label for="upiId"><i class="fas fa-mobile-alt"></i> UPI ID *</label>
                            <input type="text" id="upiId" name="upiId" required 
                                   placeholder="yourname@bank" pattern=".+@.+\..+">
                        </div>
                    </div>
                `;
                break;
                
            case 'netbanking':
                paymentDetailsContainer.innerHTML = `
                    <div class="payment-details-group">
                        <div class="form-group">
                            <label for="bankName"><i class="fas fa-university"></i> Bank Name *</label>
                            <select id="bankName" name="bankName" required>
                                <option value="">Select Bank</option>
                                <option value="sbi">State Bank of India</option>
                                <option value="hdfc">HDFC Bank</option>
                                <option value="icici">ICICI Bank</option>
                                <option value="axis">Axis Bank</option>
                                <option value="kotak">Kotak Mahindra Bank</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'card':
                paymentDetailsContainer.innerHTML = `
                    <div class="payment-details-group">
                        <div class="form-group">
                            <label for="cardNumber"><i class="fas fa-credit-card"></i> Card Number *</label>
                            <input type="text" id="cardNumber" name="cardNumber" required 
                                   placeholder="1234 5678 9012 3456" pattern="[0-9\s]{16,19}">
                        </div>
                        <div class="form-group">
                            <label for="cardExpiry"><i class="fas fa-calendar-alt"></i> Expiry Date *</label>
                            <input type="text" id="cardExpiry" name="cardExpiry" required 
                                   placeholder="MM/YY" pattern="(0[1-9]|1[0-2])\/[0-9]{2}">
                        </div>
                        <div class="form-group">
                            <label for="cardCVV"><i class="fas fa-lock"></i> CVV *</label>
                            <input type="text" id="cardCVV" name="cardCVV" required 
                                   placeholder="123" pattern="[0-9]{3,4}">
                        </div>
                        <div class="form-group">
                            <label for="cardName"><i class="fas fa-user"></i> Name on Card *</label>
                            <input type="text" id="cardName" name="cardName" required 
                                   placeholder="As on card">
                        </div>
                    </div>
                `;
                break;
                
            case 'cod':
                paymentDetailsContainer.innerHTML = `
                    <div class="payment-note">
                        <p><i class="fas fa-info-circle"></i> Cash on Delivery available. 
                        Additional ₹100 handling charges apply. Cash payment only.</p>
                    </div>
                `;
                break;
        }
        
        // Add event listeners to new inputs
        paymentDetailsContainer.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('change', saveFormData);
            element.addEventListener('input', saveFormData);
        });
    }
    
    function validateForm() {
        const form = checkoutForm;
        let isValid = true;
        const errors = [];
        
        // Check cart
        if (orderData.cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return false;
        }
        
        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ff4757';
                errors.push(`${field.previousElementSibling.textContent} is required`);
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
        // Validate Aadhaar (12 digits)
        const aadhaarField = document.getElementById('customerAadhaar');
        if (aadhaarField && aadhaarField.value) {
            const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
            if (!aadhaarRegex.test(aadhaarField.value)) {
                aadhaarField.style.borderColor = '#ff4757';
                errors.push('Invalid Aadhaar number (must be 12 digits and valid)');
                isValid = false;
            }
        }
        
        // Validate phone (10 digits)
        const phoneField = document.getElementById('customerPhone');
        if (phoneField && phoneField.value) {
            const phoneRegex = /^[6-9]{1}[0-9]{9}$/;
            if (!phoneRegex.test(phoneField.value)) {
                phoneField.style.borderColor = '#ff4757';
                errors.push('Invalid mobile number (must be 10 digits and valid)');
                isValid = false;
            }
        }
        
        // Validate pincode (6 digits)
        const pincodeField = document.getElementById('customerPincode');
        if (pincodeField && pincodeField.value) {
            const pincodeRegex = /^[1-9]{1}[0-9]{5}$/;
            if (!pincodeRegex.test(pincodeField.value)) {
                pincodeField.style.borderColor = '#ff4757';
                errors.push('Invalid pincode (must be 6 digits)');
                isValid = false;
            }
        }
        
        // Validate email if provided
        const emailField = document.getElementById('customerEmail');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                emailField.style.borderColor = '#ff4757';
                errors.push('Invalid email address');
                isValid = false;
            }
        }
        
        // Show errors if any
        if (errors.length > 0) {
            showNotification(errors.join('<br>'), 'error');
        }
        
        return isValid;
    }
    
    function saveFormData() {
        const formData = {
            name: document.getElementById('customerName')?.value || '',
            phone: document.getElementById('customerPhone')?.value || '',
            email: document.getElementById('customerEmail')?.value || '',
            address: document.getElementById('customerAddress')?.value || '',
            pincode: document.getElementById('customerPincode')?.value || '',
            aadhaar: document.getElementById('customerAadhaar')?.value || '',
            paymentMethod: document.getElementById('paymentMethod')?.value || '',
            upiId: document.getElementById('upiId')?.value || '',
            bankName: document.getElementById('bankName')?.value || '',
            cardNumber: document.getElementById('cardNumber')?.value || '',
            cardExpiry: document.getElementById('cardExpiry')?.value || '',
            cardCVV: document.getElementById('cardCVV')?.value || '',
            cardName: document.getElementById('cardName')?.value || ''
        };
        
        localStorage.setItem('aaliCheckoutFormData', JSON.stringify(formData));
    }
    
    function restoreFormData() {
        const savedData = localStorage.getItem('aaliCheckoutFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            Object.keys(formData).forEach(key => {
                const element = document.getElementById(key === 'name' ? 'customerName' : 
                    key === 'phone' ? 'customerPhone' :
                    key === 'email' ? 'customerEmail' :
                    key === 'address' ? 'customerAddress' :
                    key === 'pincode' ? 'customerPincode' :
                    key === 'aadhaar' ? 'customerAadhaar' :
                    key === 'paymentMethod' ? 'paymentMethod' :
                    key === 'upiId' ? 'upiId' :
                    key === 'bankName' ? 'bankName' :
                    key === 'cardNumber' ? 'cardNumber' :
                    key === 'cardExpiry' ? 'cardExpiry' :
                    key === 'cardCVV' ? 'cardCVV' :
                    key === 'cardName' ? 'cardName' : key);
                    
                if (element) {
                    element.value = formData[key];
                    
                    // Trigger change event for payment method
                    if (key === 'paymentMethod' && formData[key]) {
                        element.dispatchEvent(new Event('change'));
                    }
                }
            });
        }
    }
    
    async function processOrder() {
        // Disable button and show loading
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        loadingSpinner.classList.add('active');
        
        try {
            // Collect customer info
            orderData.customerInfo = {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value,
                email: document.getElementById('customerEmail').value,
                address: document.getElementById('customerAddress').value,
                pincode: document.getElementById('customerPincode').value,
                aadhaar: document.getElementById('customerAadhaar').value,
                paymentMethod: document.getElementById('paymentMethod').value,
                paymentDetails: getPaymentDetails()
            };
            
            // Generate order ID
            orderData.orderId = generateOrderId();
            orderData.timestamp = new Date().toISOString();
            
            // Prepare data for Google Sheets
            const sheetData = prepareGoogleSheetsData();
            
            // Send to Google Sheets
            const googleSheetsSuccess = await sendToGoogleSheets(sheetData);
            
            if (googleSheetsSuccess) {
                // Save order locally
                saveOrderLocally();
                
                // Clear cart
                clearCart();
                
                // Clear form data from localStorage
                localStorage.removeItem('aaliCheckoutFormData');
                
                // Show success modal
                showSuccessModal();
            } else {
                throw new Error('Failed to save order to server');
            }
        } catch (error) {
            console.error('Order processing error:', error);
            showNotification('Order processing failed. Please try again.', 'error');
        } finally {
            // Reset button and hide loading
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = '<i class="fas fa-lock"></i> Place Secure Order';
            loadingSpinner.classList.remove('active');
        }
    }
    
    function getPaymentDetails() {
        const method = document.getElementById('paymentMethod').value;
        let details = { method: method };
        
        switch(method) {
            case 'upi':
                details.upiId = document.getElementById('upiId')?.value || '';
                break;
            case 'netbanking':
                details.bankName = document.getElementById('bankName')?.value || '';
                break;
            case 'card':
                details.cardLast4 = document.getElementById('cardNumber')?.value.slice(-4) || '';
                details.cardType = 'Credit/Debit Card';
                break;
            case 'cod':
                details.codCharges = 100;
                break;
        }
        
        return details;
    }
    
    function generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `AALI${timestamp.toString().slice(-6)}${random.toString().padStart(4, '0')}`;
    }
    
    function prepareGoogleSheetsData() {
        // Format data for Google Sheets
        const data = new FormData();
        
        // Basic order info
        data.append('orderId', orderData.orderId);
        data.append('timestamp', orderData.timestamp);
        data.append('totalAmount', orderData.priceBreakdown.cartTotal);
        data.append('paymentMethod', orderData.customerInfo.paymentMethod);
        
        // Customer info
        Object.keys(orderData.customerInfo).forEach(key => {
            if (key !== 'paymentDetails') {
                data.append(`customer_${key}`, orderData.customerInfo[key]);
            }
        });
        
        // Product details
        orderData.cart.forEach((item, index) => {
            data.append(`product_${index}_name`, item.name);
            data.append(`product_${index}_price`, item.price);
            data.append(`product_${index}_quantity`, item.quantity || 1);
            data.append(`product_${index}_metal`, item.metalType || '22K');
            data.append(`product_${index}_weight`, item.weight || 0);
            data.append(`product_${index}_savings`, item.savings || 0);
        });
        
        // Price breakdown
        const pb = orderData.priceBreakdown;
        data.append('goldValue', pb.goldValue);
        data.append('makingCharges', pb.makingCharges);
        data.append('cgst', pb.cgst);
        data.append('sgst', pb.sgst);
        data.append('totalGST', pb.totalGST);
        data.append('cartTotal', pb.cartTotal);
        data.append('totalSavings', pb.totalSavings);
        
        // Add Aadhaar (masked for security)
        const maskedAadhaar = orderData.customerInfo.aadhaar ? 
            `XXXX-XXXX-${orderData.customerInfo.aadhaar.slice(-4)}` : 'Not provided';
        data.append('aadhaar_masked', maskedAadhaar);
        
        return data;
    }
    
    async function sendToGoogleSheets(data) {
        // Google Apps Script Web App URL
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyhdJzk91vbMOrzqRIa2O4IXRMfneDhYT9utcYaYZD2PPE8jwD3wTZNtZrj92YDX6XuLg/exec';
    
        try {
            // Create URL parameters (simple form data)
            const params = new URLSearchParams();
    
            // Add basic order info
            params.append('orderId', orderData.orderId);
            params.append('timestamp', orderData.timestamp);
            params.append('totalAmount', orderData.priceBreakdown.cartTotal);
            params.append('paymentMethod', orderData.customerInfo.paymentMethod);
    
            // Add customer info
            params.append('customerName', orderData.customerInfo.name);
            params.append('customerPhone', orderData.customerInfo.phone);
            params.append('customerEmail', orderData.customerInfo.email);
            params.append('customerAddress', orderData.customerInfo.address);
            params.append('customerPincode', orderData.customerInfo.pincode);
            params.append('customerAadhaar', orderData.customerInfo.aadhaar || '');
    
            // Add price breakdown
            const pb = orderData.priceBreakdown;
            params.append('goldValue', pb.goldValue);
            params.append('makingCharges', pb.makingCharges);
            params.append('cgst', pb.cgst);
            params.append('sgst', pb.sgst);
            params.append('totalGST', pb.totalGST);
            params.append('cartTotal', pb.cartTotal);
            params.append('totalSavings', pb.totalSavings);
    
            // Add products
            orderData.cart.forEach((item, index) => {
                params.append(`product_${index}_name`, item.name);
                params.append(`product_${index}_price`, item.price);
                params.append(`product_${index}_quantity`, item.quantity || 1);
                params.append(`product_${index}_metal`, item.metalType || '22K');
                params.append(`product_${index}_weight`, item.weight || '');
                params.append(`product_${index}_savings`, item.savings || 0);
            });
    
            // Send as simple form POST
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });
    
            // Check for success
            const resultText = await response.text();
            console.log('Google Sheets response:', resultText);
    
            if (resultText.startsWith('SUCCESS')) {
                // Extract order ID and invoice URL from response
                const parts = resultText.split(':');
                const orderId = parts[1] || orderData.orderId;
                const invoiceUrl = parts[2] || '';
    
                // Store invoice URL in localStorage
                if (invoiceUrl && !invoiceUrl.includes('failed')) {
                    localStorage.setItem(`invoice_${orderId}`, invoiceUrl);
    
                    // Show success with invoice link
                    showNotification(
                        `Order ${orderId} confirmed! Invoice: <a href="${invoiceUrl}" target="_blank">Download PDF</a>`,
                        'success'
                    );
                } else {
                    showNotification(`Order ${orderId} confirmed!`, 'success');
                }
    
                return true;
            } else {
                throw new Error(resultText);
            }
    
        } catch (error) {
            console.error('Google Sheets error:', error);
    
            // Fallback: Save to localStorage for later sync
            const pendingOrders = JSON.parse(localStorage.getItem('aaliPendingOrders') || '[]');
            pendingOrders.push({
                orderId: orderData.orderId,
                data: Array.from(params.entries()),
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('aaliPendingOrders', JSON.stringify(pendingOrders));
    
            showNotification('Order saved offline. Will sync when online.', 'info');
            return true; // Return true for offline mode
        }
    }
    function saveOrderLocally() {
        const orders = JSON.parse(localStorage.getItem('aaliOrders') || '[]');
        orders.push(orderData);
        localStorage.setItem('aaliOrders', JSON.stringify(orders));
    }
    
    function clearCart() {
        if (window.AaliCart && window.AaliCart.clearCartAfterOrder) {
            // Use global cart system
            window.AaliCart.clearCartAfterOrder();
        } else {
            localStorage.removeItem('aaliGlobalCart');
        }
        
        // Update cart count
        updateCartCount();
    }
    
    function showSuccessModal() {
        // Update modal with order details
        document.getElementById('orderIdDisplay').textContent = orderData.orderId;
        document.getElementById('orderDateDisplay').textContent = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        document.getElementById('orderTotalDisplay').textContent = 
            formatIndianRupee(orderData.priceBreakdown.cartTotal);
        
        // Show modal
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    async function generateProfessionalInvoice() {
        const loadingText = downloadInvoiceBtn.innerHTML;
        downloadInvoiceBtn.disabled = true;
        downloadInvoiceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Set PDF properties
            pdf.setProperties({
                title: `Invoice ${orderData.orderId}`,
                subject: 'Jewelry Purchase Invoice',
                author: 'AALI GOLD JEWELZ',
                keywords: 'invoice, jewelry, gold, purchase'
            });
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;
            
            // ==================== HEADER ====================
            // Gold header background
            pdf.setFillColor(197, 160, 40); // Gold color
            pdf.rect(0, 0, pageWidth, 35, 'F');
            
            // Company name
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.text('AALI GOLD JEWELZ', pageWidth / 2, 15, { align: 'center' });
            
            // Company info
            pdf.setFontSize(9);
            pdf.text('4th line Syamala Nagar-Guntur, Guntur District, AP 522006', pageWidth / 2, 22, { align: 'center' });
            pdf.text('Phone: +91 8634611770 | Email: info@aaligoldjewelz.com', pageWidth / 2, 27, { align: 'center' });
            
            yPosition = 40;
            
            // Invoice title
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('TAX INVOICE', pageWidth / 2, yPosition, { align: 'center' });
            
            yPosition += 10;
            
            // ==================== INVOICE & CUSTOMER DETAILS ====================
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            
            // Left column - Invoice details box
            pdf.setDrawColor(197, 160, 40);
            pdf.setLineWidth(0.5);
            pdf.rect(margin, yPosition, contentWidth/2 - 5, 40);
            
            pdf.setFont('helvetica', 'bold');
            pdf.text('INVOICE DETAILS', margin + 5, yPosition + 6);
            pdf.setFont('helvetica', 'normal');
            
            pdf.text(`Invoice No: ${orderData.orderId}`, margin + 5, yPosition + 15);
            pdf.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, margin + 5, yPosition + 20);
            pdf.text(`Order Date: ${new Date(orderData.timestamp).toLocaleDateString('en-IN')}`, margin + 5, yPosition + 25);
            pdf.text(`GSTIN: 37AABCA1234M1Z5`, margin + 5, yPosition + 30);
            
            // Right column - Customer details box
            const customer = orderData.customerInfo;
            const customerX = pageWidth/2 + 5;
            pdf.rect(customerX, yPosition, contentWidth/2 - 5, 40);
            
            pdf.setFont('helvetica', 'bold');
            pdf.text('BILL TO:', customerX + 5, yPosition + 6);
            pdf.setFont('helvetica', 'normal');
            
            // Handle long customer name
            const customerName = customer.name;
            if (customerName.length > 30) {
                pdf.text(customerName.substring(0, 30), customerX + 5, yPosition + 15);
                pdf.text(customerName.substring(30), customerX + 5, yPosition + 20);
                yPosition += 5;
            } else {
                pdf.text(customerName, customerX + 5, yPosition + 15);
            }
            
            // Handle long address
            const addressLines = splitTextToLines(customer.address, 40);
            let addressY = yPosition + 20;
            addressLines.forEach(line => {
                pdf.text(line, customerX + 5, addressY);
                addressY += 5;
            });
            
            pdf.text(`Pincode: ${customer.pincode}`, customerX + 5, addressY);
            pdf.text(`Phone: ${customer.phone}`, customerX + 5, addressY + 5);
            
            yPosition += 50;
            
            // ==================== PRODUCT TABLE ====================
            // Table header
            pdf.setFillColor(240, 240, 240);
            pdf.rect(margin, yPosition, contentWidth, 8, 'F');
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            
            // Column positions (optimized for content)
            const col1 = margin + 2;      // Description
            const col2 = margin + 75;     // Metal & Weight
            const col3 = margin + 105;    // Qty
            const col4 = margin + 120;    // Rate
            const col5 = margin + 150;    // Amount
            
            pdf.text('Description', col1, yPosition + 6);
            pdf.text('Details', col2, yPosition + 6);
            pdf.text('Qty', col3, yPosition + 6);
            pdf.text('Rate', col4, yPosition + 6);
            pdf.text('Amount', col5, yPosition + 6);
            
            yPosition += 12;
            
            // Table rows
            pdf.setFont('helvetica', 'normal');
            let tableYStart = yPosition;
            
            orderData.cart.forEach((item, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 80) {
                    pdf.addPage();
                    yPosition = margin;
                    
                    // Redraw table header on new page
                    pdf.setFillColor(240, 240, 240);
                    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
                    pdf.setTextColor(0, 0, 0);
                    pdf.setFontSize(9);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('Description', col1, yPosition + 6);
                    pdf.text('Details', col2, yPosition + 6);
                    pdf.text('Qty', col3, yPosition + 6);
                    pdf.text('Rate', col4, yPosition + 6);
                    pdf.text('Amount', col5, yPosition + 6);
                    yPosition += 12;
                }
                
                const metalType = item.metalType || '22K';
                const weight = item.weight || '-';
                const quantity = item.quantity || 1;
                const price = item.price;
                const total = price * quantity;
                
                // Item name (split if too long)
                const itemLines = splitTextToLines(item.name, 30);
                itemLines.forEach((line, lineIndex) => {
                    pdf.text(line, col1, yPosition + (lineIndex * 5));
                });
                
                // Metal and weight details
                pdf.text(`${metalType.toUpperCase()}`, col2, yPosition);
                if (weight) {
                    pdf.text(`${weight}g`, col2, yPosition + 5);
                }
                
                // Quantity, Rate, and Amount
                pdf.text(quantity.toString(), col3, yPosition);
                pdf.text(formatIndianRupee(price), col4, yPosition);
                pdf.text(formatIndianRupee(total), col5, yPosition);
                
                // Show savings if any
                if (item.savings && item.savings > 0) {
                    pdf.setFontSize(8);
                    pdf.setTextColor(39, 174, 96); // Green color
                    pdf.text(`Save: ${formatIndianRupee(item.savings)}`, col1, yPosition + 10);
                    pdf.setFontSize(9);
                    pdf.setTextColor(0, 0, 0);
                }
                
                yPosition += 15 + (itemLines.length - 1) * 5;
                
                // Add separator line between items
                if (index < orderData.cart.length - 1) {
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(0.1);
                    pdf.line(margin, yPosition - 2, margin + contentWidth, yPosition - 2);
                    yPosition += 5;
                }
            });
            
            // Draw table border
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.3);
            pdf.rect(margin, tableYStart - 12, contentWidth, yPosition - tableYStart + 12);
            
            yPosition += 10;
            
            // ==================== PRICE BREAKDOWN ====================
            // Price breakdown box
            pdf.setDrawColor(197, 160, 40);
            pdf.setLineWidth(0.5);
            pdf.rect(margin, yPosition, contentWidth, 80);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('PRICE BREAKDOWN', margin + 5, yPosition + 8);
            
            const pb = orderData.priceBreakdown;
            const breakdownY = yPosition + 20;
            const breakdownCol1 = margin + 20;
            const breakdownCol2 = margin + contentWidth - 20;
            
            pdf.setFont('helvetica', 'normal');
            
            // Gold/Metal Value
            pdf.text('Gold/Metal Value:', breakdownCol1, breakdownY);
            pdf.text(formatIndianRupee(pb.goldValue), breakdownCol2, breakdownY, { align: 'right' });
            
            // Making charges
            pdf.text('Making Charges:', breakdownCol1, breakdownY + 6);
            pdf.text(formatIndianRupee(pb.makingCharges), breakdownCol2, breakdownY + 6, { align: 'right' });
            
            // Subtotal line
            pdf.setDrawColor(150, 150, 150);
            pdf.setLineWidth(0.1);
            pdf.line(breakdownCol1, breakdownY + 9, breakdownCol2, breakdownY + 9);
            
            // GST Breakdown header
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            pdf.text('GST Breakdown (3%):', breakdownCol1, breakdownY + 15);
            
            // CGST
            pdf.text('CGST @1.5%:', breakdownCol1 + 10, breakdownY + 20);
            pdf.text(formatIndianRupee(pb.cgst), breakdownCol2, breakdownY + 20, { align: 'right' });
            
            // SGST
            pdf.text('SGST @1.5%:', breakdownCol1 + 10, breakdownY + 25);
            pdf.text(formatIndianRupee(pb.sgst), breakdownCol2, breakdownY + 25, { align: 'right' });
            
            // Total GST
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Total GST:', breakdownCol1, breakdownY + 31);
            pdf.text(formatIndianRupee(pb.totalGST), breakdownCol2, breakdownY + 31, { align: 'right' });
            
            // Total savings if any
            if (pb.totalSavings > 0) {
                pdf.setTextColor(39, 174, 96);
                pdf.text('Total Savings:', breakdownCol1, breakdownY + 38);
                pdf.text(`-${formatIndianRupee(pb.totalSavings)}`, breakdownCol2, breakdownY + 38, { align: 'right' });
                pdf.setTextColor(0, 0, 0);
            }
            
            // Final total
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.5);
            pdf.line(breakdownCol1, breakdownY + 45, breakdownCol2, breakdownY + 45);
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(197, 160, 40);
            pdf.text('TOTAL AMOUNT:', breakdownCol1, breakdownY + 55);
            pdf.text(formatIndianRupee(pb.cartTotal), breakdownCol2, breakdownY + 55, { align: 'right' });
            
            yPosition += 90;
            
            // ==================== AMOUNT IN WORDS & PAYMENT ====================
            // Amount in words box
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'italic');
            const amountInWords = ``;
            const amountLines = splitTextToLines(amountInWords, 70);
            
            amountLines.forEach((line, index) => {
                pdf.text(line, margin, yPosition + (index * 5));
            });
            
            yPosition += (amountLines.length * 5) + 5;
            
            // Payment method
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Payment Method: ${orderData.customerInfo.paymentMethod.toUpperCase()}`, margin, yPosition);
            
            yPosition += 10;
            
            // ==================== TERMS & CONDITIONS ====================
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Terms & Conditions:', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            
            const terms = [
                '1. Goods once sold cannot be returned or exchanged.',
                '2. Making charges are non-refundable.',
                '3. Hallmarking charges included in making charges.',
                '4. Price includes applicable GST.',
                '5. This is a computer-generated invoice. No signature required.'
            ];
            
            terms.forEach((term, index) => {
                pdf.text(term, margin, yPosition + 8 + (index * 4));
            });
            
            // ==================== FOOTER ====================
            const footerY = pageHeight - 15;
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150);
            pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
            
            // Page number
            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            }
            
            // Save PDF with compression
            pdf.save(`Invoice_${orderData.orderId}.pdf`, {
                compression: true
            });
            
            showNotification('Invoice downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('PDF generation error:', error);
            showNotification('Failed to generate PDF. Please try again.', 'error');
        } finally {
            downloadInvoiceBtn.disabled = false;
            downloadInvoiceBtn.innerHTML = loadingText;
        }
    }
    
    // Utility Functions
    
    function splitTextToLines(text, maxChars) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length <= maxChars) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        
        if (currentLine) lines.push(currentLine);
        return lines;
    }
    
    function formatIndianRupee(amount) {
        // Remove commas and round to integer
        const num = Math.round(Number(amount) || 0);
        if (num === 0) return '₹0';
        
        // Format with Indian numbering system
        const numStr = num.toString();
        const lastThree = numStr.substring(numStr.length - 3);
        const otherNumbers = numStr.substring(0, numStr.length - 3);
        
        let formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
        if (otherNumbers !== '') {
            formatted += ',' + lastThree;
        } else {
            formatted = lastThree;
        }
        
        return '₹' + formatted;
    }
    
    function numberToWords(num) {
        // Handle zero
        if (num === 0) return 'Zero Rupees Only';
        
        // Arrays for number words
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const thousands = ['', 'Thousand', 'Lakh', 'Crore'];
        
        // Convert number to string and pad with zeros
        let numStr = num.toString();
        while (numStr.length % 3 !== 0) {
            numStr = '0' + numStr;
        }
        
        // Split into groups of 2 digits (Indian numbering system)
        const groups = [];
        for (let i = numStr.length; i > 0; i -= 2) {
            if (i === 1) {
                groups.unshift(numStr.substring(i - 1, i));
            } else {
                groups.unshift(numStr.substring(i - 2, i));
            }
        }
        
        // Process each group
        let words = '';
        
        for (let i = 0; i < groups.length; i++) {
            const group = parseInt(groups[i]);
            if (group === 0) continue;
            
            const groupWords = [];
            const hundreds = Math.floor(group / 100);
            const tensOnes = group % 100;
            
            // Hundreds
            if (hundreds > 0) {
                groupWords.push(ones[hundreds] + ' Hundred');
            }
            
            // Tens and Ones
            if (tensOnes > 0) {
                if (tensOnes < 10) {
                    groupWords.push(ones[tensOnes]);
                } else if (tensOnes < 20) {
                    groupWords.push(teens[tensOnes - 10]);
                } else {
                    const tensDigit = Math.floor(tensOnes / 10);
                    const onesDigit = tensOnes % 10;
                    groupWords.push(tens[tensDigit] + (onesDigit > 0 ? ' ' + ones[onesDigit] : ''));
                }
            }
            
            // Add thousand/lakh/crore suffix
            if (groupWords.length > 0) {
                const suffix = thousands[groups.length - 1 - i];
                if (suffix) {
                    groupWords.push(suffix);
                }
                words += groupWords.join(' ') + ' ';
            }
        }
        
        // Clean up and return
        words = words.trim();
        if (!words) return 'Zero Rupees Only';
        
        return words + ' Rupees Only';
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.checkout-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `checkout-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 
                    type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <p>${message}</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#checkout-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'checkout-notification-styles';
            style.textContent = `
                .checkout-notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    z-index: 2000;
                    animation: slideInRight 0.3s ease;
                    border-left: 4px solid #C5A028;
                    max-width: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .checkout-notification.error {
                    border-left-color: #ff4757;
                }
                
                .checkout-notification.success {
                    border-left-color: #27ae60;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 20px;
                }
                
                .notification-content i {
                    font-size: 1.5rem;
                    color: #C5A028;
                }
                
                .checkout-notification.error .notification-content i {
                    color: #ff4757;
                }
                
                .checkout-notification.success .notification-content i {
                    color: #27ae60;
                }
                
                .notification-content p {
                    margin: 0;
                    color: #333;
                    font-weight: 500;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    padding: 20px;
                    font-size: 1.2rem;
                    transition: color 0.3s;
                }
                
                .notification-close:hover {
                    color: #333;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
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
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
});



// Hamburger Menu Functionality
function setupHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.querySelector('.main-nav');
    const menuOverlay = document.getElementById('menuOverlay') || createMenuOverlay();
    const dropdowns = document.querySelectorAll('.dropdown');

    // Create menu overlay if it doesn't exist
    function createMenuOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.id = 'menuOverlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    // Toggle hamburger menu
    function toggleMenu() {
        hamburgerBtn.classList.toggle('active');
        mainNav.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    }

    // Toggle dropdown menu (for Collections)
    function toggleDropdown(dropdown) {
        const isActive = dropdown.classList.contains('active');
        
        // Close all other dropdowns
        dropdowns.forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('active');
            }
        });
        
        // Toggle the clicked dropdown
        dropdown.classList.toggle('active');
    }

    // Close all dropdowns
    function closeAllDropdowns() {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    // Event Listeners
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking overlay
    menuOverlay.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        mainNav.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        closeAllDropdowns();
    });

    // Handle dropdown toggles
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const dropdown = this.closest('.dropdown');
            toggleDropdown(dropdown);
        });
    });

    // Close menu when clicking links (except dropdown toggles)
    document.querySelectorAll('.main-nav a:not(.dropdown-toggle)').forEach(link => {
        link.addEventListener('click', function() {
            // Don't close menu for dropdown links
            if (!this.closest('.dropdown-content')) {
                hamburgerBtn.classList.remove('active');
                mainNav.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
                closeAllDropdowns();
            }
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hamburgerBtn.classList.remove('active');
            mainNav.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
            closeAllDropdowns();
        }
    });
}

// Initialize hamburger menu when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupHamburgerMenu();
});