// Основная логика приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация модальных окон
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const userBtn = document.getElementById('userBtn');
    const loginModal = document.getElementById('loginModal');
    const closeButtons = document.querySelectorAll('.close');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Открытие корзины
    if (cartBtn && cartModal) {
        cartBtn.addEventListener('click', function() {
            cartModal.style.display = 'block';
        });
    }
    
    // Открытие формы входа
    if (userBtn && loginModal) {
        userBtn.addEventListener('click', function() {
            loginModal.style.display = 'block';
        });
    }
    
    // Закрытие модальных окон
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // Оформление заказа
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Корзина пуста!');
                return;
            }
            
            // В реальном приложении здесь будет перенаправление на страницу оформления заказа
            showNotification('Переход к оформлению заказа!');
            // window.location.href = 'checkout.html';
        });
    }
    
    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Вход выполнен!');
            loginModal.style.display = 'none';
        });
    }
    
    // Поиск товаров
    const searchInput = document.querySelector('.search input');
    const searchButton = document.querySelector('.search-btn');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            const results = searchProducts(query);
            displayProducts('productsGrid', results);
        }
    }
});