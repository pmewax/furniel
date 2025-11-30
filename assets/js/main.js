// main.js - полная версия всех функций
(function(){
  'use strict';

  // Utility functions
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Toast function
  function toast(text, timeout=2500){
    let t = document.createElement('div');
    t.className = 'furniel-toast';
    t.textContent = text;
    document.body.appendChild(t);
    requestAnimationFrame(()=> t.classList.add('visible'));
    setTimeout(()=>{ t.classList.remove('visible'); setTimeout(()=>t.remove(),300); }, timeout);
  }

  // Price formatter
  window.formatPrice = function(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  // Cart management
  const CART_KEY = 'furniel_cart_v1';

  window.readCart = function() {
    try { 
      return JSON.parse(localStorage.getItem(CART_KEY)) || []; 
    } catch(e) { 
      return []; 
    }
  };

  window.writeCart = function(cart) { 
    localStorage.setItem(CART_KEY, JSON.stringify(cart)); 
    if (window.updateCartBadge) updateCartBadge();
    if (window.renderMiniCart) renderMiniCart();
  };

  // Global add to cart function
  window.addToCart = function(item) {
    const cart = readCart();
    
    if (item && typeof item === 'object') {
      const exist = cart.find(i => i.id == item.id);
      if (exist) { 
        exist.qty = Math.min(999, exist.qty + (item.quantity || 1)); 
      } else { 
        cart.push({
          id: item.id,
          title: item.title || item.name,
          price: item.price,
          image: item.image,
          qty: item.quantity || 1
        }); 
      }
    }
    
    writeCart(cart);
    toast('Добавлено в корзину');
  };

  // Global remove from cart function
  window.removeFromCart = function(productId) {
    const cart = readCart();
    const newCart = cart.filter(item => item.id != productId);
    writeCart(newCart);
    toast('Товар удален из корзины');
  };

  // Cart badge updater
  window.updateCartBadge = function() {
    const cart = readCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    
    // Update header badge
    const cartBadge = document.getElementById('cartCount');
    if (cartBadge) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update mobile menu badge
    const mobileCartBadge = document.querySelector('.mobile-cart-badge');
    if (mobileCartBadge) {
      mobileCartBadge.textContent = totalItems;
      mobileCartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update mobile cart text
    const mobileCartText = document.querySelector('.mobile-cart-text span');
    if (mobileCartText) {
      if (totalItems === 0) {
        mobileCartText.textContent = 'Корзина пуста';
      } else {
        const itemWord = totalItems === 1 ? 'товар' : 
                       totalItems < 5 ? 'товара' : 'товаров';
        mobileCartText.textContent = `${totalItems} ${itemWord}`;
      }
    }
  };

  // Mini cart functionality
  window.renderMiniCart = function() {
    const miniCart = $('#miniCart');
    if (!miniCart) return;

    const cart = readCart();
    
    if (cart.length === 0) {
      miniCart.innerHTML = '<div class="empty">Корзина пуста</div>';
      return;
    }

    let html = '';
    cart.forEach(item => {
      html += `
        <div class="mini-item">
          <div class="mi-left">
            <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'">
          </div>
          <div class="mi-mid">
            <div class="mi-title">${item.title}</div>
            <div class="mi-meta">${item.qty} × ${formatPrice(item.price)}</div>
          </div>
          <div class="mi-right">
            <div class="mi-price">${formatPrice(item.price * item.qty)}</div>
            <button class="mi-remove" onclick="removeFromCart('${item.id}')">×</button>
          </div>
        </div>
      `;
    });

    html += `
      <div class="mini-total">
        <strong>Итого: ${formatPrice(cart.reduce((sum, item) => sum + (item.price * item.qty), 0))}</strong>
      </div>
      <div class="mini-actions">
        <button class="btn btn-primary" onclick="window.location.href='cart.html'">Оформить заказ</button>
      </div>
    `;

    miniCart.innerHTML = html;
  };

  // Search functionality
  function initSearch() {
    const searchBtn = $('#searchBtn');
    const searchModal = $('#searchModal');
    const searchClose = $('#searchClose');
    const searchInput = $('#searchInput');
    const searchResults = $('#searchResults');

    if (!searchBtn || !searchModal) return;

    // Open search modal
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      searchModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (searchInput) searchInput.focus();
    });

    // Close search modal
    if (searchClose) {
      searchClose.addEventListener('click', () => {
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Search functionality
    if (searchInput && searchResults) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length < 2) {
          searchResults.innerHTML = '';
          return;
        }

        // Mock search results
        const mockResults = [
          { title: 'Диван угловой "Милан"', price: 45900, id: 1 },
          { title: 'Кресло офисное "Комфорт"', price: 12500, id: 2 },
          { title: 'Стол обеденный "Сканди"', price: 23400, id: 3 }
        ];

        const filtered = mockResults.filter(item => 
          item.title.toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
          searchResults.innerHTML = filtered.map(item => `
            <div class="search-result-item" data-id="${item.id}">
              <div class="search-item-title">${item.title}</div>
              <div class="search-item-price">${formatPrice(item.price)}</div>
            </div>
          `).join('');
        } else {
          searchResults.innerHTML = '<div class="search-no-results">Ничего не найдено</div>';
        }
      });
    }
  }

  // Cart toggle functionality
  function initCartToggle() {
    const cartBtn = $('#cartBtn');
    const miniCart = $('#miniCart');

    if (!cartBtn || !miniCart) return;

    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (miniCart.style.display === 'block') {
        miniCart.style.display = 'none';
      } else {
        miniCart.style.display = 'block';
        renderMiniCart();
      }
    });

    // Close mini-cart when clicking outside
    document.addEventListener('click', (e) => {
      if (miniCart && !miniCart.contains(e.target) && cartBtn && !cartBtn.contains(e.target)) {
        miniCart.style.display = 'none';
      }
    });
  }

  // Initialize
  function init() {
    console.log('🛒 Main JS initialized');
    
    // Initialize cart badge
    updateCartBadge();
    
    // Initialize search
    initSearch();
    
    // Initialize cart toggle
    initCartToggle();
    
    // Create mini-cart element if it doesn't exist
    if (!$('#miniCart')) {
      const miniCart = document.createElement('div');
      miniCart.id = 'miniCart';
      miniCart.className = 'mini-cart';
      miniCart.style.cssText = `
        display: none;
        position: fixed;
        top: 80px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 1001;
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;
      `;
      document.body.appendChild(miniCart);
    }

    // Add CSS for all components
    if (!$('#mainStyles')) {
      const style = document.createElement('style');
      style.id = 'mainStyles';
      style.textContent = `
        .mini-cart {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
        }
        .mini-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .mi-left img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 6px;
        }
        .mi-mid {
          flex: 1;
        }
        .mi-title {
          font-weight: 600;
          margin-bottom: 4px;
          font-size: 14px;
        }
        .mi-meta {
          font-size: 12px;
          color: #666;
        }
        .mi-right {
          text-align: right;
        }
        .mi-price {
          font-weight: 600;
          color: #667eea;
          font-size: 14px;
        }
        .mi-remove {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          margin-top: 4px;
          font-size: 16px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mi-remove:hover {
          background: #f0f0f0;
          color: #ff6b6b;
        }
        .mini-total {
          padding: 16px 0;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          font-size: 16px;
        }
        .mini-actions {
          display: flex;
          gap: 8px;
        }
        .mini-actions .btn {
          flex: 1;
          padding: 10px;
          font-size: 14px;
        }
        .empty {
          text-align: center;
          padding: 20px;
          color: #999;
        }
        .search-result-item {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
        }
        .search-result-item:hover {
          background: #f8f9fa;
        }
        .search-item-title {
          font-weight: 500;
        }
        .search-item-price {
          color: #667eea;
          font-weight: 600;
        }
        .search-no-results {
          padding: 20px;
          text-align: center;
          color: #999;
        }
        .furniel-toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          z-index: 10000;
          transition: transform 0.3s ease;
          font-weight: 500;
        }
        .furniel-toast.visible {
          transform: translateX(-50%) translateY(0);
        }
      `;
      document.head.appendChild(style);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  
})();