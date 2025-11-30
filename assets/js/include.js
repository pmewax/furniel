// include.js - загрузка общих компонентов
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Loading includes...');
    
    // Load header
    loadComponent('header', 'header.html');
    
    // Load footer
    loadComponent('footer', 'footer.html');
});

function loadComponent(componentId, filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`${componentId} not found`);
            return response.text();
        })
        .then(data => {
            const container = document.getElementById(componentId);
            if (container) {
                container.innerHTML = data;
                console.log(`✅ ${componentId} loaded successfully`);
                
                // Инициализируем компоненты после загрузки
                if (componentId === 'header') {
                    // Даем время на обновление DOM перед инициализацией
                    setTimeout(initializeHeaderComponents, 50);
                }
            }
        })
        .catch(error => {
            console.error(`❌ Error loading ${componentId}:`, error);
            createFallbackComponent(componentId);
        });
}

function initializeHeaderComponents() {
    console.log('🚀 Initializing header components from include.js');
    
    // Инициализируем мобильное меню
    initializeMobileMenu();
}

function initializeMobileMenu() {
    console.log('📱 Initializing mobile menu from include.js...');
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuPanel = document.getElementById('mobileMenuPanel');
    const mobileMenuClose = document.getElementById('mobileMenuClose');

    console.log('📱 Mobile menu elements found:', {
        mobileMenuBtn: !!mobileMenuBtn,
        mobileMenuOverlay: !!mobileMenuOverlay,
        mobileMenuPanel: !!mobileMenuPanel,
        mobileMenuClose: !!mobileMenuClose
    });

    function openMobileMenu() {
        console.log('📱 Opening mobile menu');
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.add('active');
            console.log('✅ Overlay activated');
        }
        if (mobileMenuPanel) {
            mobileMenuPanel.classList.add('active');
            console.log('✅ Panel activated');
        }
        document.body.classList.add('no-scroll');
        console.log('✅ Body scroll locked');
    }

    function closeMobileMenu() {
        console.log('📱 Closing mobile menu');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
        if (mobileMenuPanel) mobileMenuPanel.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    // Обработчики мобильного меню
    if (mobileMenuBtn) {
        console.log('✅ Mobile menu button found, adding event listener');
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Mobile menu button CLICKED!');
            openMobileMenu();
        });
        
        // Добавляем тестовый обработчик для проверки
        mobileMenuBtn.addEventListener('touchstart', function(e) {
            console.log('📱 Touch event on mobile menu button');
        });
    } else {
        console.error('❌ Mobile menu button NOT FOUND!');
        // Выведем все кнопки для отладки
        const allButtons = document.querySelectorAll('button');
        console.log('All buttons on page:', allButtons);
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎯 Mobile menu close button clicked');
            closeMobileMenu();
        });
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === mobileMenuOverlay) {
                console.log('🎯 Mobile menu overlay clicked');
                closeMobileMenu();
            }
        });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            console.log('🎯 Escape key pressed');
            closeMobileMenu();
        }
    });

    console.log('✅ Mobile menu initialization complete');
}

