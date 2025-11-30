// catalog.js - полная версия с анимациями, умным поиском, историей просмотров и голосовым поиском
class CatalogManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.currentView = 'grid';
        this.filters = {
            search: '',
            price: { min: 0, max: 100000 },
            categories: [],
            materials: [],
            colors: [],
            style: [],
            features: [],
            availability: []
        };
        
        this.filterDebounceTimer = null;
        this.priceDebounceTimer = null;
        this.searchDebounceTimer = null;
        this.currentNotification = null;
        this.isLoading = false;
        this.recentlyViewed = [];
        this.popularSearches = [
            'диван', 'кресло', 'стол', 'стул', 'кровать', 
            'шкаф', 'комод', 'полка', 'кухня', 'гостиная'
        ];
        this.recentSearches = [];
        
        this.init();
    }

    async init() {
        console.log('🛋️ Catalog manager initialized');
        await this.loadProducts();
        
        if (this.products.length === 0) {
            this.showNotification('Нет товаров для отображения', 'warning');
            return;
        }
        
        this.setupEventListeners();
        this.setupFilters();
        this.setupProductNavigation();
        this.setupSearchSuggestions();
        this.setupVoiceSearch();
        this.setupRecentlyViewed();
        this.handleUrlParams();
        this.renderProducts();
        this.updateCategoryCounts();
        this.updatePriceRange();
        this.setupMobileFilters();
    }

    async loadProducts() {
        try {
            console.log('📦 Загрузка товаров...');
            this.showLoadingState(true);
            
            // Пробуем загрузить из БД
            const dbProducts = await this.loadFromDatabase();
            if (dbProducts && dbProducts.length > 0) {
                this.products = this.adaptDBProducts(dbProducts);
                console.log('✅ Товары загружены из БД:', this.products.length);
                this.showLoadingState(false);
                return;
            }
            
            // Если БД пустая, пробуем localStorage
            console.log('🔄 БД пустая, пробуем localStorage...');
            const localStorageProducts = await this.loadFromLocalStorage();
            if (localStorageProducts && localStorageProducts.length > 0) {
                this.products = localStorageProducts;
                console.log('✅ Товары загружены из localStorage:', this.products.length);
                this.showLoadingState(false);
                return;
            }
            
            // Если нет данных ни в БД, ни в localStorage
            throw new Error('Нет данных о товарах');
            
        } catch (error) {
            console.error('❌ Ошибка загрузки товаров:', error);
            this.products = [];
            this.showLoadingState(false);
            this.showNotification('Не удалось загрузить товары. Проверьте подключение к базе данных.', 'error');
        }
    }

    async loadFromDatabase() {
        try {
            // Пробуем разные endpoints для БД
            const endpoints = [
                '/api/products',
                '/api/products.php',
                '/api/get_products',
                '/products/api'
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    if (response.ok) {
                        const products = await response.json();
                        if (products && products.length > 0) {
                            console.log(`✅ Данные получены с ${endpoint}`);
                            return products;
                        }
                    }
                } catch (error) {
                    console.log(`❌ ${endpoint} недоступен`);
                }
            }
            
            return null;
        } catch (error) {
            console.log('📋 БД недоступна');
            return null;
        }
    }

    async loadFromLocalStorage() {
        try {
            const storedProducts = localStorage.getItem('furniel_products');
            if (storedProducts) {
                const csvProducts = JSON.parse(storedProducts);
                return this.adaptCSVProducts(csvProducts);
            }
            return null;
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return null;
        }
    }

    // Адаптация данных из БД для каталога
    adaptDBProducts(dbProducts) {
        return dbProducts.map((product, index) => {
            // Определяем категорию
            const category = this.determineCategory(product.category || '');
            
            // Определяем материалы на основе описания
            const materials = this.extractMaterialsFromDescription(product.description || '');
            
            // Определяем цвета
            const colors = this.extractColorsFromProduct(product);
            
            // Определяем особенности
            const features = this.extractFeaturesFromProduct(product);
            
            // Определяем стиль
            const style = this.extractStyleFromProduct(product);
            
            // Определяем наличие
            const inStock = (product.stock || 0) > 0;
            const stock = parseInt(product.stock) || 0;
            
            // Получаем изображения
            const images = this.parseImages(product.images);
            const mainImage = images[0] || this.getDefaultImage(category);
            
            // Обработка цены
            const price = parseFloat(product.price) || 0;
            const oldPrice = product.old_price ? parseFloat(product.old_price) : null;
            
            // Генерируем slug для URL
            const slug = this.generateSlug(product.title || product.name || 'Товар без названия');
            
            return {
                id: product.id || `db_${index}`,
                article: product.article || `ART${product.id}`,
                name: product.title || product.name || 'Товар без названия',
                slug: product.slug || slug,
                category: category,
                price: price,
                oldPrice: oldPrice && oldPrice > price ? oldPrice : null,
                image: mainImage,
                images: images,
                materials: materials,
                colors: colors,
                style: style,
                features: features,
                inStock: inStock,
                stock: stock,
                description: product.description || 'Современная мебель премиум-класса с гарантией качества.',
                manufacturer: product.manufacturer || 'Furniel',
                isHit: Boolean(product.is_hit || product.isHit),
                isNew: Boolean(product.is_new || product.isNew),
                // Дополнительные поля из БД
                dimensions: product.dimensions,
                weight: product.weight,
                warranty: product.warranty,
                created_at: product.created_at,
                updated_at: product.updated_at
            };
        });
    }

    // Адаптация данных из CSV
    adaptCSVProducts(csvProducts) {
        return csvProducts.map((product, index) => {
            const category = this.determineCategory(product.category || '');
            const materials = this.extractMaterialsFromDescription(product.description || '');
            const colors = this.extractColorsFromProduct(product);
            const features = this.extractFeaturesFromProduct(product);
            const style = this.extractStyleFromProduct(product);
            
            // Определяем наличие
            const inStock = product.inStock !== undefined ? 
                product.inStock : 
                (product.stock ? parseInt(product.stock) > 0 : Math.random() > 0.2);
            
            const stock = product.stock ? parseInt(product.stock) : (inStock ? Math.floor(Math.random() * 50) + 1 : 0);
            
            // Обработка цены
            const price = parseInt(product.price) || 0;
            const oldPrice = product.originalPrice && parseInt(product.originalPrice) > price ? 
                parseInt(product.originalPrice) : null;
            
            // Обработка изображения
            const image = product.image || product.images || this.getDefaultImage(category);
            
            // Генерируем slug для URL
            const slug = this.generateSlug(product.name || product.title || 'Товар без названия');
            
            return {
                id: product.id || `csv_${index}`,
                article: product.article || `ART${1000 + index}`,
                name: product.name || product.title || 'Товар без названия',
                slug: product.slug || slug,
                category: category,
                price: price,
                oldPrice: oldPrice,
                image: image,
                images: product.images ? (Array.isArray(product.images) ? product.images : [product.images]) : [image],
                materials: materials,
                colors: colors,
                style: style,
                features: features,
                inStock: inStock,
                stock: stock,
                description: product.description || 'Современная мебель премиум-класса с гарантией качества.',
                manufacturer: product.manufacturer || 'Furniel',
                isHit: product.isHit || Math.random() > 0.7,
                isNew: product.isNew || Math.random() > 0.5,
                link: product.link || ''
            };
        });
    }

    // Генерация slug для URL
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^\w\u0400-\u04FF]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100);
    }

    parseImages(imagesData) {
        if (!imagesData) return [this.getDefaultImage()];
        
        if (Array.isArray(imagesData)) {
            return imagesData;
        }
        
        if (typeof imagesData === 'string') {
            try {
                const parsed = JSON.parse(imagesData);
                return Array.isArray(parsed) ? parsed : [imagesData];
            } catch {
                return imagesData.split(',').map(img => img.trim());
            }
        }
        
        return [this.getDefaultImage()];
    }

    getDefaultImage(category = 'sofas') {
        const categoryImages = {
            'sofas': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'tables': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'chairs': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'beds': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'storage': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        };
        
        return categoryImages[category] || categoryImages.sofas;
    }

    determineCategory(categoryString) {
        const lowerCategory = (categoryString || '').toLowerCase();
        
        if (lowerCategory.includes('диван') || lowerCategory.includes('кресло') || lowerCategory.includes('пуф') || lowerCategory.includes('sofa')) {
            return 'sofas';
        } else if (lowerCategory.includes('стол') || lowerCategory.includes('table')) {
            return 'tables';
        } else if (lowerCategory.includes('стул') || lowerCategory.includes('chair')) {
            return 'chairs';
        } else if (lowerCategory.includes('кровать') || lowerCategory.includes('bed')) {
            return 'beds';
        } else if (lowerCategory.includes('шкаф') || lowerCategory.includes('комод') || lowerCategory.includes('полка') || lowerCategory.includes('storage')) {
            return 'storage';
        } else {
            const categories = ['sofas', 'tables', 'chairs', 'beds', 'storage'];
            return categories[Math.floor(Math.random() * categories.length)];
        }
    }

    extractMaterialsFromDescription(description) {
        const materials = [];
        const desc = description.toLowerCase();
        
        if (desc.includes('дерево') || desc.includes('массив') || desc.includes('бук') || desc.includes('дуб')) {
            materials.push('wood');
        }
        if (desc.includes('металл') || desc.includes('сталь') || desc.includes('алюминий')) {
            materials.push('metal');
        }
        if (desc.includes('ткань') || desc.includes('текстиль') || desc.includes('хлопок')) {
            materials.push('fabric');
        }
        if (desc.includes('кожа') || desc.includes('кожзам')) {
            materials.push('leather');
        }
        if (desc.includes('стекло') || desc.includes('зеркало')) {
            materials.push('glass');
        }
        if (desc.includes('пластик')) {
            materials.push('plastic');
        }
        if (desc.includes('мрамор')) {
            materials.push('marble');
        }
        
        return materials.length > 0 ? materials : ['wood'];
    }

    extractColorsFromProduct(product) {
        const colors = [];
        const desc = (product.description || '').toLowerCase();
        const name = (product.name || '').toLowerCase();
        const searchText = desc + ' ' + name;
        
        if (searchText.includes('бел') || searchText.includes('белый') || searchText.includes('светл')) {
            colors.push('white');
        }
        if (searchText.includes('черн') || searchText.includes('черный') || searchText.includes('темн')) {
            colors.push('black');
        }
        if (searchText.includes('коричн') || searchText.includes('коричневый') || searchText.includes('дерево')) {
            colors.push('brown');
        }
        if (searchText.includes('сер') || searchText.includes('серый')) {
            colors.push('gray');
        }
        if (searchText.includes('беж') || searchText.includes('бежевый')) {
            colors.push('beige');
        }
        if (searchText.includes('синий') || searchText.includes('голубой') || searchText.includes('navy')) {
            colors.push('navy');
        }
        if (searchText.includes('зелен')) {
            colors.push('green');
        }
        if (searchText.includes('синий') || searchText.includes('blue')) {
            colors.push('blue');
        }
        
        return colors.length > 0 ? colors : ['brown'];
    }

    extractStyleFromProduct(product) {
        const styles = [];
        const desc = (product.description || '').toLowerCase();
        const name = (product.name || '').toLowerCase();
        const searchText = desc + ' ' + name;
        
        if (searchText.includes('современ') || searchText.includes('модерн') || searchText.includes('modern')) {
            styles.push('modern');
        }
        if (searchText.includes('классич') || searchText.includes('classic')) {
            styles.push('classic');
        }
        if (searchText.includes('скандин') || searchText.includes('scandinavian')) {
            styles.push('scandinavian');
        }
        if (searchText.includes('лофт') || searchText.includes('industrial')) {
            styles.push('industrial');
        }
        if (searchText.includes('минимал') || searchText.includes('minimalism')) {
            styles.push('minimalism');
        }
        
        return styles.length > 0 ? styles : ['modern'];
    }

    extractFeaturesFromProduct(product) {
        const features = [];
        
        if (product.isNew || (product.name && product.name.toLowerCase().includes('новин'))) {
            features.push('new');
        }
        if (product.isHit || (product.name && product.name.toLowerCase().includes('хит'))) {
            features.push('sale');
        }
        if ((product.description || '').toLowerCase().includes('эко') || Math.random() > 0.8) {
            features.push('eco');
        }
        if ((product.description || '').toLowerCase().includes('умн') || Math.random() > 0.9) {
            features.push('smart');
        }
        if ((product.description || '').toLowerCase().includes('эргоном') || Math.random() > 0.7) {
            features.push('ergonomic');
        }
        if ((product.description || '').toLowerCase().includes('модул') || Math.random() > 0.6) {
            features.push('modular');
        }
        
        return features;
    }

    // Обработка параметров URL
    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        if (category) {
            console.log('🔄 Filtering by category from URL:', category);
            
            const categoryCheckbox = document.querySelector(`input[name="category"][value="${category}"]`);
            if (categoryCheckbox) {
                setTimeout(() => {
                    categoryCheckbox.checked = true;
                    this.updateArrayFilter('categories', category, true);
                    this.applyFilters();
                    
                    setTimeout(() => {
                        const catalogSection = document.querySelector('.catalog-content');
                        if (catalogSection) {
                            catalogSection.scrollIntoView({ 
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }, 100);
                }, 500);
            }
        }
    }

    // Настройка мобильных фильтров
    setupMobileFilters() {
        const mobileToggle = document.getElementById('mobileFiltersToggle');
        const filtersSidebar = document.getElementById('filtersSidebar');
        const filtersClose = document.getElementById('filtersClose');
        const closeFilters = document.getElementById('closeFilters');
        const applyFilters = document.getElementById('applyFilters');

        if (mobileToggle && filtersSidebar) {
            mobileToggle.addEventListener('click', () => {
                filtersSidebar.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        const closeFiltersHandler = () => {
            filtersSidebar.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (filtersClose) filtersClose.addEventListener('click', closeFiltersHandler);
        if (closeFilters) closeFilters.addEventListener('click', closeFiltersHandler);
        if (applyFilters) applyFilters.addEventListener('click', closeFiltersHandler);
    }

    updateCategoryCounts() {
        if (this.products.length === 0) return;

        const categoryCounts = {
            sofas: 0,
            tables: 0,
            chairs: 0,
            beds: 0,
            storage: 0
        };

        this.products.forEach(product => {
            if (categoryCounts.hasOwnProperty(product.category)) {
                categoryCounts[product.category]++;
            }
        });

        document.querySelectorAll('.checkbox-item .count').forEach(element => {
            const checkbox = element.closest('.checkbox-item').querySelector('input[name="category"]');
            if (checkbox && categoryCounts[checkbox.value]) {
                element.textContent = `(${categoryCounts[checkbox.value]})`;
            } else {
                element.textContent = '(0)';
            }
        });
    }

    updatePriceRange() {
        if (this.products.length === 0) return;

        const prices = this.products.map(p => p.price).filter(p => p > 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const rangeMin = document.getElementById('rangeMin');
        const rangeMax = document.getElementById('rangeMax');
        const currentMinPrice = document.getElementById('currentMinPrice');
        const currentMaxPrice = document.getElementById('currentMaxPrice');
        
        if (minPriceInput) {
            minPriceInput.placeholder = minPrice;
            minPriceInput.min = minPrice;
        }
        if (maxPriceInput) {
            maxPriceInput.placeholder = maxPrice;
            maxPriceInput.max = maxPrice;
        }
        if (rangeMin) {
            rangeMin.min = minPrice;
            rangeMin.max = maxPrice;
            rangeMin.value = minPrice;
        }
        if (rangeMax) {
            rangeMax.min = minPrice;
            rangeMax.max = maxPrice;
            rangeMax.value = maxPrice;
        }
        if (currentMinPrice) currentMinPrice.textContent = this.formatPrice(minPrice);
        if (currentMaxPrice) currentMaxPrice.textContent = this.formatPrice(maxPrice);

        this.filters.price.min = minPrice;
        this.filters.price.max = maxPrice;
    }

    setupEventListeners() {
        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.closest('.view-btn').dataset.view);
            });
        });

        // Sort select
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortProducts(e.target.value);
            });
        }

        // Load more
        const loadMoreBtn = document.getElementById('loadMore');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProducts();
            });
        }

        // Reset filters
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Search filter
        const searchFilter = document.getElementById('searchFilter');
        const clearSearchBtn = document.getElementById('clearSearch');
        
        if (searchFilter) {
            searchFilter.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                this.debounceSearch(() => {
                    this.filters.search = value.toLowerCase();
                    
                    // Показываем/скрываем кнопку очистки
                    if (clearSearchBtn) {
                        clearSearchBtn.style.display = value ? 'block' : 'none';
                    }
                    
                    this.applyFiltersWithNotification();
                });
            });
            
            // Очистка поиска
            if (clearSearchBtn) {
                clearSearchBtn.addEventListener('click', () => {
                    searchFilter.value = '';
                    this.filters.search = '';
                    clearSearchBtn.style.display = 'none';
                    this.applyFiltersWithNotification();
                });
            }
        }

        // Price range inputs
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const rangeMin = document.getElementById('rangeMin');
        const rangeMax = document.getElementById('rangeMax');
        
        if (minPriceInput) {
            minPriceInput.addEventListener('input', (e) => {
                this.debouncePriceFilter(() => {
                    const value = parseInt(e.target.value) || this.filters.price.min;
                    this.filters.price.min = value;
                    if (rangeMin) rangeMin.value = value;
                    this.updatePriceDisplay();
                    this.applyFiltersWithNotification();
                });
            });
        }

        if (maxPriceInput) {
            maxPriceInput.addEventListener('input', (e) => {
                this.debouncePriceFilter(() => {
                    const value = parseInt(e.target.value) || this.filters.price.max;
                    this.filters.price.max = value;
                    if (rangeMax) rangeMax.value = value;
                    this.updatePriceDisplay();
                    this.applyFiltersWithNotification();
                });
            });
        }

        if (rangeMin) {
            rangeMin.addEventListener('input', (e) => {
                this.filters.price.min = parseInt(e.target.value);
                if (minPriceInput) minPriceInput.value = this.filters.price.min;
                this.updatePriceDisplay();
                this.applyFiltersWithNotification();
            });
        }

        if (rangeMax) {
            rangeMax.addEventListener('input', (e) => {
                this.filters.price.max = parseInt(e.target.value);
                if (maxPriceInput) maxPriceInput.value = this.filters.price.max;
                this.updatePriceDisplay();
                this.applyFiltersWithNotification();
            });
        }

        // Quick filters
        document.querySelectorAll('.quick-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.handleQuickFilter(e.target.dataset.filter);
            });
        });

        // Clear individual filters
        document.querySelectorAll('.filter-clear').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                this.clearFilterGroup(filterType);
            });
        });
    }

    updatePriceDisplay() {
        const currentMinPrice = document.getElementById('currentMinPrice');
        const currentMaxPrice = document.getElementById('currentMaxPrice');
        
        if (currentMinPrice) currentMinPrice.textContent = this.formatPrice(this.filters.price.min);
        if (currentMaxPrice) currentMaxPrice.textContent = this.formatPrice(this.filters.price.max);
    }

    debouncePriceFilter(callback) {
        clearTimeout(this.priceDebounceTimer);
        this.priceDebounceTimer = setTimeout(callback, 500);
    }

    debounceSearch(callback) {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(callback, 300);
    }

    setupProductNavigation() {
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard && !e.target.closest('.product-actions') && !e.target.closest('.add-to-cart-btn')) {
                const productId = productCard.getAttribute('data-id');
                if (productId) {
                    this.navigateToProduct(productId);
                }
            }
        });
    }

    // Переход на страницу товара
    navigateToProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Товар не найден:', productId);
            this.showNotification('Товар не найден', 'error');
            return;
        }

        // Добавляем в историю просмотров
        this.addToRecentlyViewed(product);

        console.log('🔗 Переход к товару:', product.name);
        
        const productUrl = this.getProductUrl(product);
        
        this.showNotification(`Переход к товару: ${product.name}`, 'info');
        
        setTimeout(() => {
            window.location.href = productUrl;
        }, 500);
    }

    // Генерация URL для товара
    getProductUrl(product) {
        // Если у товара есть прямой link, используем его
        if (product.link) {
            return product.link;
        }
        
        // Иначе генерируем URL на основе slug и ID
        const baseUrl = window.location.origin;
        const slug = product.slug || this.generateSlug(product.name);
        
        // Пробуем разные варианты URL
        const possibleUrls = [
            `/product/${slug}-${product.id}`,
            `/product/${product.id}`,
            `/product/${slug}`,
            `/products/${product.id}`,
            `/item/${product.id}`,
            `/product.html?id=${product.id}`,
            `/product-details.html?id=${product.id}`
        ];
        
        // Возвращаем первый существующий путь или первый вариант по умолчанию
        return baseUrl + possibleUrls[0];
    }

    setupFilters() {
        // Categories
        document.querySelectorAll('input[name="category"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateArrayFilter('categories', e.target.value, e.target.checked);
            });
        });

        // Materials
        document.querySelectorAll('input[name="material"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateArrayFilter('materials', e.target.value, e.target.checked);
            });
        });

        // Colors
        document.querySelectorAll('input[name="color"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateArrayFilter('colors', e.target.value, e.target.checked);
            });
        });

        // Style
        document.querySelectorAll('input[name="style"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateArrayFilter('style', e.target.value, e.target.checked);
            });
        });

        // Features
        document.querySelectorAll('input[name="feature"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateArrayFilter('features', e.target.value, e.target.checked);
            });
        });

        // Availability
        document.querySelectorAll('input[name="availability"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateArrayFilter('availability', e.target.value, e.target.checked);
            });
        });
    }

    updateArrayFilter(filterType, value, isChecked) {
        if (isChecked) {
            this.filters[filterType].push(value);
        } else {
            this.filters[filterType] = this.filters[filterType].filter(item => item !== value);
        }
        this.applyFiltersWithNotification();
    }

    // Анимации при фильтрации
    async applyFiltersWithNotification() {
        clearTimeout(this.filterDebounceTimer);
        
        // Показываем анимацию фильтрации
        this.showFilteringAnimation();
        
        this.filterDebounceTimer = setTimeout(() => {
            this.applyFilters();
            this.showFilterNotification();
            this.updateActiveFiltersCount();
            this.updateSelectedFilters();
            this.updateUrlParams();
            
            // Обновляем счетчик с анимацией
            this.animateResultsCount();
        }, 300);
    }

    showFilteringAnimation() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        grid.classList.add('filtering');
        
        // Показываем скелетоны вместо товаров
        this.showSkeletonLoading();
    }

    showSkeletonLoading() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        const skeletonCount = 8;
        let skeletonHTML = '';
        
        for (let i = 0; i < skeletonCount; i++) {
            skeletonHTML += `
                <div class="product-skeleton animate-fade-in-up" style="animation-delay: ${i * 0.1}s">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line medium"></div>
                        <div class="skeleton-line" style="width: 40%"></div>
                        <div class="skeleton-line" style="width: 60%"></div>
                    </div>
                </div>
            `;
        }
        
        grid.innerHTML = skeletonHTML;
    }

    animateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.classList.add('filter-counter');
            setTimeout(() => {
                countElement.classList.remove('filter-counter');
            }, 500);
        }
    }

    applyFilters() {
        if (this.products.length === 0) return;
        
        console.log('🔍 Applying filters:', this.filters);
        
        this.filteredProducts = this.products.filter(product => {
            // Search filter
            if (this.filters.search && !product.name.toLowerCase().includes(this.filters.search)) {
                return false;
            }

            // Price filter
            if (product.price < this.filters.price.min || product.price > this.filters.price.max) {
                return false;
            }

            // Categories filter
            if (this.filters.categories.length > 0 && !this.filters.categories.includes(product.category)) {
                return false;
            }

            // Materials filter
            if (this.filters.materials.length > 0 && !product.materials.some(material => this.filters.materials.includes(material))) {
                return false;
            }

            // Colors filter
            if (this.filters.colors.length > 0 && !product.colors.some(color => this.filters.colors.includes(color))) {
                return false;
            }

            // Style filter
            if (this.filters.style.length > 0 && !product.style.some(style => this.filters.style.includes(style))) {
                return false;
            }

            // Features filter
            if (this.filters.features.length > 0 && !product.features.some(feature => this.filters.features.includes(feature))) {
                return false;
            }

            // Availability filter
            if (this.filters.availability.length > 0) {
                if (this.filters.availability.includes('in_stock') && !product.inStock) {
                    return false;
                }
                if (this.filters.availability.includes('pre_order') && product.inStock) {
                    return false;
                }
                if (this.filters.availability.includes('fast_delivery') && !product.inStock) {
                    return false;
                }
            }

            return true;
        });

        this.currentPage = 1;
        this.renderProducts();
    }

    handleQuickFilter(filterType) {
        document.querySelectorAll('.quick-filter').forEach(f => f.classList.remove('active'));
        event.target.classList.add('active');

        this.resetFilters();

        switch (filterType) {
            case 'new':
                this.filters.features = ['new'];
                break;
            case 'sale':
                this.filters.features = ['sale'];
                break;
            case 'in_stock':
                this.filters.availability = ['in_stock'];
                break;
            case 'bestsellers':
                this.filters.features = ['sale'];
                break;
        }

        this.updateFilterInputs();
        this.applyFiltersWithNotification();
    }

    updateFilterInputs() {
        // Update checkboxes based on current filters
        Object.keys(this.filters).forEach(filterType => {
            if (Array.isArray(this.filters[filterType])) {
                this.filters[filterType].forEach(value => {
                    const checkbox = document.querySelector(`input[name="${filterType}"][value="${value}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        });
    }

    clearFilterGroup(filterType) {
        this.filters[filterType] = [];
        
        // Uncheck all checkboxes in this group
        document.querySelectorAll(`input[name="${filterType}"]`).forEach(checkbox => {
            checkbox.checked = false;
        });

        if (filterType === 'price') {
            this.filters.price.min = 0;
            this.filters.price.max = 100000;
            const minPriceInput = document.getElementById('minPrice');
            const maxPriceInput = document.getElementById('maxPrice');
            const rangeMin = document.getElementById('rangeMin');
            const rangeMax = document.getElementById('rangeMax');
            
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';
            if (rangeMin) rangeMin.value = 0;
            if (rangeMax) rangeMax.value = 100000;
            this.updatePriceDisplay();
        }

        this.applyFiltersWithNotification();
    }

    updateActiveFiltersCount() {
        const countElement = document.getElementById('activeFiltersCount');
        if (!countElement) return;

        let activeCount = 0;

        // Count array filters
        Object.keys(this.filters).forEach(key => {
            if (Array.isArray(this.filters[key]) && this.filters[key].length > 0) {
                activeCount += this.filters[key].length;
            }
        });

        // Count price filter if not default
        if (this.filters.price.min > 0 || this.filters.price.max < 100000) {
            activeCount++;
        }

        // Count search filter
        if (this.filters.search) {
            activeCount++;
        }

        countElement.textContent = activeCount;
        countElement.style.display = activeCount > 0 ? 'flex' : 'none';
    }

    updateSelectedFilters() {
        const container = document.getElementById('selectedFilters');
        if (!container) return;

        container.innerHTML = '';

        // Price filter
        if (this.filters.price.min > 0 || this.filters.price.max < 100000) {
            const pill = document.createElement('div');
            pill.className = 'filter-pill';
            pill.innerHTML = `
                Цена: ${this.formatPrice(this.filters.price.min)} - ${this.formatPrice(this.filters.price.max)}
                <button onclick="catalog.clearFilterGroup('price')">×</button>
            `;
            container.appendChild(pill);
        }

        // Search filter
        if (this.filters.search) {
            const pill = document.createElement('div');
            pill.className = 'filter-pill';
            pill.innerHTML = `
                Поиск: "${this.filters.search}"
                <button onclick="catalog.filters.search = ''; catalog.applyFiltersWithNotification()">×</button>
            `;
            container.appendChild(pill);
        }

        // Array filters
        const arrayFilters = ['categories', 'materials', 'colors', 'style', 'features', 'availability'];
        arrayFilters.forEach(filterType => {
            this.filters[filterType].forEach(value => {
                const pill = document.createElement('div');
                pill.className = 'filter-pill';
                const displayName = this.getFilterDisplayName(filterType, value);
                pill.innerHTML = `
                    ${displayName}
                    <button onclick="catalog.removeArrayFilter('${filterType}', '${value}')">×</button>
                `;
                container.appendChild(pill);
            });
        });
    }

    removeArrayFilter(filterType, value) {
        this.filters[filterType] = this.filters[filterType].filter(item => item !== value);
        const checkbox = document.querySelector(`input[name="${filterType}"][value="${value}"]`);
        if (checkbox) checkbox.checked = false;
        this.applyFiltersWithNotification();
    }

    getFilterDisplayName(filterType, value) {
        const names = {
            categories: {
                'sofas': 'Диваны и кресла',
                'tables': 'Столы',
                'chairs': 'Стулья',
                'beds': 'Кровати',
                'storage': 'Системы хранения'
            },
            materials: {
                'wood': 'Дерево',
                'metal': 'Металл',
                'fabric': 'Ткань',
                'leather': 'Кожа',
                'glass': 'Стекло',
                'plastic': 'Пластик',
                'marble': 'Мрамор'
            },
            colors: {
                'white': 'Белый',
                'black': 'Черный',
                'brown': 'Коричневый',
                'gray': 'Серый',
                'beige': 'Бежевый',
                'navy': 'Темно-синий',
                'green': 'Зеленый',
                'blue': 'Синий'
            },
            style: {
                'modern': 'Современный',
                'classic': 'Классический',
                'scandinavian': 'Скандинавский',
                'industrial': 'Лофт',
                'minimalism': 'Минимализм'
            },
            features: {
                'new': 'Новинки',
                'sale': 'Распродажа',
                'eco': 'Экологичные',
                'smart': 'Умная мебель',
                'ergonomic': 'Эргономичная',
                'modular': 'Модульная'
            },
            availability: {
                'in_stock': 'В наличии',
                'pre_order': 'Под заказ',
                'fast_delivery': 'Быстрая доставка'
            }
        };

        return names[filterType]?.[value] || value;
    }

    showFilterNotification() {
        if (this.currentNotification) {
            this.currentNotification.remove();
            this.currentNotification = null;
        }
        
        if (this.filteredProducts.length > 0) {
            this.showNotification(`Найдено ${this.filteredProducts.length} товаров`, 'success');
        } else {
            this.showNotification('Товары не найдены. Попробуйте изменить фильтры.', 'info');
        }
    }

    sortProducts(sortBy) {
        if (this.filteredProducts.length === 0) return;
        
        console.log('📊 Sorting by:', sortBy);
        
        switch (sortBy) {
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default: // popular
                this.filteredProducts.sort((a, b) => (b.isHit ? 1 : 0) - (a.isHit ? 1 : 0));
        }
        this.renderProducts();
        this.showNotification(`Сортировка: ${this.getSortName(sortBy)}`, 'info');
    }

    getSortName(sortBy) {
        const sortNames = {
            'popular': 'По популярности',
            'price-asc': 'По возрастанию цены',
            'price-desc': 'По убыванию цены',
            'newest': 'Сначала новинки',
            'name': 'По названию'
        };
        return sortNames[sortBy] || sortBy;
    }

    toggleView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.className = `products-grid ${view}-view`;
        }

        this.renderProducts();
        this.showNotification(`Вид: ${view === 'grid' ? 'Сетка' : 'Список'}`, 'info');
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        // Убираем анимацию фильтрации
        grid.classList.remove('filtering');

        if (this.products.length === 0) {
            grid.innerHTML = this.getEmptyStateHTML();
            this.toggleLoadMoreButton(false);
            return;
        }

        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(0, startIndex + this.productsPerPage);

        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = this.filteredProducts.length;
        }

        if (productsToShow.length === 0) {
            grid.innerHTML = this.getEmptyStateHTML();
            this.toggleLoadMoreButton(false);
            return;
        }

        // Если это первая страница - заменяем весь контент
        if (this.currentPage === 1) {
            grid.innerHTML = productsToShow.map((product, index) => 
                this.getProductHTML(product, index)
            ).join('');
        } else {
            // Если это подгрузка - добавляем новые товары
            const newProducts = this.filteredProducts.slice(startIndex, startIndex + this.productsPerPage);
            const newProductsHTML = newProducts.map((product, index) => 
                this.getProductHTML(product, startIndex + index)
            ).join('');
            
            grid.insertAdjacentHTML('beforeend', newProductsHTML);
        }

        this.setupProductActions();
        this.toggleLoadMoreButton(this.filteredProducts.length > startIndex + this.productsPerPage);
        
        // Прокручиваем к новым товарам если это не первая страница
        if (this.currentPage > 1) {
            this.scrollToNewProducts();
        }
    }

    // Прокрутка к новым товарам
    scrollToNewProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        const productCards = grid.querySelectorAll('.product-card');
        if (productCards.length === 0) return;

        // Находим первый товар текущей страницы
        const firstNewProductIndex = (this.currentPage - 1) * this.productsPerPage;
        const firstNewProduct = productCards[firstNewProductIndex];
        
        if (firstNewProduct) {
            setTimeout(() => {
                firstNewProduct.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 100);
        }
    }

    toggleLoadMoreButton(show) {
        const loadMoreBtn = document.getElementById('loadMore');
        if (loadMoreBtn) {
            if (show) {
                loadMoreBtn.style.display = 'flex';
                loadMoreBtn.disabled = false;
                loadMoreBtn.innerHTML = `
                    <span>Показать еще товары</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M12 19L5 12M12 19L19 12" 
                              stroke="currentColor" stroke-width="2" 
                              stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
    }

    // Плавная подгрузка товаров
    async loadMoreProducts() {
        if (this.isLoading) return;
        
        const loadMoreBtn = document.getElementById('loadMore');
        if (!loadMoreBtn) return;

        this.isLoading = true;
        
        // Показываем состояние загрузки
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = `
            <span>Загрузка...</span>
            <div class="loading-spinner-small"></div>
        `;

        try {
            // Имитируем задержку загрузки для лучшего UX
            await new Promise(resolve => setTimeout(resolve, 800));
            
            this.currentPage++;
            this.renderProducts();
            
            const loadedCount = Math.min(
                this.currentPage * this.productsPerPage, 
                this.filteredProducts.length
            );
            
            this.showNotification(`Загружено ${loadedCount} из ${this.filteredProducts.length} товаров`, 'info');
            
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            this.showNotification('Ошибка загрузки товаров', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    getProductHTML(product, index) {
        const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
        
        return `
            <div class="product-card animate-fade-in-up" data-id="${product.id}" style="animation-delay: ${index * 0.1}s">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                    <div class="product-badges">
                        ${product.isNew ? '<span class="product-badge badge-new">Новинка</span>' : ''}
                        ${product.isHit ? '<span class="product-badge badge-hit">Хит</span>' : ''}
                        ${discount > 0 ? `<span class="product-badge badge-sale">-${discount}%</span>` : ''}
                        ${!product.inStock ? '<span class="product-badge badge-out">Под заказ</span>' : ''}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn favorite-btn" data-product="${product.id}" title="В избранное">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" 
                                      fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="product-content">
                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <div class="product-stock ${product.inStock ? 'stock-in' : 'stock-out'}">
                            ${product.inStock ? `В наличии: ${product.stock} шт.` : 'Под заказ'}
                        </div>
                    </div>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="current-price">${this.formatPrice(product.price)}</span>
                            ${product.oldPrice ? `<span class="old-price">${this.formatPrice(product.oldPrice)}</span>` : ''}
                        </div>
                        <button class="add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}' 
                                ${!product.inStock ? 'disabled' : ''} title="${product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.1 15.9 4.5 17 5.4 17H17M17 17C16.5 17 16 17.5 16 18C16 18.5 16.5 19 17 19C17.5 19 18 18.5 18 18C18 17.5 17.5 17 17 17ZM9 18C9 18.5 8.5 19 8 19C7.5 19 7 18.5 7 18C7 17.5 7.5 17 8 17C8.5 17 9 17.5 9 18Z" 
                                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${product.inStock ? 'В корзину' : 'Нет в наличии'}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    getCategoryName(category) {
        const categories = {
            'sofas': 'Диваны и кресла',
            'tables': 'Столы',
            'chairs': 'Стулья',
            'beds': 'Кровати',
            'storage': 'Системы хранения'
        };
        return categories[category] || category;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3 class="empty-state-title">Товары не найдены</h3>
                <p class="empty-state-description">
                    ${this.products.length === 0 
                        ? 'Нет данных о товарах. Проверьте подключение к базе данных.' 
                        : 'Попробуйте изменить параметры фильтрации или сбросить фильтры'}
                </p>
                ${this.products.length === 0 ? '' : `
                <button class="btn btn-primary" onclick="catalog.resetFilters()">
                    <span>Сбросить фильтры</span>
                </button>
                `}
            </div>
        `;
    }

    setupProductActions() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productData = e.target.closest('.add-to-cart-btn').dataset.product;
                try {
                    const product = JSON.parse(productData);
                    this.addToCart(product);
                } catch (error) {
                    console.error('Error parsing product data:', error);
                }
            });
        });

        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = e.target.closest('.favorite-btn').dataset.product;
                this.toggleFavorite(productId);
            });
        });
    }

    addToCart(product) {
        if (window.addToCart) {
            window.addToCart({
                id: product.id,
                title: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
            this.showNotification('Товар добавлен в корзину', 'success');
        } else {
            console.log('Добавление в корзину:', product);
            this.showNotification('Товар добавлен в корзину', 'success');
        }
    }

    toggleFavorite(productId) {
        const btn = document.querySelector(`.favorite-btn[data-product="${productId}"]`);
        if (btn) {
            btn.classList.toggle('active');
            const isActive = btn.classList.contains('active');
            this.showNotification(isActive ? 'Добавлено в избранное' : 'Удалено из избранного', 'success');
        }
    }

    // Умные подсказки при поиске
    setupSearchSuggestions() {
        const searchInput = document.getElementById('searchFilter');
        const suggestions = document.getElementById('searchSuggestions');
        const suggestionsList = document.getElementById('suggestionsList');
        
        if (!searchInput || !suggestions) return;

        // Загружаем недавние поиски
        this.recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');

        searchInput.addEventListener('focus', () => {
            this.showSuggestions();
        });

        searchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            if (value.length > 0) {
                this.updateSuggestions(value);
            } else {
                this.showDefaultSuggestions();
            }
        });

        // Закрытие подсказок при клике вне
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-search')) {
                suggestions.classList.remove('active');
            }
        });

        // Навигация клавишами
        searchInput.addEventListener('keydown', (e) => {
            this.handleSuggestionNavigation(e);
        });
    }

    showSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions) {
            suggestions.classList.add('active');
            this.showDefaultSuggestions();
        }
    }

    showDefaultSuggestions() {
        const suggestionsList = document.getElementById('suggestionsList');
        if (!suggestionsList) return;

        let html = '';

        // Недавние поиски
        if (this.recentSearches.length > 0) {
            this.recentSearches.slice(0, 3).forEach(search => {
                html += `<div class="suggestion-item recent" data-search="${search}">${search}</div>`;
            });
        }

        // Популярные поиски
        this.popularSearches.forEach(search => {
            if (!this.recentSearches.includes(search)) {
                html += `<div class="suggestion-item popular" data-search="${search}">${search}</div>`;
            }
        });

        suggestionsList.innerHTML = html;
        this.setupSuggestionClick();
    }

    updateSuggestions(query) {
        const suggestionsList = document.getElementById('suggestionsList');
        if (!suggestionsList) return;

        const filtered = this.products
            .filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5);

        let html = '';

        filtered.forEach(product => {
            html += `<div class="suggestion-item" data-search="${product.name}">${product.name}</div>`;
        });

        // Добавляем популярные, если мало результатов
        if (filtered.length < 3) {
            this.popularSearches.forEach(search => {
                if (search.includes(query.toLowerCase())) {
                    html += `<div class="suggestion-item popular" data-search="${search}">${search}</div>`;
                }
            });
        }

        suggestionsList.innerHTML = html || '<div class="suggestion-item">Ничего не найдено</div>';
        this.setupSuggestionClick();
    }

    setupSuggestionClick() {
        const suggestions = document.querySelectorAll('.suggestion-item');
        suggestions.forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                const searchText = suggestion.getAttribute('data-search');
                this.selectSuggestion(searchText);
            });
        });
    }

    selectSuggestion(searchText) {
        const searchInput = document.getElementById('searchFilter');
        if (searchInput) {
            searchInput.value = searchText;
            this.filters.search = searchText.toLowerCase();
            this.applyFiltersWithNotification();
            this.hideSuggestions();
            
            // Сохраняем в историю
            this.saveToSearchHistory(searchText);
        }
    }

    handleSuggestionNavigation(e) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        const activeSuggestion = document.querySelector('.suggestion-item.active');
        let index = Array.from(suggestions).indexOf(activeSuggestion);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            index = (index + 1) % suggestions.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            index = index <= 0 ? suggestions.length - 1 : index - 1;
        } else if (e.key === 'Enter' && activeSuggestion) {
            e.preventDefault();
            this.selectSuggestion(activeSuggestion.getAttribute('data-search'));
            return;
        }

        suggestions.forEach(s => s.classList.remove('active'));
        if (suggestions[index]) {
            suggestions[index].classList.add('active');
        }
    }

    hideSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions) {
            suggestions.classList.remove('active');
        }
    }

    saveToSearchHistory(searchText) {
        this.recentSearches = this.recentSearches.filter(s => s !== searchText);
        this.recentSearches.unshift(searchText);
        this.recentSearches = this.recentSearches.slice(0, 5);
        localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    }

    // История просмотренных товаров
    setupRecentlyViewed() {
        this.recentlyViewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        this.updateRecentlyViewedSection();
    }

    addToRecentlyViewed(product) {
        // Удаляем если уже есть
        this.recentlyViewed = this.recentlyViewed.filter(p => p.id !== product.id);
        
        // Добавляем в начало
        this.recentlyViewed.unshift({
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            category: product.category
        });
        
        // Ограничиваем количество
        this.recentlyViewed = this.recentlyViewed.slice(0, 6);
        
        // Сохраняем
        localStorage.setItem('recently_viewed', JSON.stringify(this.recentlyViewed));
        
        // Обновляем отображение
        this.updateRecentlyViewedSection();
    }

    updateRecentlyViewedSection() {
        const section = document.getElementById('recentlyViewed');
        const grid = document.getElementById('recentlyViewedGrid');
        
        if (!section || !grid) return;

        if (this.recentlyViewed.length > 0) {
            section.classList.add('has-items');
            
            grid.innerHTML = this.recentlyViewed.map((product, index) => `
                <div class="product-card" data-id="${product.id}" style="animation-delay: ${index * 0.1}s">
                    <div class="view-history-badge">${index + 1}</div>
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-content">
                        <div class="product-category">${this.getCategoryName(product.category)}</div>
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">
                            <span class="current-price">${this.formatPrice(product.price)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Настраиваем клики
            this.setupRecentlyViewedClicks();
        } else {
            section.classList.remove('has-items');
        }
    }

    setupRecentlyViewedClicks() {
        document.querySelectorAll('#recentlyViewedGrid .product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.getAttribute('data-id');
                this.navigateToProduct(productId);
            });
        });
    }

    clearRecentlyViewed() {
        this.recentlyViewed = [];
        localStorage.removeItem('recently_viewed');
        this.updateRecentlyViewedSection();
        this.showNotification('История просмотров очищена', 'success');
    }

    // Голосовой поиск
    setupVoiceSearch() {
        const voiceBtn = document.getElementById('voiceSearchBtn');
        const searchInput = document.getElementById('searchFilter');
        
        if (!voiceBtn || !searchInput) return;

        // Проверяем поддержку голосового ввода
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            voiceBtn.style.display = 'none';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'ru-RU';

        voiceBtn.addEventListener('click', () => {
            if (voiceBtn.classList.contains('listening')) {
                this.stopVoiceSearch();
            } else {
                this.startVoiceSearch();
            }
        });

        this.recognition.onstart = () => {
            voiceBtn.classList.add('listening');
            this.showNotification('Слушаю... Говорите сейчас', 'info');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            this.filters.search = transcript.toLowerCase();
            this.applyFiltersWithNotification();
            this.showNotification(`Найдено по запросу: "${transcript}"`, 'success');
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showNotification('Ошибка распознавания речи', 'error');
        };

        this.recognition.onend = () => {
            voiceBtn.classList.remove('listening');
        };
    }

    startVoiceSearch() {
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.showNotification('Не удалось начать запись', 'error');
        }
    }

    stopVoiceSearch() {
        this.recognition.stop();
    }

    showLoadingState(show) {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            if (show) {
                loadingState.classList.add('active');
            } else {
                loadingState.classList.remove('active');
            }
        }
    }

    updateUrlParams() {
        const params = new URLSearchParams();
        
        if (this.filters.search) params.set('search', this.filters.search);
        if (this.filters.categories.length) params.set('categories', this.filters.categories.join(','));
        if (this.filters.price.min > 0) params.set('min_price', this.filters.price.min);
        if (this.filters.price.max < 100000) params.set('max_price', this.filters.price.max);
        
        const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }

    resetFilters() {
        this.filters = {
            search: '',
            price: { min: 0, max: 100000 },
            categories: [],
            materials: [],
            colors: [],
            style: [],
            features: [],
            availability: []
        };

        // Reset all inputs
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
            input.value = '';
        });

        // Скрываем кнопку очистки поиска
        const clearSearchBtn = document.getElementById('clearSearch');
        if (clearSearchBtn) {
            clearSearchBtn.style.display = 'none';
        }

        // Скрываем подсказки
        this.hideSuggestions();

        const rangeMin = document.getElementById('rangeMin');
        const rangeMax = document.getElementById('rangeMax');
        if (rangeMin) rangeMin.value = 0;
        if (rangeMax) rangeMax.value = 100000;

        this.updatePriceRange();
        this.applyFilters();
        this.showNotification('Все фильтры сброшены', 'success');
    }

    showNotification(message, type = 'success') {
        if (this.currentNotification) {
            this.currentNotification.remove();
            this.currentNotification = null;
        }

        const notification = document.createElement('div');
        notification.className = `catalog-notification ${type}`;
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
        this.currentNotification = notification;
        
        setTimeout(() => {
            if (notification.parentNode && notification === this.currentNotification) {
                notification.classList.add('hide');
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                        this.currentNotification = null;
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Инициализация каталога
document.addEventListener('DOMContentLoaded', () => {
    window.catalog = new CatalogManager();
});