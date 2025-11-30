// =============================================
// HEADER FUNCTIONALITY - COMPLETE & BEAUTIFUL
// =============================================

class BeautifulHeader {
    constructor() {
        this.init();
    }

    init() {
        console.log('🎨 Beautiful Header initialized');
        
        // Cache elements
        this.cacheElements();
        
        // State
        this.cartItems = 0;
        this.searchData = [];
        this.isMobileMenuOpen = false;
        this.isSearchOpen = false;
        
        // Initialize everything
        this.initializeComponents();
        
        console.log('✅ Beautiful Header ready');
    }

    cacheElements() {
        // Mobile menu
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        this.mobileMenuPanel = document.getElementById('mobileMenuPanel');
        this.mobileMenuClose = document.getElementById('mobileMenuClose');
        
        // Search
        this.searchBtn = document.getElementById('searchBtn');
        this.searchModal = document.getElementById('searchModal');
        this.searchClose = document.getElementById('searchClose');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        
        // Cart
        this.cartCount = document.getElementById('cartCount');
        this.mobileCartCount = document.getElementById('mobileCartCount');
        this.mobileCartBadge = document.getElementById('mobileCartBadge');
        
        // Navigation
        this.desktopNav = document.querySelector('.desktop-nav');
        this.mobileNav = document.querySelector('.mobile-nav');
    }

    initializeComponents() {
        this.bindEvents();
        this.bindNavigation();
        this.loadCart();
        this.loadSearchData();
        this.setupScrollEffect();
        this.applyLayoutFixes();
    }

    bindEvents() {
        this.bindMobileMenu();
        this.bindSearch();
        this.bindGlobalEvents();
    }

