// Парсер CSV для структуры Woodville
class CSVParser {
    constructor() {
        this.products = [];
    }

    // Основной метод парсинга CSV
    parseCSV(csvText) {
        console.log('Начало парсинга CSV...');
        
        try {
            const lines = this.splitCSVLines(csvText);
            if (lines.length < 2) {
                throw new Error('CSV файл пуст или содержит только заголовки');
            }

            const headers = this.parseCSVLine(lines[0]);
            console.log('Заголовки CSV:', headers);
            console.log('Всего строк в CSV:', lines.length);

            this.products = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                
                try {
                    const values = this.parseCSVLine(lines[i]);
                    const product = this.mapToProduct(values, headers);
                    if (product && product.article) {
                        this.products.push(product);
                    }
                } catch (error) {
                    console.warn(`Ошибка парсинга строки ${i + 1}:`, error);
                }

                // Логируем прогресс
                if (i % 100 === 0) {
                    console.log(`Обработано ${i} строк...`);
                }
            }

            console.log(`Успешно распаршено ${this.products.length} товаров`);
            return this.products;

        } catch (error) {
            console.error('Ошибка парсинга CSV:', error);
            throw error;
        }
    }

    // Разделение CSV на строки с учетом кавычек
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

    // Парсинг одной строки CSV
    parseCSVLine(line) {
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Экранированная кавычка
                    currentValue += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        values.push(currentValue.trim());
        return values;
    }

    // Преобразование CSV данных в объект товара
    mapToProduct(values, headers) {
        if (values.length < headers.length) {
            console.warn('Количество значений не совпадает с заголовками', values);
            return null;
        }

        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        // Пропускаем пустые строки
        if (!row['Артикул'] && !row['Модель'] && !row['Категория1']) {
            return null;
        }

        // Парсим остатки
        const stockMsk = this.parseStock(row['Остатки склад МСК']);
        const stockUfa = this.parseStock(row['Остатки склад Уфа']);
        const totalStock = stockMsk + stockUfa;

        // Получаем основное изображение
        const mainImage = this.getMainImage(row);

        // Формируем категорию
        const category = [row['Категория1'], row['Категория2'], row['Категория3']]
            .filter(Boolean)
            .join(' / ');

        // Парсим цену
        const price = this.parsePrice(row);

        // Создаем объект товара
        const product = {
            id: row['Артикул'] || this.generateId(),
            article: row['Артикул'] || '',
            name: this.generateProductName(row),
            description: row['Описание'] || row['Описание ОПТ'] || '',
            price: price,
            originalPrice: price,
            category: category,
            inStock: totalStock > 0,
            stock: totalStock,
            stockMsk: stockMsk,
            stockUfa: stockUfa,
            image: mainImage,
            images: this.getAllImages(row),
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
            createdDate: row['Дата создания'] || '',
            deliveryDate: row['Дата поступления на склад МСК'] || ''
        };

        return product;
    }

    // Генерация названия товара
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

    // Парсинг остатков
    parseStock(stockValue) {
        if (!stockValue || stockValue === 'null' || stockValue === 'undefined' || stockValue === 'NaN') return 0;
        const stock = parseInt(stockValue);
        return isNaN(stock) ? 0 : Math.max(0, stock);
    }

    // Парсинг цены
    parsePrice(row) {
        // Пытаемся найти цену в различных колонках
        const priceColumns = ['Цена', 'МРЦ', 'Цена МРЦ', 'Price'];
        for (const col of priceColumns) {
            if (row[col] && !isNaN(parseFloat(row[col]))) {
                return Math.round(parseFloat(row[col]));
            }
        }
        
        // Если цена не найдена, генерируем случайную для демонстрации
        return Math.round(Math.random() * 50000) + 5000;
    }

    // Парсинг веса
    parseWeight(weightValue) {
        if (!weightValue) return 0;
        // Убираем лишние кавычки и пробелы
        const cleanWeight = weightValue.toString().replace(/["=]/g, '').trim();
        const weight = parseFloat(cleanWeight);
        return isNaN(weight) ? 0 : weight;
    }

    // Получение главного изображения
    getMainImage(row) {
        const imageColumns = ['Фото1', 'Изображения', 'Фото'];
        for (const col of imageColumns) {
            if (row[col] && row[col].startsWith('http')) {
                return row[col].split(',')[0].trim(); // Берем первое изображение
            }
        }
        return 'https://via.placeholder.com/300x200?text=No+Image';
    }

    // Получение всех изображений
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
                    const imageList = row[col].split(',').map(img => img.trim()).filter(img => 
                        img.startsWith('http') && !images.includes(img)
                    );
                    images.push(...imageList);
                } else if (row[col].startsWith('http') && !images.includes(row[col])) {
                    images.push(row[col]);
                }
            }
        }

        // Убираем дубликаты и ограничиваем количество
        return [...new Set(images)].slice(0, 10);
    }

    // Генерация ID если нет артикула
    generateId() {
        return 'prod_' + Math.random().toString(36).substr(2, 9);
    }

    // Экспорт в CSV
    exportToCSV(products) {
        const headers = [
            'Артикул', 'Название', 'Цена', 'Категория', 'Остатки', 
            'Производитель', 'Страна', 'Материал', 'Цвет'
        ];
        
        const csvContent = [
            headers.join(','),
            ...products.map(product => [
                product.article,
                `"${product.name.replace(/"/g, '""')}"`,
                product.price,
                `"${product.category.replace(/"/g, '""')}"`,
                product.stock,
                `"${product.manufacturer.replace(/"/g, '""')}"`,
                `"${product.country.replace(/"/g, '""')}"`,
                `"${product.material.replace(/"/g, '""')}"`,
                `"${product.color.replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');
        
        return csvContent;
    }
}

// Создаем глобальный экземпляр парсера
window.csvParser = new CSVParser();