// ======================================================
// AUTHENTICATION SYSTEM FOR AALI GOLD JEWELZ
// ======================================================

class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        // DOM Elements
        this.profileIcon = document.getElementById('profileIcon');
        this.authOverlay = document.getElementById('authOverlay');
        this.authClose = document.getElementById('authClose');
        this.accountPanel = document.getElementById('accountPanel');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Auth tabs and forms
        this.authTabs = document.querySelectorAll('.auth-tab');
        this.authForms = document.querySelectorAll('.auth-form');
        
        // Form elements
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        
        // Tab switching
        this.switchToRegisterLinks = document.querySelectorAll('.switch-to-register');
        this.switchToLoginLinks = document.querySelectorAll('.switch-to-login');
        
        // Account menu items
        this.accountMenuItems = document.querySelectorAll('.account-menu-item');
        this.accountSections = document.querySelectorAll('.account-content');
        
        // User data elements
        this.userNameElements = document.querySelectorAll('#userName, #accountName');
        this.userEmailElements = document.querySelectorAll('#userEmail, #accountEmail');
        this.userAvatar = document.getElementById('userAvatar');
        this.accountPhone = document.getElementById('accountPhone');
        this.memberSince = document.getElementById('memberSince');

        // Initialize
        this.checkLoginStatus();
        this.setupEventListeners();
    }

    checkLoginStatus() {
        const user = this.getCurrentUser();
        if (user) {
            this.showLoggedInState(user);
        } else {
            this.showLoggedOutState();
        }
    }

    getCurrentUser() {
        const userData = localStorage.getItem('aali_current_user');
        return userData ? JSON.parse(userData) : null;
    }

    saveCurrentUser(user) {
        localStorage.setItem('aali_current_user', JSON.stringify(user));
    }

    clearCurrentUser() {
        localStorage.removeItem('aali_current_user');
    }

    showLoggedInState(user) {
        // Update UI elements with user data
        this.userNameElements.forEach(el => el.textContent = user.name);
        this.userEmailElements.forEach(el => el.textContent = user.email);
        this.accountPhone.textContent = user.phone || '+91 9876543210';
        this.memberSince.textContent = this.formatDate(user.joinedDate);
        
        // Update avatar with initials
        const initials = this.getInitials(user.name);
        this.userAvatar.innerHTML = `<span style="font-size: 1.5rem; font-weight: 600;">${initials}</span>`;
        
        // Update profile icon
        this.profileIcon.innerHTML = '<i class="fas fa-user-circle"></i>';
        this.profileIcon.title = `Logged in as ${user.name}`;
    }

    showLoggedOutState() {
        // Reset profile icon
        this.profileIcon.innerHTML = '<i class="fas fa-user-circle"></i>';
        this.profileIcon.title = 'Sign In / Register';
        
        // Hide account panel
        this.accountPanel.classList.remove('active');
        
        // Ensure body scrolling is restored
        this.restoreBodyScrolling();
    }

    getInitials(name) {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    }

    setupEventListeners() {
        // Profile icon click
        if (this.profileIcon) {
            this.profileIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const user = this.getCurrentUser();
                if (user) {
                    // User is logged in - show account panel
                    this.toggleAccountPanel();
                } else {
                    // User is not logged in - show auth overlay
                    this.showAuthOverlay('login');
                }
            });
        }

        // Close auth overlay
        if (this.authClose) {
            this.authClose.addEventListener('click', () => {
                this.hideAuthOverlay();
            });
        }

        // Close auth overlay when clicking outside
        if (this.authOverlay) {
            this.authOverlay.addEventListener('click', (e) => {
                if (e.target === this.authOverlay) {
                    this.hideAuthOverlay();
                }
            });
        }

        // Close account panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.accountPanel.classList.contains('active') && 
                !this.profileIcon.contains(e.target) && 
                !this.accountPanel.contains(e.target)) {
                this.closeAccountPanel();
            }
        });

        // Auth tab switching
        this.authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });

        // Switch to register form
        this.switchToRegisterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchAuthTab('register');
            });
        });

        // Switch to login form
        this.switchToLoginLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchAuthTab('login');
            });
        });

        // Login form submission
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form submission
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Account menu navigation
        this.accountMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchAccountSection(section);
                
                // Update active state
                this.accountMenuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Logout button
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Forgot password
        const forgotPassword = document.getElementById('forgotPassword');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // Social login buttons
        document.querySelectorAll('.social-btn.google').forEach(btn => {
            btn.addEventListener('click', () => this.handleSocialLogin('google'));
        });

        document.querySelectorAll('.social-btn.facebook').forEach(btn => {
            btn.addEventListener('click', () => this.handleSocialLogin('facebook'));
        });

        // Panel close button - ADD THIS
        const panelCloseBtn = document.getElementById('panelClose');
        if (panelCloseBtn) {
            panelCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeAccountPanel();
            });
        }
    }

    toggleAccountPanel() {
        const isOpen = this.accountPanel.classList.toggle('active');

        if (isOpen) {
            this.disableBodyScrolling();
        } else {
            this.restoreBodyScrolling();
        }
    }

    closeAccountPanel() {
        this.accountPanel.classList.remove('active');
        this.restoreBodyScrolling();
    }

    showAuthOverlay(tab = 'login') {
        this.authOverlay.classList.add('active');
        this.disableBodyScrolling();
        this.switchAuthTab(tab);
    }

    hideAuthOverlay() {
        this.authOverlay.classList.remove('active');
        this.restoreBodyScrolling();
    }

    disableBodyScrolling() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
    }

    restoreBodyScrolling() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        
        // Force reflow for mobile browsers
        setTimeout(() => {
            document.body.style.overflow = 'auto';
            window.scrollTo(0, window.scrollY);
        }, 10);
    }

    switchAuthTab(tabName) {
        // Update tabs
        this.authTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update forms
        this.authForms.forEach(form => {
            form.classList.toggle('active', form.dataset.tab === tabName);
        });
    }

    switchAccountSection(sectionId) {
        this.accountSections.forEach(section => {
            section.classList.toggle('active', section.id === `${sectionId}Section`);
        });
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Basic validation
        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // In a real app, this would be an API call
        // For demo purposes, we'll simulate a successful login
        const mockUser = {
            id: 1,
            name: 'John Doe',
            email: email,
            phone: '+91 9876543210',
            joinedDate: new Date().toISOString(),
            isGuest: false
        };

        // Save user data
        this.saveCurrentUser(mockUser);
        
        // Update UI
        this.showLoggedInState(mockUser);
        this.hideAuthOverlay();
        
        // Show success message
        this.showNotification('Successfully logged in!', 'success');
        
        // Clear form
        this.loginForm.reset();
    }

    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Validation
        if (!name || !email || !phone || !password || !confirmPassword) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // Create user object
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            joinedDate: new Date().toISOString(),
            isGuest: false
        };

        // Save user data
        this.saveCurrentUser(newUser);
        
        // Update UI
        this.showLoggedInState(newUser);
        this.hideAuthOverlay();
        
        // Show success message
        this.showNotification('Account created successfully!', 'success');
        
        // Clear form
        this.registerForm.reset();
        
        // Switch to login tab for next time
        this.switchAuthTab('login');
    }

    handleLogout() {
        // Clear user data
        this.clearCurrentUser();
        
        // Update UI
        this.showLoggedOutState();
        
        // Close account panel
        this.closeAccountPanel();
        
        // Show logout message
        this.showNotification('Successfully logged out', 'success');
    }

    handleForgotPassword() {
        const email = prompt('Please enter your email address to reset your password:');
        
        if (email) {
            // In a real app, this would send a reset email
            this.showNotification('Password reset instructions sent to your email', 'success');
        }
    }

    handleSocialLogin(provider) {
        // In a real app, this would integrate with OAuth providers
        // For demo, we'll create a mock user
        const mockUser = {
            id: Date.now(),
            name: provider === 'google' ? 'Google User' : 'Facebook User',
            email: `${provider}.user@example.com`,
            phone: '+91 9876543210',
            joinedDate: new Date().toISOString(),
            isGuest: false,
            provider: provider
        };

        // Save user data
        this.saveCurrentUser(mockUser);
        
        // Update UI
        this.showLoggedInState(mockUser);
        this.hideAuthOverlay();
        
        // Show success message
        this.showNotification(`Logged in with ${provider}`, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.auth-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #27ae60, #219653)' : 
                         type === 'error' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 
                         'linear-gradient(135deg, #3498db, #2980b9)'};
            color: white;
            padding: 15px 25px;
            border-radius: var(--border-radius);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1400;
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.AaliAuth = new AuthSystem();
});

// Add CSS for notifications
const authStyles = document.createElement('style');
authStyles.textContent = `
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
`;
document.head.appendChild(authStyles);