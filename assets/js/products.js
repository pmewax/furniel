// Product Page Functionality
class ProductManager {
    constructor() {
        this.currentProduct = null;
        this.init();
    }

    init() {
        this.loadProductData();
        this.setupEventListeners();
        this.setupTabs();
        this.setupGallery();
        this.setupQuantityControls();
        this.loadRelatedProducts();
    }

    loadProductData() {
        // Получаем ID продукта из URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        console.log('Загрузка товара с ID:', productId);
        
        if (productId) {
            // Ищем продукт в localStorage (из CSV)
            const products = JSON.parse(localStorage.getItem('furniel_products')) || [];
            this.currentProduct = products.find(p => p.id == productId || p.article == productId);
            
            console.log('Найден товар:', this.currentProduct);
            
            if (this.currentProduct) {
                this.displayProduct();
            } else {
                // Если продукт не найден, используем демо данные
                console.log('Товар не найден, загружаем демо данные');
                this.loadDemoProduct();
            }
        } else {
            // Если нет ID, используем демо продукт
            console.log('ID товара не указан, загружаем демо данные');
            this.loadDemoProduct();
        }
    }

    loadDemoProduct() {
        this.currentProduct = {
            id: 'demo-1',
            article: 'FUR-SF-001',
            name: 'Диван "Модерн" с кожаной обивкой',
            price: 45900,
            originalPrice: 54900,
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            images: [
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
            ],
            category: 'Диваны и кресла',
            description: 'Элегантный диван с кожаной обивкой премиум-класса. Созданный для тех, кто ценит современный дизайн и непревзойденный комфорт.',
            inStock: true,
            stock: 5,
            isNew: true,
            isHit: true,
            rating: 4.8,
            reviews: 124,
            features: ['new', 'eco'],
            materials: ['leather', 'metal'],
            colors: ['brown', 'black'],
            dimensions: {
                width: '220 см',
                depth: '95 см',
                height: '85 см'
            },
            manufacturer: 'Furniel',
            country: 'Италия',
            warranty: '5 лет'
        };
        
        this.displayProduct();
    }

    displayProduct() {
        if (!this.currentProduct) {
            console.error('Товар не загружен');
            return;
        }

        console.log('Отображение товара:', this.currentProduct);

        // Обновляем заголовок страницы
        document.title = `${this.currentProduct.name} - Furniel`;

        // Основная информация
        const productTitle = document.querySelector('.product-title');
        const priceCurrent = document.querySelector('.price-current');
        const priceOld = document.querySelector('.price-old');
        const priceDiscount = document.querySelector('.price-discount');

        if (productTitle) productTitle.textContent = this.currentProduct.name;
        if (priceCurrent) priceCurrent.textContent = `${this.currentProduct.price.toLocaleString()} ₽`;
        
        if (this.currentProduct.originalPrice && this.currentProduct.originalPrice > this.currentProduct.price) {
            const discount = Math.round((1 - this.currentProduct.price / this.currentProduct.originalPrice) * 100);
            if (priceOld) {
                priceOld.textContent = `${this.currentProduct.originalPrice.toLocaleString()} ₽`;
                priceOld.style.display = 'block';
            }
            if (priceDiscount) {
                priceDiscount.textContent = `-${discount}%`;
                priceDiscount.style.display = 'block';
            }
        } else {
            if (priceOld) priceOld.style.display = 'none';
            if (priceDiscount) priceDiscount.style.display = 'none';
        }

        // Рейтинг и отзывы
        this.updateRating(this.currentProduct.rating, this.currentProduct.reviews);

        // Бейджи
        this.updateBadges();

        // Галерея
        this.updateGallery();

        // Хлебные крошки
        this.updateBreadcrumbs();

        // Мета информация
        this.updateMetaInfo();

        // Обновляем Open Graph метатеги для соцсетей
        this.updateMetaTags();

        // Описание товара
        this.updateDescription();
    }

