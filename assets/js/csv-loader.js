// Менеджер загрузки и управления CSV
class CSVManager {
    constructor() {
        this.products = [];
        this.storageKey = 'furniel_products';
        this.init();
    }

    init() {
        this.loadProductsFromStorage();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Drag and drop functionality
        this.setupDragAndDrop();
        // File input change
        this.setupFileInput();
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleCSVFile(files[0]);
            }
        });

        uploadArea.addEventListener('click', () => {
            document.getElementById('csvFile').click();
        });
    }

    setupFileInput() {
        const fileInput = document.getElementById('csvFile');
        if (!fileInput) return;

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleCSVFile(e.target.files[0]);
            }
        });
    }

    handleCSVFile(file) {
        if (!file.name.endsWith('.csv')) {
            this.showNotification('Пожалуйста, выберите CSV файл', 'error');
            return;
        }

        this.showNotification(`Чтение файла: ${file.name}`);

        const reader = new FileReader();
        reader.onload = (e) => {
            this.processCSVData(e.target.result, file);
        };
        reader.onerror = () => {
            this.showNotification('Ошибка чтения файла', 'error');
        };
        reader.readAsText(file, 'UTF-8');
    }

    processCSVData(csvText, file) {
        try {
            console.log('Обработка CSV данных...');
            console.log('Размер файла:', csvText.length, 'символов');
            
            let products = [];
            const startTime = Date.now();
            
            // Используем парсер CSV если доступен
            if (window.csvParser) {
                console.log('Используем advanced парсер CSV');
                products = window.csvParser.parseCSV(csvText);
            } else {
                console.log('Используем basic парсер CSV');
                products = this.basicCSVParse(csvText);
            }

            const endTime = Date.now();
            console.log(`Парсинг занял ${endTime - startTime}ms`);

            if (products.length === 0) {
                throw new Error('Не удалось извлечь товары из CSV файла');
            }

            // Анализируем результаты
            console.log('Статистика товаров:');
            console.log('- Всего товаров:', products.length);
            console.log('- С изображениями:', products.filter(p => p.image && p.image !== 'https://via.placeholder.com/300x200?text=No+Image').length);
            console.log('- В наличии:', products.filter(p => p.inStock).length);
            console.log('- С ценами:', products.filter(p => p.price > 0).length);

            this.saveProducts(products);
            this.showCSVPreview(products, file);
            this.updateStats();
            
            this.showNotification(`Успешно загружено ${products.length} товаров`, 'success');

            // Обновляем список товаров если открыта соответствующая вкладка
            if (typeof loadProductsList === 'function') {
                loadProductsList();
            }

        } catch (error) {
            console.error('Ошибка обработки CSV:', error);
            this.showNotification(`Ошибка: ${error.message}`, 'error');
        }
    }

    basicCSVParse(csvText) {
        const lines = this.splitCSVLines(csvText);
        if (lines.length < 2) {
            throw new Error('CSV файл пуст или содержит только заголовки');
        }

        const headers = this.parseCSVLine(lines[0]);
        const products = [];

        console.log(`Найдено строк в CSV: ${lines.length}`);
        console.log('Заголовки:', headers);

        for (let i = 1; i < lines.length; i++) {
            try {
                if (lines[i].trim() === '') continue;
                
                const values = this.parseCSVLine(lines[i]);
                if (values.length > 0) {
                    const product = this.createProductFromCSV(values, headers);
                    if (product && product.article) {
                        products.push(product);
                    }
                }
                
                // Логируем прогресс для больших файлов
                if (i % 100 === 0) {
                    console.log(`Обработано ${i} строк...`);
                }
            } catch (error) {
                console.warn(`Ошибка парсинга строки ${i + 1}:`, error, lines[i]);
            }
        }

        console.log(`Успешно создано ${products.length} товаров`);
        return products;
    }

    // Добавьте метод для корректного разделения строк
    splitCSVLines(csvText) {
        const lines = [];
        let currentLine = '';
        let inQuotes = false;
        
        for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            const nextChar = csvText[i + 1];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === '\n' && !inQuotes) {
                lines.push(currentLine.trim());
                currentLine = '';
                continue;
            } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
                lines.push(currentLine.trim());
                currentLine = '';
                i++; // Пропускаем следующий символ
                continue;
            }
            
            currentLine += char;
        }
        
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }
        
        return lines.filter(line => line.trim() !== '');
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    createProductFromCSV(values, headers) {
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        // Пропускаем пустые строки
        if (!row['Артикул'] && !row['Модель'] && !row['Категория1']) {
            return null;
        }

        // Базовое преобразование данных
        const article = row['Артикул'] || `prod_${Math.random().toString(36).substr(2, 9)}`;
        const name = this.generateProductName(row);
        const price = this.parsePrice(row);
        
        // Суммируем остатки со всех складов
        const stockMsk = this.parseStock(row['Остатки склад МСК']);
        const stockUfa = this.parseStock(row['Остатки склад Уфа']);
        const totalStock = stockMsk + stockUfa;

        // Получаем изображения
        const mainImage = this.getImageUrl(row);
        const allImages = this.getAllImages(row);

        return {
            id: article,
            article: article,
            name: name,
            price: price,
            originalPrice: price,
            category: [row['Категория1'], row['Категория2'], row['Категория3']].filter(Boolean).join(' / '),
            inStock: totalStock > 0,
            stock: totalStock,
            stockMsk: stockMsk,
            stockUfa: stockUfa,
            image: mainImage,
            images: allImages,
            description: row['Описание'] || row['Описание ОПТ'] || '',
            manufacturer: row['Производитель'] || '',
            country: row['Страна производства'] || '',
            material: row['Материал каркаса'] || row['Материал столешницы'] || row['Материал обивки'] || '',
            color: row['Цвет каркаса'] || row['Цвет столешницы'] || row['Цвет обивки'] || '',
            dimensions: {
                width: row['Ширина'] || '',
                depth: row['Глубина'] || '',
                height: row['Высота'] || ''
            },
            weight: this.parseWeight(row['Вес']),
            barcode: row['Штрихкод'] || '',
            isNew: row['Новинка'] === 'Да',
            isHit: row['Хит'] === 'Да',
            isPromo: row['Акция'] === 'Да',
            warranty: row['Гарантия'] || '',
            url: row['Ссылка'] || '',
            createdDate: row['Дата создания'] || new Date().toISOString().split('T')[0]
        };
    }

    // Добавьте метод для генерации названия товара
    generateProductName(row) {
        const model = row['Модель'] || '';
        const category1 = row['Категория1'] || '';
        const color = row['Цвет каркаса'] || row['Цвет столешницы'] || row['Цвет обивки'] || '';
        const manufacturer = row['Производитель'] || '';
        
        let nameParts = [];
        if (manufacturer) nameParts.push(manufacturer);
        if (category1) nameParts.push(category1);
        if (model) nameParts.push(model);
        if (color) nameParts.push(color);
        
        return nameParts.length > 0 ? nameParts.join(' ') : 'Товар без названия';
    }

    // Добавьте метод для получения всех изображений
    getAllImages(row) {
        const images = [];
        const imageColumns = [
            'Фото1', 'Фото2', 'Фото3', 'Фото4', 'Фото5', 'Фото6', 'Фото7', 'Фото8',
            'Фото9', 'Фото10', 'Фото11', 'Фото12', 'Фото13', 'Фото14', 'Фото15',
            'Фото16', 'Фото17', 'Фото18', 'Фото19', 'Фото20', 'Изображения'
        ];

        for (const col of imageColumns) {
            if (row[col] && row[col].trim()) {
                if (col === 'Изображения' && row[col].includes(',')) {
                    // Разделяем строку с изображениями
                    const imageUrls = row[col].split(',').map(img => img.trim()).filter(img => 
                        img.startsWith('http') && !images.includes(img)
                    );
                    images.push(...imageUrls);
                } else if (row[col].startsWith('http') && !images.includes(row[col])) {
                    images.push(row[col]);
                }
            }
        }

        return images.slice(0, 10); // Максимум 10 изображений
    }

    parsePrice(row) {
        // Поиск цены в различных колонках
        const priceColumns = ['Цена', 'МРЦ', 'Price', 'Цена МРЦ'];
        for (const col of priceColumns) {
            if (row[col] && !isNaN(parseFloat(row[col]))) {
                return Math.round(parseFloat(row[col]));
            }
        }
        // Демо цена если не найдена
        return Math.round(Math.random() * 50000) + 5000;
    }

    parseStock(stockValue) {
        if (!stockValue || stockValue === 'null' || stockValue === 'undefined' || stockValue === 'NaN') return 0;
        const stock = parseInt(stockValue);
        return isNaN(stock) ? 0 : Math.max(0, stock);
    }

    // Добавьте метод для парсинга веса
    parseWeight(weightValue) {
        if (!weightValue) return 0;
        // Убираем лишние кавычки и пробелы
        const cleanWeight = weightValue.toString().replace(/["=]/g, '').trim();
        const weight = parseFloat(cleanWeight);
        return isNaN(weight) ? 0 : weight;
    }

    getImageUrl(row) {
        // Поиск изображения в различных колонках
        const imageColumns = ['Фото1', 'Изображения', 'Фото'];
        for (const col of imageColumns) {
            if (row[col] && row[col].startsWith('http')) {
                return row[col].split(',')[0].trim();
            }
        }
        return 'https://via.placeholder.com/300x200?text=No+Image';
    }

    saveProducts(products) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(products));
            this.products = products;
            console.log(`Сохранено ${products.length} товаров`);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения товаров:', error);
            this.showNotification('Ошибка сохранения товаров', 'error');
            return false;
        }
    }

    loadProductsFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.products = stored ? JSON.parse(stored) : [];
            console.log(`Загружено ${this.products.length} товаров из хранилища`);
            return this.products;
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            this.products = [];
            return [];
        }
    }

    showCSVPreview(products, file) {
        const previewContainer = document.getElementById('csvPreview');
        if (!previewContainer) return;

        const previewProducts = products.slice(0, 3); // Показываем первые 3 товара

        let html = `
            <div class="csv-preview">
                <div class="preview-header">
                    <h3>Результат загрузки</h3>
                    <div class="preview-stats">
                        <span class="stat-item">
                            <strong>Файл:</strong> ${file.name}
                        </span>
                        <span class="stat-item">
                            <strong>Товаров:</strong> ${products.length}
                        </span>
                        <span class="stat-item">
                            <strong>В наличии:</strong> ${products.filter(p => p.inStock).length}
                        </span>
                    </div>
                </div>
                
                <div class="preview-products">
                    <h4>Примеры товаров:</h4>
                    <div class="preview-grid">
        `;

        previewProducts.forEach(product => {
            html += `
                <div class="preview-product-card">
                    <div class="preview-product-image">
                        <img src="${product.image}" alt="${product.name}" 
                             onerror="this.src='https://via.placeholder.com/100x80?text=No+Image'">
                    </div>
                    <div class="preview-product-info">
                        <div class="preview-product-name">${product.name}</div>
                        <div class="preview-product-details">
                            <span>Арт: ${product.article}</span>
                            <span>Цена: ${product.price.toLocaleString()} ₽</span>
                            <span class="stock-${product.inStock ? 'in' : 'out'}">
                                ${product.inStock ? `${product.stock} шт.` : 'Нет в наличии'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
                
                ${products.length > 3 ? `
                    <div class="preview-more">
                        <p>... и еще ${products.length - 3} товаров</p>
                    </div>
                ` : ''}
                
                <div class="preview-actions">
                    <button class="btn btn-primary" onclick="switchAdminTab('products')">
                        Перейти к товарам
                    </button>
                    <button class="btn btn-secondary" onclick="switchAdminTab('stats')">
                        Посмотреть статистику
                    </button>
                </div>
            </div>
        `;

        previewContainer.innerHTML = html;
    }

    updateStats() {
        const products = this.loadProductsFromStorage();
        
        const totalProducts = products.length;
        const inStockProducts = products.filter(p => p.inStock).length;
        const newProducts = products.filter(p => p.isNew).length;
        const hitProducts = products.filter(p => p.isHit).length;

        // Обновляем DOM элементы
        this.updateStatElement('totalProducts', totalProducts);
        this.updateStatElement('inStockProducts', inStockProducts);
        this.updateStatElement('newProducts', newProducts);
        this.updateStatElement('hitProducts', hitProducts);
    }

    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    clearAllProducts() {
        if (confirm('Вы уверены, что хотите удалить ВСЕ товары? Это действие нельзя отменить.')) {
            this.saveProducts([]);
            this.updateStats();
            this.showNotification('Все товары удалены', 'success');
            
            if (typeof loadProductsList === 'function') {
                loadProductsList();
            }
        }
    }

    exportToCSV() {
        const products = this.loadProductsFromStorage();
        if (products.length === 0) {
            this.showNotification('Нет товаров для экспорта', 'error');
            return;
        }

        let csvContent = 'Артикул,Название,Цена,Категория,Остатки,Статус\n';
        
        products.forEach(product => {
            const row = [
                product.article,
                `"${product.name.replace(/"/g, '""')}"`,
                product.price,
                `"${product.category.replace(/"/g, '""')}"`,
                product.stock,
                product.inStock ? 'В наличии' : 'Нет в наличии'
            ].join(',');
            csvContent += row + '\n';
        });

        // Создаем и скачиваем файл
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `furniel_products_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification(`Экспортировано ${products.length} товаров`, 'success');
    }

    showNotification(message, type = 'success') {
        // Используем существующую функцию или создаем простую реализацию
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Простая реализация уведомлений
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                background: ${type === 'error' ? '#ef4444' : '#10b981'};
                color: white;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    // Дополнительные методы для работы с товарами
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    updateProduct(updatedProduct) {
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updatedProduct };
            this.saveProducts(this.products);
            return true;
        }
        return false;
    }

    deleteProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        this.saveProducts(this.products);
        this.updateStats();
    }

    // Поиск товаров
    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.article.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    // Получение товаров по категории
    getProductsByCategory(category) {
        return this.products.filter(product => 
            product.category.toLowerCase().includes(category.toLowerCase())
        );
    }

    // Получение статистики
    getStatistics() {
        const products = this.loadProductsFromStorage();
        
        return {
            total: products.length,
            inStock: products.filter(p => p.inStock).length,
            outOfStock: products.filter(p => !p.inStock).length,
            newProducts: products.filter(p => p.isNew).length,
            hitProducts: products.filter(p => p.isHit).length,
            totalValue: products.reduce((sum, p) => sum + p.price, 0),
            categories: [...new Set(products.map(p => p.category))].length
        };
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.adminManager = new CSVManager();
    
    // Добавляем глобальные функции для кнопок
    window.exportToCSV = function() {
        if (window.adminManager) {
            window.adminManager.exportToCSV();
        }
    };
    
    window.clearProducts = function() {
        if (window.adminManager) {
            window.adminManager.clearAllProducts();
        }
    };
});

// Стили для превью CSV
const csvPreviewStyles = `
    .csv-preview {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .preview-header h3 {
        margin: 0;
        color: #1e293b;
    }
    
    .preview-stats {
        display: flex;
        gap: 20px;
    }
    
    .stat-item {
        font-size: 14px;
        color: #64748b;
    }
    
    .preview-products h4 {
        margin: 0 0 15px 0;
        color: #374151;
    }
    
    .preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .preview-product-card {
        display: flex;
        gap: 12px;
        padding: 15px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
    }
    
    .preview-product-image img {
        width: 80px;
        height: 60px;
        object-fit: cover;
        border-radius: 6px;
    }
    
    .preview-product-info {
        flex: 1;
    }
    
    .preview-product-name {
        font-weight: 600;
        margin-bottom: 8px;
        color: #1e293b;
    }
    
    .preview-product-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .preview-product-details span {
        font-size: 12px;
        color: #64748b;
    }
    
    .stock-in {
        color: #10b981;
        font-weight: 500;
    }
    
    .stock-out {
        color: #ef4444;
        font-weight: 500;
    }
    
    .preview-more {
        text-align: center;
        padding: 10px;
        color: #64748b;
        font-style: italic;
    }
    
    .preview-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }
`;

// Добавляем стили в документ
if (!document.querySelector('#csvPreviewStyles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'csvPreviewStyles';
    styleSheet.textContent = csvPreviewStyles;
    document.head.appendChild(styleSheet);
}