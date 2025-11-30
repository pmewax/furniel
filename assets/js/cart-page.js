// Логика страницы корзины
document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
});

function initializeCartPage() {
    loadCartItems();
    updateCartSummary();
    loadRecommendedProducts();
    
    // Обработчики событий
    document.getElementById('clearCart').addEventListener('click', clearCart);
    document.getElementById('applyPromo').addEventListener('click', applyPromoCode);
    document.getElementById('proceedToCheckout').addEventListener('click', proceedToCheckout);
    
    // Обновление при изменении корзины
    window.addEventListener('storage', function() {
        loadCartItems();
        updateCartSummary();
    });
}

function loadCartItems() {
    const container = document.getElementById('cartItemsList');
    const emptyCart = document.getElementById('emptyCart');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    if (emptyCart) emptyCart.style.display = 'none';
    
    let html = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <div class="cart-item-price">${item.price} ₽</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, 'decrease')">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, 'increase')">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">
                            Удалить
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">${itemTotal} ₽</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateCartSummary() {
    const itemsCount = cart.reduce((total, item) => total + item.quantity, 0);
    const itemsTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Расчет доставки
    const deliveryCost = itemsTotal >= 10000 ? 0 : 500;
    const totalCost = itemsTotal + deliveryCost;
    
    document.getElementById('itemsCount').textContent = itemsCount;
    document.getElementById('itemsTotal').textContent = `${itemsTotal} ₽`;
    document.getElementById('deliveryCost').textContent = deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`;
    document.getElementById('totalCost').textContent = `${totalCost} ₽`;
}

function clearCart() {
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
        cart = [];
        saveCart();
        loadCartItems();
        updateCartSummary();
        showNotification('Корзина очищена');
    }
}

function applyPromoCode() {
    const promoInput = document.getElementById('promoInput');
    const promoCode = promoInput.value.trim();
    
    if (!promoCode) {
        showNotification('Введите промокод');
        return;
    }
    
    // В реальном приложении здесь будет проверка промокода на сервере
    const validPromoCodes = {
        'WELCOME10': 0.1,
        'SUMMER15': 0.15,
        'FURNIEL20': 0.2
    };
    
    if (validPromoCodes[promoCode]) {
        const discount = validPromoCodes[promoCode];
        showNotification(`Промокод применен! Скидка ${discount * 100}%`);
        // Здесь будет логика применения скидки
    } else {
        showNotification('Неверный промокод');
    }
    
    promoInput.value = '';
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    // В реальном приложении здесь будет переход на страницу оформления заказа
    showNotification('Переход к оформлению заказа');
    // window.location.href = 'checkout.html';
}

function loadRecommendedProducts() {
    const container = document.getElementById('recommendedProducts');
    if (!container) return;
    
    // Показать случайные товары из каталога
    const recommended = [...products]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    
    if (recommended.length === 0) {
        container.innerHTML = '<p>Нет рекомендаций</p>';
        return;
    }
    
    let html = '';
    recommended.forEach(product => {
        html += `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">${product.price} ₽</span>
                    </div>
                    <div class="product-meta">
                        <span class="product-stock ${!product.inStock ? 'out-of-stock' : ''}">
                            ${product.inStock ? 'В наличии' : 'Нет в наличии'}
                        </span>
                        <button class="add-to-cart" 
                                data-id="${product.id}"
                                ${!product.inStock ? 'disabled' : ''}>
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Добавить обработчики для кнопок "В корзину"
    document.querySelectorAll('#recommendedProducts .add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
            showNotification('Товар добавлен в корзину');
        });
    });
}