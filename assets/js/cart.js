// cart.js - исправленная версия
class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        console.log('🛒 Cart manager initialized');
        this.loadCart();
        this.setupEventListeners();
        this.renderCart();
    }

    loadCart() {
        try {
            const savedCart = localStorage.getItem('furniel_cart');
            this.cart = savedCart ? JSON.parse(savedCart) : [];
            console.log('📦 Cart loaded:', this.cart.length, 'items');
        } catch (error) {
            console.error('❌ Error loading cart:', error);
            this.cart = [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('furniel_cart', JSON.stringify(this.cart));
            this.updateCartBadge();
        } catch (error) {
            console.error('❌ Error saving cart:', error);
        }
    }

    setupEventListeners() {
        // Очистка корзины
        const clearCartBtn = document.getElementById('clearCart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }

        // Оформление заказа
        const checkoutBtn = document.getElementById('proceedToCheckout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }
    }

    renderCart() {
        const container = document.getElementById('cartItems');
        const emptyState = document.getElementById('emptyCart');
        const clearCartBtn = document.getElementById('clearCart');
        const checkoutBtn = document.getElementById('proceedToCheckout');

        if (!container) return;

        if (this.cart.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            if (container) container.style.display = 'none';
            if (clearCartBtn) clearCartBtn.style.display = 'none';
            if (checkoutBtn) {
                checkoutBtn.disabled = true;
                checkoutBtn.style.opacity = '0.6';
            }
            this.updateCartSummary();
            return;
        }

        // Есть товары в корзине
        if (emptyState) emptyState.style.display = 'none';
        if (container) container.style.display = 'block';
        if (clearCartBtn) clearCartBtn.style.display = 'flex';
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
        }

        let html = '';
        this.cart.forEach((item, index) => {
            const total = item.price * item.quantity;
            
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-content">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image" 
                             onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
                        <div class="cart-item-details">
                            <h3 class="cart-item-title">${item.name}</h3>
                            <p class="cart-item-description">${item.description || 'Качественная мебель от производителя'}</p>
                            <div class="cart-item-controls">
                                <div class="quantity-controls">
                                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', -1)" 
                                            ${item.quantity <= 1 ? 'disabled' : ''}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                    </button>
                                    <span class="quantity-display">${item.quantity}</span>
                                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', 1)">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                    </button>
                                </div>
                                <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                                <button class="remove-item" onclick="cartManager.removeItem('${item.id}')">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6H5M5 6H21M5 6V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V6H5ZM8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" 
                                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        <div class="total-price">${this.formatPrice(total)}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        this.updateCartSummary();
    }

    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const delivery = subtotal > 10000 ? 0 : 500;
        const total = subtotal + delivery;

        const subtotalEl = document.getElementById('subtotal');
        const deliveryEl = document.getElementById('deliveryCost');
        const totalEl = document.getElementById('totalCost');

        if (subtotalEl) subtotalEl.textContent = this.formatPrice(subtotal);
        if (deliveryEl) {
            deliveryEl.textContent = delivery === 0 ? 'Бесплатно' : this.formatPrice(delivery);
        }
        if (totalEl) totalEl.textContent = this.formatPrice(total);
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity < 1) return;
            
            item.quantity = newQuantity;
            this.saveCart();
            this.renderCart();
            this.showNotification(`Количество изменено: ${newQuantity}`, 'success');
        }
    }

    removeItem(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (item && confirm(`Удалить "${item.name}" из корзины?`)) {
            this.cart = this.cart.filter(item => item.id !== productId);
            this.saveCart();
            this.renderCart();
            this.showNotification('Товар удален из корзины', 'success');
        }
    }

    clearCart() {
        if (this.cart.length === 0) {
            this.showNotification('Корзина уже пуста', 'info');
            return;
        }
        
        if (confirm('Очистить всю корзину? Это действие нельзя отменить.')) {
            this.cart = [];
            this.saveCart();
            this.renderCart();
            this.showNotification('Корзина очищена', 'success');
        }
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Корзина пуста', 'error');
            return;
        }

        const checkoutBtn = document.getElementById('proceedToCheckout');
        if (checkoutBtn) {
            const originalText = checkoutBtn.innerHTML;
            checkoutBtn.innerHTML = `
                <div class="loading-spinner"></div>
                <span>Переход к оформлению...</span>
            `;
            checkoutBtn.disabled = true;

            setTimeout(() => {
                // В реальном приложении здесь будет переход на страницу оформления заказа
                this.showNotification('Переход к оформлению заказа', 'info');
                // window.location.href = 'checkout.html';
                
                // Возвращаем исходное состояние кнопки
                checkoutBtn.innerHTML = originalText;
                checkoutBtn.disabled = false;
            }, 2000);
        }
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.renderCart();
        this.showNotification('Товар добавлен в корзину', 'success');
    }

    updateCartBadge() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const badges = document.querySelectorAll('.cart-badge, #cartCount');
        
        badges.forEach(badge => {
            if (badge) {
                badge.textContent = totalItems;
                badge.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        });
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    showNotification(message, type = 'success') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое скрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('hide');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Инициализация корзины
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});

// Глобальные функции для использования в каталоге
window.addToCart = function(product) {
    if (window.cartManager) {
        window.cartManager.addToCart(product);
    }
};