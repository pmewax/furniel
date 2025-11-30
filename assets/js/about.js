// About page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.animate-fade-in-up, .animate-slide-in-left, .animate-slide-in-right');
    animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Close mobile menu when clicking on links
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
});
    document.addEventListener('DOMContentLoaded', function() {
        // Инициализация корзины
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        updateCartCount();
        
        // Кнопка поиска
        const searchBtn = document.getElementById('searchBtn');
        const searchModal = document.getElementById('searchModal');
        const searchClose = document.getElementById('searchClose');
        
        searchBtn.addEventListener('click', function() {
            searchModal.style.display = 'flex';
        });
        
        searchClose.addEventListener('click', function() {
            searchModal.style.display = 'none';
        });
        
        // Убрал функционал пользователя
        
        // Кнопка корзины - переход на страницу корзины
        const cartBtn = document.getElementById('cartBtn');
        
        cartBtn.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
        
        // Кнопка связи
        const contactBtn = document.getElementById('contactBtn');
        
        contactBtn.addEventListener('click', function() {
            window.location.href = 'contacts.html';
        });
        
        // Mobile menu functionality
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('active');
                this.classList.toggle('active');
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
            });
            
            // Close mobile menu when clicking on links
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                });
            });
        }
        
        // Функция обновления счетчика корзины
        function updateCartCount() {
            const cartCount = document.getElementById('cartCount');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
        
        // Закрытие модальных окон при клике вне их
        window.addEventListener('click', function(event) {
            if (event.target === searchModal) {
                searchModal.style.display = 'none';
            }
        });
        
        // Поиск товаров
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            
            // Очищаем результаты
            searchResults.innerHTML = '';
            
            if (query.length < 2) {
                return;
            }
            
            // Здесь должна быть логика поиска товаров
            // Временно используем заглушку
            const mockResults = [
                'Диван угловой "Милан"',
                'Кресло "Барселона"',
                'Стол обеденный "Токио"',
                'Стул "Венеция"',
                'Шкаф-купе "Осло"'
            ];
            
            const filteredResults = mockResults.filter(item => 
                item.toLowerCase().includes(query)
            );
            
            if (filteredResults.length > 0) {
                filteredResults.forEach(result => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.textContent = result;
                    item.addEventListener('click', function() {
                        // Здесь должна быть логика перехода к товару
                        alert(`Переход к товару: ${result}`);
                        searchModal.style.display = 'none';
                    });
                    searchResults.appendChild(item);
                });
            } else {
                const noResults = document.createElement('div');
                noResults.className = 'search-result-item';
                noResults.textContent = 'Товары не найдены';
                searchResults.appendChild(noResults);
            }
        });
    });