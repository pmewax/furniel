// Blog page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация корзины
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();
    
    // Кнопка поиска
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const searchClose = document.getElementById('searchClose');
    
    if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', function() {
            searchModal.style.display = 'flex';
            document.getElementById('searchInput').focus();
        });
        
        searchClose.addEventListener('click', function() {
            searchModal.style.display = 'none';
        });
    }
    
    // Поиск в сайдбаре
    const sidebarSearch = document.getElementById('sidebarSearch');
    
    if (sidebarSearch) {
        const performSearch = () => {
            const searchTerm = sidebarSearch.value.trim();
            if (searchTerm) {
                filterArticlesBySearch(searchTerm);
            } else {
                // Показать все статьи если поиск пустой
                showAllArticles();
            }
        };
        
        sidebarSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Поиск при изменении значения
        sidebarSearch.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            if (searchTerm.length >= 2) {
                filterArticlesBySearch(searchTerm);
            } else if (searchTerm.length === 0) {
                showAllArticles();
            }
        });
    }
    
    // Поиск в модальном окне
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            const searchResults = document.getElementById('searchResults');
            
            if (searchTerm.length > 2) {
                const results = getSearchResults(searchTerm);
                displaySearchResults(results);
            } else {
                searchResults.innerHTML = '<div class="search-result-item">Введите минимум 3 символа</div>';
            }
        });
    }
    
    function getSearchResults(searchTerm) {
        const articles = [
            {
                title: 'Топ-10 трендов в дизайне интерьеров 2024',
                url: 'article-detail.html',
                category: 'trends'
            },
            {
                title: 'Как выбрать идеальный диван: полное руководство',
                url: 'article-detail-2.html',
                category: 'tips'
            },
            {
                title: 'Экологичные материалы в мебели: что выбрать в 2024 году',
                url: 'article-detail-3.html',
                category: 'materials'
            },
            {
                title: '10 идей для маленькой квартиры: как визуально расширить пространство',
                url: 'article-detail-4.html',
                category: 'tips'
            },
            {
                title: 'Скандинавский стиль: создаем уютный и функциональный интерьер',
                url: 'article-detail-5.html',
                category: 'design'
            },
            {
                title: 'Цветовые тренды 2024: какие оттенки будут в моде',
                url: 'article-detail-6.html',
                category: 'trends'
            },
            {
                title: 'Искусство освещения: как свет преображает интерьер',
                url: 'article-detail-7.html',
                category: 'design'
            },
            {
                title: 'Текстиль в интерьере: создаем уют с помощью тканей',
                url: 'article-detail-8.html',
                category: 'design'
            }
        ];
        
        return articles.filter(article => 
            article.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    function displaySearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
            return;
        }
        
        searchResults.innerHTML = results.map(result => 
            `<div class="search-result-item" onclick="window.location.href='${result.url}'">${result.title}</div>`
        ).join('');
    }
    
    // Кнопка корзины - переход на страницу корзины
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
    }
    
    // Кнопка консультации по дизайну
    const designConsultBtn = document.getElementById('designConsultBtn');
    if (designConsultBtn) {
        designConsultBtn.addEventListener('click', function() {
            window.location.href = 'contacts.html';
        });
    }
    
    // Функция обновления счетчика корзины
    function updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', function(event) {
        if (event.target === searchModal) {
            searchModal.style.display = 'none';
        }
    });
    
    // Фильтрация статей по категориям
    const categoryFilter = document.getElementById('categoryFilter');
    const articleCards = document.querySelectorAll('.article-card');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            filterArticlesByCategory(selectedCategory);
        });
    }
    
    function filterArticlesByCategory(category) {
        let visibleCount = 0;
        
        articleCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
                visibleCount++;
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
        
        const categoryName = categoryFilter.options[categoryFilter.selectedIndex].text;
        showNotification(`Показаны статьи категории: ${categoryName} (${visibleCount})`, 'info');
    }
    
    // Фильтрация по клику на категории в сайдбаре
    const categoryLinks = document.querySelectorAll('.categories-list a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Удаляем активный класс у всех ссылок
            categoryLinks.forEach(l => l.classList.remove('active'));
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            const category = this.dataset.category;
            if (categoryFilter) {
                categoryFilter.value = category;
                filterArticlesByCategory(category);
            }
        });
    });
    
    // Кнопка "Показать еще"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let articlesLoaded = 8; // Уже загружено статей
    const totalArticles = 8; // Всего статей
    
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none'; // Скрываем кнопку, так как все статьи уже показаны
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (!validateEmail(email)) {
                showNotification('Пожалуйста, введите корректный email адрес', 'error');
                return;
            }
            
            // Симуляция отправки
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Отправка...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showNotification(`Спасибо за подписку! На адрес ${email} будут приходить новые статьи.`, 'success');
                this.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
    // Обработка кликов по тегам
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            const tagText = this.textContent.replace('#', '');
            filterArticlesByTag(tagText);
        });
    });
    
    // Функция фильтрации по тегу
    function filterArticlesByTag(tag) {
        const articleCards = document.querySelectorAll('.article-card');
        let visibleCount = 0;
        
        articleCards.forEach(card => {
            const title = card.querySelector('.article-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();
            const tags = card.dataset.tags ? card.dataset.tags.toLowerCase().split(',') : [];
            
            if (title.includes(tag.toLowerCase()) || 
                excerpt.includes(tag.toLowerCase()) || 
                tags.includes(tag.toLowerCase())) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
                visibleCount++;
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
        
        showNotification(`Найдено статей по тегу #${tag}: ${visibleCount}`, 'info');
    }
    
    // Функция поиска по статьям
    function filterArticlesBySearch(searchTerm) {
        const articleCards = document.querySelectorAll('.article-card');
        let visibleCount = 0;
        
        articleCards.forEach(card => {
            const title = card.querySelector('.article-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchTerm.toLowerCase()) || excerpt.includes(searchTerm.toLowerCase())) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
                visibleCount++;
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
        
        showNotification(`Найдено статей по запросу "${searchTerm}": ${visibleCount}`, 'info');
    }
    
    // Функция показа всех статей
    function showAllArticles() {
        const articleCards = document.querySelectorAll('.article-card');
        
        articleCards.forEach(card => {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        });
        
        showNotification('Показаны все статьи', 'info');
    }
    
    // Обработка кликов по ссылкам статей
    document.addEventListener('click', function(e) {
        const articleLink = e.target.closest('.article-title a, .read-more, .popular-article-content h4 a');
        
        if (articleLink && articleLink.href && articleLink.href.includes('article-detail')) {
            e.preventDefault();
            
            // Добавляем анимацию перехода
            document.body.style.opacity = '0.7';
            document.body.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                window.location.href = articleLink.href;
            }, 300);
        }
    });
    
    // Валидация email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        });
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Кнопка закрытия
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
        
        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Intersection Observer для анимаций при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Наблюдаем за элементами с анимациями
    document.querySelectorAll('.animate-fade-in-up').forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
    
    // Добавляем CSS для анимаций
    const style = document.createElement('style');
    style.textContent = `
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
        
        .article-card {
            transition: opacity 0.3s ease, transform 0.3s ease, display 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Инициализация при загрузке страницы
    initializePage();
    
    function initializePage() {
        // Проверяем параметры URL для фильтрации
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const tag = urlParams.get('tag');
        
        if (category && categoryFilter) {
            categoryFilter.value = category;
            filterArticlesByCategory(category);
            
            // Активируем соответствующую категорию в сайдбаре
            categoryLinks.forEach(link => {
                if (link.dataset.category === category) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        if (tag) {
            filterArticlesByTag(tag);
        }
        
        // Инициализация счетчика статей
        updateArticlesCount();
    }
    
    function updateArticlesCount() {
        const totalArticles = document.querySelectorAll('.article-card').length;
        const totalSpan = document.querySelector('.categories-list [data-category="all"] span');
        if (totalSpan) {
            totalSpan.textContent = totalArticles;
        }
        
        // Обновляем счетчики по категориям
        const categories = ['trends', 'tips', 'materials', 'design', 'care'];
        categories.forEach(category => {
            const count = document.querySelectorAll(`.article-card[data-category="${category}"]`).length;
            const categorySpan = document.querySelector(`.categories-list [data-category="${category}"] span`);
            if (categorySpan) {
                categorySpan.textContent = count;
            }
        });
    }
});