// Упрощенная логика оформления заказа
let orderData = {
    contact: {},
    items: []
};

let csrfToken = '';

document.addEventListener('DOMContentLoaded', async function() {
    await loadCsrfToken();
    initializeCheckout();
});

async function loadCsrfToken() {
    try {
        const res = await fetch('/api/csrf-token.php', { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Не удалось получить CSRF токен');
        const data = await res.json();
        if (data.success && data.token) {
            csrfToken = data.token;
        }
    } catch (error) {
        console.error('Ошибка получения CSRF токена', error);
        showNotification('Не удалось инициализировать защиту формы', 'error');
    }
}

function initializeCheckout() {
    loadOrderItems();
    updateOrderTotals();
    initializeEventListeners();
    
    // Проверить, есть ли товары в корзине
    const cart = readCart();
    if (cart.length === 0) {
        showNotification('Корзина пуста. Добавьте товары перед оформлением заказа.', 'error');
        setTimeout(() => {
            window.location.href = 'catalog.html';
        }, 2000);
        return;
    }
    
    // Инициализация маски для телефона
    initializePhoneMask();
}

function initializeEventListeners() {
    // Отправка формы
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleOrderSubmit);
    }
}

function initializePhoneMask() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length === 1 && value !== '7') {
                value = '7' + value;
            }
            if (value.length > 0) {
                let formattedValue = '+7 ';
                if (value.length > 1) {
                    formattedValue += value.substring(1, 4);
                }
                if (value.length > 4) {
                    formattedValue += ' ' + value.substring(4, 7);
                }
                if (value.length > 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if (value.length > 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
                this.value = formattedValue;
            }
        });
    }
}

function readCart() {
    try {
        return JSON.parse(localStorage.getItem('furniel_cart_v1')) || [];
    } catch (e) {
        return [];
    }
}

function loadOrderItems() {
    const container = document.getElementById('orderItems');
    if (!container) return;
    
    const cart = readCart();
    let html = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        
        html += `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                </div>
                <div class="order-item-info">
                    <div class="order-item-name">${item.title}</div>
                    <div class="order-item-details">
                        <span class="order-item-price">${formatPrice(itemTotal)}</span>
                        <span class="order-item-quantity">${item.qty} шт.</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    orderData.items = cart;
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

function updateOrderTotals() {
    const cart = readCart();
    const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
    
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('grandTotal').textContent = formatPrice(subtotal);
}

function handleOrderSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const privacyAgreement = document.getElementById('privacyAgreement');
    if (!privacyAgreement.checked) {
        showNotification('Необходимо согласие с политикой конфиденциальности', 'error');
        return;
    }
    
    // Собираем данные формы
    collectFormData();
    
    // Показать индикатор загрузки
    const submitBtn = document.getElementById('submitOrder');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    // Отправка данных на сервер
    sendOrderToServer();
}

function validateForm() {
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const city = document.getElementById('city');
    const address = document.getElementById('address');
    
    if (!firstName.value.trim()) {
        showNotification('Введите имя', 'error');
        firstName.focus();
        return false;
    }
    
    if (!lastName.value.trim()) {
        showNotification('Введите фамилию', 'error');
        lastName.focus();
        return false;
    }
    
    if (!phone.value.trim()) {
        showNotification('Введите телефон', 'error');
        phone.focus();
        return false;
    }
    
    if (!email.value.trim()) {
        showNotification('Введите email', 'error');
        email.focus();
        return false;
    }
    
    if (!isValidEmail(email.value)) {
        showNotification('Введите корректный email', 'error');
        email.focus();
        return false;
    }
    
    if (!city.value.trim()) {
        showNotification('Введите город', 'error');
        city.focus();
        return false;
    }
    
    if (!address.value.trim()) {
        showNotification('Введите адрес доставки', 'error');
        address.focus();
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function collectFormData() {
    orderData.contact = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        city: document.getElementById('city').value,
        address: document.getElementById('address').value,
        comment: document.getElementById('comment').value
    };
}

function sendOrderToServer() {
    const formData = new FormData();
    
    // Добавляем данные формы
    formData.append('name', `${orderData.contact.firstName} ${orderData.contact.lastName}`);
    formData.append('phone', orderData.contact.phone);
    formData.append('email', orderData.contact.email);
    formData.append('city', orderData.contact.city);
    formData.append('address', orderData.contact.address);
    formData.append('comment', orderData.contact.comment || '');
    
    // Добавляем информацию о товарах
    const itemsText = orderData.items.map(item => 
        `${item.title} (${item.qty} шт.) - ${formatPrice(item.price * item.qty)}`
    ).join('\n');
    
    formData.append('items', itemsText);
    
    // Общая сумма
    const total = orderData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    formData.append('total', formatPrice(total));
    
    // Отправка на сервер
    if (!csrfToken) {
        showNotification('CSRF токен отсутствует. Обновите страницу.', 'error');
        return;
    }

    fetch('send_order.php', {
        method: 'POST',
        headers: {
            'X-CSRF-Token': csrfToken
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                localStorage.setItem('furniel_cart_v1', '[]');
                showOrderSuccess();
            } else {
                throw new Error(data.error || 'Ошибка отправки заявки');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showNotification(error.message || 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.', 'error');

            const submitBtn = document.getElementById('submitOrder');
            submitBtn.textContent = 'Отправить заявку менеджеру';
            submitBtn.disabled = false;
        });
}

function showOrderSuccess() {
    const successHTML = `
        <div class="order-success" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
            <h2 style="color: #27ae60; margin-bottom: 20px;">Заявка успешно отправлена!</h2>
            <p style="font-size: 18px; margin-bottom: 10px;">Спасибо за ваш заказ!</p>
            <p style="color: #666; margin-bottom: 30px;">Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа и уточнения деталей доставки и оплаты.</p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button class="btn-primary" onclick="window.location.href='index.html'">На главную</button>
                <button class="btn-secondary" onclick="window.location.href='catalog.html'">Продолжить покупки</button>
            </div>
        </div>
    `;
    
    document.querySelector('.checkout-form-section').innerHTML = successHTML;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        color: white;
        font-weight: 500;
        max-width: 400px;
    `;
    
    if (type === 'success') {
        notification.style.background = '#27ae60';
    } else {
        notification.style.background = '#e74c3c';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}