    updateRating(rating, reviews) {
        const ratingElement = document.querySelector('.product-rating');
        if (!ratingElement) return;

        const stars = ratingElement.querySelector('.stars');
        const ratingValue = ratingElement.querySelector('.rating-value');
        const reviewsCount = ratingElement.querySelector('.reviews-count');

        if (stars) {
            stars.innerHTML = this.generateStarsHTML(rating);
        }
        if (ratingValue) {
            ratingValue.textContent = rating;
        }
        if (reviewsCount) {
            reviewsCount.textContent = `(${reviews} отзыва)`;
        }
    }

    generateStarsHTML(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        
        // Полные звезды
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star full">★</span>';
        }
        
        // Половина звезды
        if (hasHalfStar) {
            starsHTML += '<span class="star half">★</span>';
        }
        
        // Пустые звезды
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star empty">☆</span>';
        }
        
        return starsHTML;
    }

    updateBadges() {
        const badgesContainer = document.querySelector('.image-badges');
        if (!badgesContainer) return;

        let badgesHTML = '';
        
        if (this.currentProduct.isNew) {
            badgesHTML += '<span class="badge new">Новинка</span>';
        }
        if (this.currentProduct.features && this.currentProduct.features.includes('eco')) {
            badgesHTML += '<span class="badge eco">Эко</span>';
        }
        if (this.currentProduct.isHit) {
            badgesHTML += '<span class="badge hit">Хит</span>';
        }

        badgesContainer.innerHTML = badgesHTML;
    }

    updateGallery() {
        const mainImage = document.getElementById('mainImage');
        const thumbsContainer = document.querySelector('.gallery-thumbs');
        
        if (!mainImage || !thumbsContainer) return;

        // Основное изображение
        mainImage.src = this.currentProduct.image;
        mainImage.alt = this.currentProduct.name;

        // Миниатюры
        const images = this.currentProduct.images || [this.currentProduct.image];
        let thumbsHTML = '';

        images.forEach((image, index) => {
            const isActive = index === 0 ? 'active' : '';
            thumbsHTML += `
                <div class="thumb ${isActive}" data-image="${image}">
                    <img src="${image}" alt="${this.currentProduct.name} - вид ${index + 1}">
                </div>
            `;
        });

        thumbsContainer.innerHTML = thumbsHTML;
    }

    updateBreadcrumbs() {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (!breadcrumb) return;

        const category = this.currentProduct.category || 'Каталог';
        breadcrumb.innerHTML = `
            <a href="index.html">Главная</a>
            <span>/</span>
            <a href="catalog.html">Каталог</a>
            <span>/</span>
            <a href="catalog.html?category=${this.getCategorySlug(category)}">${category}</a>
            <span>/</span>
            <span class="current">${this.currentProduct.name}</span>
        `;
    }

    getCategorySlug(category) {
        const slugs = {
            'Диваны и кресла': 'sofas',
            'Столы': 'tables',
            'Стулья': 'chairs',
            'Кровати': 'beds',
            'Системы хранения': 'storage'
        };
        return slugs[category] || 'sofas';
    }

    updateMetaInfo() {
        const metaContainer = document.querySelector('.product-meta');
        if (!metaContainer) return;

        metaContainer.innerHTML = `
            <div class="meta-item">
                <span class="meta-label">Артикул:</span>
                <span class="meta-value">${this.currentProduct.article || this.currentProduct.id}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Категория:</span>
                <span class="meta-value">${this.currentProduct.category || 'Мебель'}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Материал:</span>
                <span class="meta-value">${this.getMaterialsText()}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Размеры:</span>
                <span class="meta-value">${this.getDimensionsText()}</span>
            </div>
            ${this.currentProduct.manufacturer ? `
            <div class="meta-item">
                <span class="meta-label">Производитель:</span>
                <span class="meta-value">${this.currentProduct.manufacturer}</span>
            </div>
            ` : ''}
            ${this.currentProduct.country ? `
            <div class="meta-item">
                <span class="meta-label">Страна:</span>
                <span class="meta-value">${this.currentProduct.country}</span>
            </div>
            ` : ''}
        `;
    }

    updateDescription() {
        const descriptionTab = document.getElementById('description');
        if (!descriptionTab) return;

        descriptionTab.innerHTML = `
            <div class="description-content">
                <div class="description-text">
                    <h3>Элегантность и комфорт в каждой детали</h3>
                    <p>${this.currentProduct.description}</p>
                    
                    <h4>Преимущества:</h4>
                    <ul>
                        <li>Высококачественные материалы</li>
                        <li>Прочный каркас</li>
                        <li>Эргономичная поддержка спины</li>
                        <li>Легкий уход и долговечность</li>
                        <li>Сертифицированные экологичные материалы</li>
                    </ul>

                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">🌿</div>
                            <h5>Экологичность</h5>
                            <p>Использованы только сертифицированные экологичные материалы</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">⚡</div>
                            <h5>Прочность</h5>
                            <p>Каркас выдерживает нагрузку до 300 кг</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🎨</div>
                            <h5>Дизайн</h5>
                            <p>Разработан ведущими европейскими дизайнерами</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMaterialsText() {
        if (this.currentProduct.material) {
            return this.currentProduct.material;
        }
        if (this.currentProduct.materials && this.currentProduct.materials.length > 0) {
            return this.currentProduct.materials.join(', ');
        }
        return 'Информация уточняется';
    }

    getDimensionsText() {
        if (this.currentProduct.dimensions) {
            const dim = this.currentProduct.dimensions;
            return `${dim.width || ''}×${dim.depth || ''}×${dim.height || ''}`.replace(/^×|×$/g, '');
        }
        return 'Информация уточняется';
    }

    updateMetaTags() {
        // Обновляем Open Graph метатеги
        const updateMetaTag = (name, content) => {
            let meta = document.querySelector(`meta[property="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        updateMetaTag('og:title', this.currentProduct.name);
        updateMetaTag('og:description', this.currentProduct.description);
        updateMetaTag('og:image', this.currentProduct.image);
        updateMetaTag('og:url', window.location.href);
    }

    setupEventListeners() {
        // Добавление в корзину
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }

        // Купить сейчас
        const buyNowBtn = document.querySelector('.buy-now-btn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                this.buyNow();
            });
        }

        // Поделиться в соцсетях
        this.setupShareButtons();
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Убираем активный класс у всех кнопок и панелей
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));

                // Добавляем активный класс текущей кнопке и панели
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                const tabPane = document.getElementById(tabId);
                if (tabPane) {
                    tabPane.classList.add('active');
                }

                // Загружаем контент для таба если нужно
                this.loadTabContent(tabId);
            });
        });
    }

    loadTabContent(tabId) {
        switch(tabId) {
            case 'reviews':
                this.loadReviews();
                break;
            case 'specifications':
                this.loadSpecifications();
                break;
            // другие табы...
        }
    }

    setupGallery() {
        // Обработчики для миниатюр
        document.addEventListener('click', (e) => {
            if (e.target.closest('.thumb')) {
                const thumb = e.target.closest('.thumb');
                const imageUrl = thumb.getAttribute('data-image');
                
                // Обновляем основное изображение
                const mainImage = document.getElementById('mainImage');
                if (mainImage) {
                    mainImage.src = imageUrl;
                }
                
                // Обновляем активную миниатюру
                document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            }
        });

        // Zoom функционал
        const zoomBtn = document.getElementById('zoomBtn');
        const zoomModal = document.getElementById('zoomModal');
        const zoomImage = document.getElementById('zoomImage');

        if (zoomBtn && zoomModal && zoomImage) {
            zoomBtn.addEventListener('click', () => {
                const mainImage = document.getElementById('mainImage');
                if (mainImage) {
                    zoomImage.src = mainImage.src;
                    zoomModal.style.display = 'flex';
                }
            });

            zoomModal.addEventListener('click', (e) => {
                if (e.target === zoomModal || e.target.classList.contains('close')) {
                    zoomModal.style.display = 'none';
                }
            });
        }
    }

    setupQuantityControls() {
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        const quantityInput = document.querySelector('.quantity-input');

        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    quantityInput.value = value - 1;
                }
            });

            plusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                const max = parseInt(quantityInput.getAttribute('max')) || 10;
                if (value < max) {
                    quantityInput.value = value + 1;
                }
            });

            quantityInput.addEventListener('change', () => {
                let value = parseInt(quantityInput.value);
                const min = parseInt(quantityInput.getAttribute('min')) || 1;
                const max = parseInt(quantityInput.getAttribute('max')) || 10;
                
                if (isNaN(value) || value < min) quantityInput.value = min;
                if (value > max) quantityInput.value = max;
            });
        }
    }

    setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        
        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.classList[1]; // vk, telegram, whatsapp
                this.shareProduct(type);
            });
        });
    }

    shareProduct(type) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(this.currentProduct.name);
        const text = encodeURIComponent(this.currentProduct.description);
        const image = encodeURIComponent(this.currentProduct.image);

        let shareUrl = '';

        switch(type) {
            case 'vk':
                shareUrl = `https://vk.com/share.php?url=${url}&title=${title}&description=${text}&image=${image}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${title}%20${url}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    addToCart() {
        const quantity = parseInt(document.querySelector('.quantity-input')?.value) || 1;
        
        const cartItem = {
            id: this.currentProduct.id,
            title: this.currentProduct.name,
            price: this.currentProduct.price,
            image: this.currentProduct.image,
            quantity: quantity
        };

        // Используем глобальную функцию добавления в корзину
        if (window.addToCart) {
            window.addToCart(cartItem);
            this.showNotification('Товар добавлен в корзину', 'success');
        } else {
            // Fallback
            const cart = JSON.parse(localStorage.getItem('furniel_cart_v1')) || [];
            const existingItem = cart.find(item => item.id == cartItem.id);
            
            if (existingItem) {
                existingItem.qty += quantity;
            } else {
                cart.push({
                    id: cartItem.id,
                    title: cartItem.title,
                    price: cartItem.price,
                    image: cartItem.image,
                    qty: quantity
                });
            }
            
            localStorage.setItem('furniel_cart_v1', JSON.stringify(cart));
            this.showNotification('Товар добавлен в корзину', 'success');
            
            // Обновляем бейдж
            const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
            const badges = document.querySelectorAll('.cart-badge, #cartCount');
            badges.forEach(badge => {
                if (badge) {
                    badge.textContent = totalItems;
                    badge.style.display = totalItems > 0 ? 'flex' : 'none';
                }
            });
        }
    }

    buyNow() {
        this.addToCart();
        // Перенаправляем в корзину
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 1000);
    }

    loadRelatedProducts() {
        const relatedContainer = document.querySelector('.related-products .products-grid');
        if (!relatedContainer) return;

        // Получаем товары из той же категории
        const products = JSON.parse(localStorage.getItem('furniel_products')) || [];
        const relatedProducts = products
            .filter(p => p.id != this.currentProduct.id && p.category === this.currentProduct.category)
            .slice(0, 4);

        if (relatedProducts.length === 0) {
            relatedContainer.innerHTML = '<p>Похожие товары не найдены</p>';
            return;
        }

        let productsHTML = '';
        relatedProducts.forEach(product => {
            const discount = product.originalPrice && product.originalPrice > product.price ? 
                Math.round((1 - product.price / product.originalPrice) * 100) : 0;

            productsHTML += `
                <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" 
                             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                        <div class="product-badges">
                            ${product.isNew ? '<span class="product-badge badge-new">Новинка</span>' : ''}
                            ${discount > 0 ? `<span class="product-badge badge-sale">-${discount}%</span>` : ''}
                        </div>
                    </div>
                    <div class="product-content">
                        <div class="product-category">${product.category || 'Мебель'}</div>
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">
                            <span class="current-price">${product.price.toLocaleString()} ₽</span>
                            ${product.originalPrice && product.originalPrice > product.price ? 
                                `<span class="old-price">${product.originalPrice.toLocaleString()} ₽</span>` : ''}
                        </div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCartRelated('${product.id}')">
                            В корзину
                        </button>
                    </div>
                </div>
            `;
        });

        relatedContainer.innerHTML = productsHTML;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 24px;
            padding: 12px 20px;
            border-radius: var(--radius-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            color: white;
            font-weight: 500;
            backdrop-filter: blur(10px);
            background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
            box-shadow: var(--shadow-lg);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    loadReviews() {
        // Загрузка отзывов (можно реализовать позже)
        console.log('Loading reviews...');
    }

    loadSpecifications() {
        // Загрузка характеристик
        const specsContainer = document.getElementById('specifications');
        if (!specsContainer || !this.currentProduct) return;

        let specsHTML = `
            <div class="specs-grid">
                <div class="spec-group">
                    <h4>Общие характеристики</h4>
                    <div class="spec-item">
                        <span class="spec-label">Артикул</span>
                        <span class="spec-value">${this.currentProduct.article || this.currentProduct.id}</span>
                    </div>
                    ${this.currentProduct.manufacturer ? `
                    <div class="spec-item">
                        <span class="spec-label">Производитель</span>
                        <span class="spec-value">${this.currentProduct.manufacturer}</span>
                    </div>
                    ` : ''}
                    ${this.currentProduct.country ? `
                    <div class="spec-item">
                        <span class="spec-label">Страна производства</span>
                        <span class="spec-value">${this.currentProduct.country}</span>
                    </div>
                    ` : ''}
                    ${this.currentProduct.warranty ? `
                    <div class="spec-item">
                        <span class="spec-label">Гарантия</span>
                        <span class="spec-value">${this.currentProduct.warranty}</span>
                    </div>
                    ` : ''}
                </div>
        `;

        // Размеры
        if (this.currentProduct.dimensions) {
            specsHTML += `
                <div class="spec-group">
                    <h4>Размеры</h4>
                    ${this.currentProduct.dimensions.width ? `
                    <div class="spec-item">
                        <span class="spec-label">Ширина</span>
                        <span class="spec-value">${this.currentProduct.dimensions.width}</span>
                    </div>
                    ` : ''}
                    ${this.currentProduct.dimensions.depth ? `
                    <div class="spec-item">
                        <span class="spec-label">Глубина</span>
                        <span class="spec-value">${this.currentProduct.dimensions.depth}</span>
                    </div>
                    ` : ''}
                    ${this.currentProduct.dimensions.height ? `
                    <div class="spec-item">
                        <span class="spec-label">Высота</span>
                        <span class="spec-value">${this.currentProduct.dimensions.height}</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }

        // Материалы
        specsHTML += `
            <div class="spec-group">
                <h4>Материалы</h4>
                <div class="spec-item">
                    <span class="spec-label">Обивка</span>
                    <span class="spec-value">${this.getMaterialsText()}</span>
                </div>
                ${this.currentProduct.material ? `
                <div class="spec-item">
                    <span class="spec-label">Основной материал</span>
                    <span class="spec-value">${this.currentProduct.material}</span>
                </div>
                ` : ''}
            </div>
        </div>
        `;

        const specsGrid = specsContainer.querySelector('.specs-grid');
        if (specsGrid) {
            specsGrid.innerHTML = specsHTML;
        }
    }
}

// Глобальная функция для добавления в корзину из связанных товаров
window.addToCartRelated = function(productId) {
    const products = JSON.parse(localStorage.getItem('furniel_products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (product && window.addToCart) {
        window.addToCart({
            id: product.id,
            title: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        
        // Показываем уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 24px;
            padding: 12px 20px;
            border-radius: 8px;
            background: #10b981;
            color: white;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = 'Товар добавлен в корзину';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.productManager = new ProductManager();
});

// Глобальная функция для перехода на страницу продукта
function navigateToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}