    bindMobileMenu() {
        // Open mobile menu
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openMobileMenu();
            });
        }
        
        // Close mobile menu
        if (this.mobileMenuClose) {
            this.mobileMenuClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
            });
        }
        
        // Close on overlay click
        if (this.mobileMenuOverlay) {
            this.mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === this.mobileMenuOverlay) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    bindSearch() {
        // Open search
        if (this.searchBtn && this.searchModal) {
            this.searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openSearch();
            });
        }
        
        // Close search
        if (this.searchClose) {
            this.searchClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeSearch();
            });
        }
        
        // Close on overlay click
        if (this.searchModal) {
            this.searchModal.addEventListener('click', (e) => {
                if (e.target === this.searchModal) {
                    this.closeSearch();
                }
            });
        }
        
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeSearch();
                if (e.key === 'Enter') this.performSearch(this.searchInput.value);
            });
        }
    }

    bindGlobalEvents() {
        // Escape key to close everything
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isMobileMenuOpen) this.closeMobileMenu();
                if (this.isSearchOpen) this.closeSearch();
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && 
                !this.mobileMenuPanel.contains(e.target) && 
                e.target !== this.mobileMenuBtn) {
                this.closeMobileMenu();
            }
        });
    }

    bindNavigation() {
        console.log('🔗 Setting up beautiful navigation...');
        
        // Desktop navigation
        const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
        desktopLinks.forEach(link => {
            this.setupNavigationLink(link, 'desktop');
        });
        
        // Mobile navigation
        const mobileLinks = document.querySelectorAll('.mobile-nav .mobile-nav-link');
        mobileLinks.forEach(link => {
            this.setupNavigationLink(link, 'mobile');
        });
        
        console.log(`✅ Navigation: ${desktopLinks.length} desktop + ${mobileLinks.length} mobile links`);
    }

    setupNavigationLink(link, type) {
        // Remove existing and clone for clean state
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Add beautiful click handler
        newLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const href = newLink.getAttribute('href');
            const pageName = newLink.textContent.trim();
            
            console.log(`🎯 ${type.toUpperCase()} NAV: ${pageName}`);
            
            // Visual feedback
            this.animateClick(newLink);
            
            // Close mobile menu if needed
            if (type === 'mobile') {
                this.closeMobileMenu();
            }
            
            // Navigate after animation
            setTimeout(() => {
                if (href && href !== '#' && !href.includes('javascript:')) {
                    window.location.href = href;
                }
            }, 150);
        });
        
        // Add hover effects
        newLink.addEventListener('mouseenter', () => {
            newLink.style.transform = 'translateY(-2px)';
        });
        
        newLink.addEventListener('mouseleave', () => {
            newLink.style.transform = 'translateY(0)';
        });
    }

    animateClick(element) {
        element.style.transform = 'translateY(1px) scale(0.98)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    applyLayoutFixes() {
        // Ensure proper layout
        if (this.desktopNav) {
            this.desktopNav.style.display = 'flex';
            this.desktopNav.style.justifyContent = 'center';
            this.desktopNav.style.flex = '1';
            this.desktopNav.style.maxWidth = '500px';
            this.desktopNav.style.margin = '0 auto';
        }
    }

    openMobileMenu() {
        console.log('📱 Opening mobile menu');
        
        if (this.mobileMenuOverlay) this.mobileMenuOverlay.classList.add('active');
        if (this.mobileMenuPanel) this.mobileMenuPanel.classList.add('active');
        if (this.mobileMenuBtn) this.mobileMenuBtn.classList.add('active');
        
        document.body.classList.add('no-scroll');
        this.isMobileMenuOpen = true;
        
        this.updateMobileCartInfo();
    }

    closeMobileMenu() {
        console.log('📱 Closing mobile menu');
        
        if (this.mobileMenuOverlay) this.mobileMenuOverlay.classList.remove('active');
        if (this.mobileMenuPanel) this.mobileMenuPanel.classList.remove('active');
        if (this.mobileMenuBtn) this.mobileMenuBtn.classList.remove('active');
        
        document.body.classList.remove('no-scroll');
        this.isMobileMenuOpen = false;
    }

    openSearch() {
        console.log('🔍 Opening search');
        
        if (this.searchModal) this.searchModal.classList.add('active');
        
        document.body.classList.add('no-scroll');
        this.isSearchOpen = true;
        
        // Focus input
        setTimeout(() => {
            if (this.searchInput) {
                this.searchInput.focus();
                this.searchInput.select();
            }
        }, 300);
    }

    closeSearch() {
        console.log('🔍 Closing search');
        
        if (this.searchModal) this.searchModal.classList.remove('active');
        
        document.body.classList.remove('no-scroll');
        this.isSearchOpen = false;
        
        // Clear search
        if (this.searchInput) this.searchInput.value = '';
        this.clearSearchResults();
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }
        
        const results = this.searchData.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );
        
        this.displaySearchResults(results);
    }

    performSearch(query) {
        if (!query.trim()) return;
        console.log(`🔍 Performing search: ${query}`);
        this.handleSearch(query);
    }

    displaySearchResults(results) {
        if (!this.searchResults) return;
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results">
                    <p>Товары не найдены</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Попробуйте изменить запрос</p>
                </div>
            `;
            return;
        }
        
        this.searchResults.innerHTML = results.map(item => `
            <div class="search-result-item" data-id="${item.id}">
                <div class="search-item-content">
                    <div class="search-item-title">${item.title}</div>
                    <div class="search-item-category">${item.category}</div>
                </div>
                <div class="search-item-price">${this.formatPrice(item.price)}</div>
                <div class="search-item-arrow">→</div>
            </div>
        `).join('');
        
        // Add click handlers to results
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const productId = item.getAttribute('data-id');
                this.navigateToProduct(productId);
            });
        });
    }

    clearSearchResults() {
        if (this.searchResults) {
            this.searchResults.innerHTML = '';
        }
    }

    navigateToProduct(productId) {
        console.log(`🛒 Navigating to product ${productId}`);
        this.closeSearch();
        // window.location.href = `product.html?id=${productId}`;
    }

    loadCart() {
        // Load cart from localStorage
        try {
            const savedCart = localStorage.getItem('furniel_cart');
            this.cartItems = savedCart ? JSON.parse(savedCart).length : 0;
        } catch (error) {
            console.error('Error loading cart:', error);
            this.cartItems = 0;
        }
        
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        // Header badge
        if (this.cartCount) {
            this.cartCount.textContent = this.cartItems;
            this.cartCount.style.display = this.cartItems > 0 ? 'flex' : 'none';
        }
        
        // Mobile cart info
        this.updateMobileCartInfo();
    }

    updateMobileCartInfo() {
        if (this.mobileCartCount) {
            this.mobileCartCount.textContent = this.cartItems === 0 ? 
                'Корзина пуста' : 
                `${this.cartItems} ${this.getCartItemsWord(this.cartItems)}`;
        }
        
        if (this.mobileCartBadge) {
            this.mobileCartBadge.textContent = this.cartItems;
            this.mobileCartBadge.style.display = this.cartItems > 0 ? 'flex' : 'none';
        }
    }

    getCartItemsWord(count) {
        if (count === 1) return 'товар';
        if (count < 5) return 'товара';
        return 'товаров';
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    loadSearchData() {
        // Mock search data
        this.searchData = [
            { id: 1, title: 'Диван угловой "Милан"', category: 'Диваны', price: 45900 },
            { id: 2, title: 'Кресло офисное "Комфорт"', category: 'Кресла', price: 12500 },
            { id: 3, title: 'Стол обеденный "Сканди"', category: 'Столы', price: 23400 },
            { id: 4, title: 'Стул "Эргономик"', category: 'Стулья', price: 8900 },
            { id: 5, title: 'Шкаф "Простор"', category: 'Шкафы', price: 67900 }
        ];
    }

    setupScrollEffect() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 50;
            header.classList.toggle('scrolled', scrolled);
        });
        
        // Initial check
        header.classList.toggle('scrolled', window.scrollY > 50);
    }

    // Public API
    addToCart(product) {
        this.cartItems += product.quantity || 1;
        this.updateCartDisplay();
        console.log(`🛒 Added to cart: ${product.title}`);
    }

    updateCart(count) {
        this.cartItems = count;
        this.updateCartDisplay();
    }

    debug() {
        console.log('🔍 HEADER DEBUG:');
        console.log('- Mobile Menu:', this.isMobileMenuOpen);
        console.log('- Search:', this.isSearchOpen);
        console.log('- Cart Items:', this.cartItems);
        console.log('- Desktop Links:', document.querySelectorAll('.desktop-nav .nav-link').length);
        console.log('- Mobile Links:', document.querySelectorAll('.mobile-nav .mobile-nav-link').length);
    }
}

// =============================================
// INITIALIZATION & FALLBACK SYSTEM
// =============================================

window.furnielHeader = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 DOM Ready - Initializing Beautiful Header');
    
    try {
        window.furnielHeader = new BeautifulHeader();
        console.log('✅ Beautiful Header initialized successfully');
    } catch (error) {
        console.error('❌ Header init failed:', error);
        initializeEmergencyHeader();
    }
});

function initializeEmergencyHeader() {
    console.log('🔄 Emergency header initialization...');
    
    const maxAttempts = 5;
    let attempts = 0;
    
    const tryInit = () => {
        attempts++;
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const desktopNav = document.querySelector('.desktop-nav');
        
        if (mobileMenuBtn && desktopNav) {
            window.furnielHeader = new BeautifulHeader();
            return;
        }
        
        if (attempts >= maxAttempts) {
            console.error('❌ Emergency init failed');
            applyBruteForceFixes();
            return;
        }
        
        setTimeout(tryInit, 500);
    };
    
    tryInit();
}

function applyBruteForceFixes() {
    console.log('🚨 Applying brute force fixes');
    
    // Force all navigation links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
            link.onclick = function(e) {
                e?.preventDefault();
                window.location.href = href;
            };
        }
    });
    
    // Force mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuPanel = document.getElementById('mobileMenuPanel');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    if (mobileMenuBtn && mobileMenuPanel) {
        mobileMenuBtn.onclick = function(e) {
            e.preventDefault();
            mobileMenuOverlay?.classList.add('active');
            mobileMenuPanel.classList.add('active');
            document.body.classList.add('no-scroll');
        };
    }
    
    // Force search
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    
    if (searchBtn && searchModal) {
        searchBtn.onclick = function(e) {
            e.preventDefault();
            searchModal.classList.add('active');
            document.body.classList.add('no-scroll');
        };
    }
    
    console.log('✅ Brute force fixes applied');
}

// Global access
window.furniel = window.furniel || {};
window.furniel.header = {
    init: () => window.furnielHeader || new BeautifulHeader(),
    debug: () => window.furnielHeader?.debug(),
    addToCart: (product) => window.furnielHeader?.addToCart(product),
    updateCart: (count) => window.furnielHeader?.updateCart(count)
};

console.log('📦 Beautiful Header JS loaded');