function createFallbackComponent(componentId) {
    const container = document.getElementById(componentId);
    if (!container) return;
    
    if (componentId === 'header') {
        container.innerHTML = `
            <header class="header glass">
                <div class="container">
                    <div class="header-content">
                        <div class="logo">
                            <a href="index.html" class="logo-link">
                                <div class="logo-icon">🪑</div>
                                <h1>Furniel</h1>
                            </a>
                        </div>
                        <nav class="desktop-nav">
                            <a href="index.html" class="nav-link">Главная</a>
                            <a href="catalog.html" class="nav-link active">Каталог</a>
                            <a href="blog.html" class="nav-link">Блог</a>
                            <a href="about.html" class="nav-link">О нас</a>
                        </nav>
                        <div class="header-actions">
                            <button class="icon-btn search-btn" id="searchBtn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <a href="cart.html" class="icon-btn cart-btn" id="cartBtn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.1 15.9 4.5 17 5.4 17H17M17 17C16.5 17 16 18 16 18.5C16 19 16.5 19.5 17 19.5C17.5 19.5 18 19 18 18.5C18 18 17.5 17 17 17ZM9 18.5C9 19 8.5 19.5 8 19.5C7.5 19.5 7 19 7 18.5C7 18 7.5 17.5 8 17.5C8.5 17.5 9 18 9 18.5Z" 
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span class="cart-badge" id="cartCount">0</span>
                            </a>
                            <button class="mobile-menu-btn icon-btn" id="mobileMenuBtn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 12H21M3 6H21M3 18H21" 
                                          stroke="currentColor" stroke-width="2" 
                                          stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Mobile Menu Overlay -->
            <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>

            <!-- Mobile Menu Panel -->
            <div class="mobile-menu-panel" id="mobileMenuPanel">
                <div class="mobile-menu-header">
                    <div class="mobile-menu-logo">
                        <div class="logo-icon">🪑</div>
                        <h2>Furniel</h2>
                    </div>
                    <button class="mobile-menu-close" id="mobileMenuClose">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" 
                                  stroke="currentColor" stroke-width="2" 
                                  stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                
                <nav class="mobile-nav">
                    <a href="index.html" class="mobile-nav-link">
                        <span>Главная</span>
                    </a>
                    <a href="catalog.html" class="mobile-nav-link">
                        <span>Каталог</span>
                    </a>
                    <a href="blog.html" class="mobile-nav-link">
                        <span>Блог</span>
                    </a>
                    <a href="about.html" class="mobile-nav-link">
                        <span>О нас</span>
                    </a>
                </nav>
                
                <div class="mobile-menu-footer">
                    <div class="mobile-cart-info">
                        <div class="mobile-cart-text">
                            <strong>Корзина</strong>
                            <span>0 товаров</span>
                        </div>
                        <div class="mobile-cart-badge">0</div>
                    </div>
                    <a href="cart.html" class="btn btn-primary" style="width: 100%; text-align: center;">
                        Перейти в корзину
                    </a>
                </div>
            </div>
        `;
        
        // Инициализируем мобильное меню после создания fallback
        setTimeout(initializeMobileMenu, 100);
    } else if (componentId === 'footer') {
        container.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-main">
                        <div class="footer-brand">
                            <div class="logo">
                                <a href="index.html" class="logo-link">
                                    <div class="logo-icon">🪑</div>
                                    <h3>Furniel</h3>
                                </a>
                            </div>
                            <p class="footer-description">
                                Современная мебель для вашего дома. Создаем уют с 2020 года.
                            </p>
                            <div class="social-links">
                                <a href="#" class="social-link">📘</a>
                                <a href="#" class="social-link">📷</a>
                                <a href="#" class="social-link">🐦</a>
                            </div>
                        </div>
                        <div class="footer-links">
                            <div class="footer-column">
                                <h4>Магазин</h4>
                                <a href="catalog.html">Все товары</a>
                                <a href="catalog.html?category=sofas">Гостиная</a>
                                <a href="catalog.html?category=beds">Спальня</a>
                                <a href="catalog.html?category=chairs">Офис</a>
                            </div>
                            <div class="footer-column">
                                <h4>Поддержка</h4>
                                <a href="contacts.html">Контакты</a>
                                <a href="delivery.html">Доставка</a>
                                <a href="warranty.html">Гарантия</a>
                                <a href="returns.html">Возврат</a>
                            </div>
                            <div class="footer-column">
                                <h4>Компания</h4>
                                <a href="about.html">О нас</a>
                                <a href="blog.html">Блог</a>
                                <a href="careers.html">Карьера</a>
                                <a href="news.html">Новости</a>
                            </div>
                            <div class="footer-column">
                                <h4>Контакты</h4>
                                <div class="contact-info">
                                    <div class="contact-item">📞 +7 (999) 123-45-67</div>
                                    <div class="contact-item">✉️ info@furniel.ru</div>
                                    <div class="contact-item">📍 Москва, ул. Мебельная, 15</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <div class="footer-copyright">
                            © 2024 Furniel. Все права защищены.
                        </div>
                        <div class="footer-legal">
                            <a href="privacy.html">Конфиденциальность</a>
                            <a href="terms.html">Условия использования</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}
// Добавьте этот код в конец вашего include.js файла

// Ждем полной загрузки хедера и инициализируем все компоненты
function initializeHeaderAfterLoad() {
    console.log('🎯 Initializing header components after load...');
    
    // Ждем пока хедер полностью загрузится и отрендерится
    setTimeout(() => {
        // 1. Инициализируем мобильное меню
        initializeMobileMenu();
        
        // 2. Инициализируем поиск
        initializeSearch();
        
        // 3. Инициализируем корзину
        initializeCart();
        
        // 4. Инициализируем эффект скролла
        initializeScrollEffect();
        
        console.log('✅ All header components initialized!');
    }, 100);
}

// Функции инициализации компонентов хедера
function initializeMobileMenu() {
    console.log('📱 Initializing mobile menu...');
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuPanel = document.getElementById('mobileMenuPanel');
    const mobileMenuClose = document.getElementById('mobileMenuClose');

    if (!mobileMenuBtn) {
        console.error('❌ Mobile menu button not found!');
        return;
    }

    console.log('✅ Mobile menu elements found');

    function openMobileMenu() {
        console.log('🎯 Opening mobile menu');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
        if (mobileMenuPanel) mobileMenuPanel.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeMobileMenu() {
        console.log('🎯 Closing mobile menu');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
        if (mobileMenuPanel) mobileMenuPanel.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    // Обработчики событий
    mobileMenuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openMobileMenu();
    });

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
        });
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function initializeSearch() {
    console.log('🔍 Initializing search...');
    
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const searchClose = document.getElementById('searchClose');

    if (!searchBtn || !searchModal) {
        console.error('❌ Search elements not found');
        return;
    }

    function openSearch() {
        console.log('🎯 Opening search');
        searchModal.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeSearch() {
        console.log('🎯 Closing search');
        searchModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openSearch();
    });

    if (searchClose) {
        searchClose.addEventListener('click', function(e) {
            e.preventDefault();
            closeSearch();
        });
    }

    searchModal.addEventListener('click', function(e) {
        if (e.target === searchModal) {
            closeSearch();
        }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });
}

function initializeCart() {
    console.log('🛒 Initializing cart...');
    // Корзина уже инициализирована в main.js
    // Просто обновляем бейдж
    if (window.updateCartBadge) {
        updateCartBadge();
    }
}

function initializeScrollEffect() {
    console.log('📜 Initializing scroll effect...');
    
    const header = document.querySelector('.header');
    if (!header) return;

    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
}

// Модифицируем функцию loadComponent чтобы вызывать инициализацию после загрузки хедера
function loadComponent(componentId, filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`${componentId} not found`);
            return response.text();
        })
        .then(data => {
            const container = document.getElementById(componentId);
            if (container) {
                container.innerHTML = data;
                console.log(`✅ ${componentId} loaded successfully`);
                
                // Если загрузили хедер - инициализируем компоненты
                if (componentId === 'header') {
                    // Даем время на рендеринг DOM
                    setTimeout(initializeHeaderAfterLoad, 50);
                }
            }
        })
        .catch(error => {
            console.error(`❌ Error loading ${componentId}:`, error);
            createFallbackComponent(componentId);
            
            // Если это хедер - все равно инициализируем
            if (componentId === 'header') {
                setTimeout(initializeHeaderAfterLoad, 100);
            }
        });
}