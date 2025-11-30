<?php
session_start();

// Если админ не авторизован — возвращаем 404, будто страницы нет
if (empty($_SESSION['is_admin'])) {
    header("HTTP/1.1 404 Not Found");
    echo "<!doctype html><title>404 Not Found</title><h1>404 Not Found</h1>";
    exit;
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админка — Furniel</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/header.css">
    <link rel="stylesheet" href="css/footer.css">
    <link rel="stylesheet" href="css/admin.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div id="header"></div>

    <section class="page-hero" style="padding:80px 0;background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)">
        <div class="container">
            <h1 class="hero-title" style="font-size:3rem;margin:0 0 1rem;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Админ-панель Furniel</h1>
            <p class="hero-subtitle" style="font-size:1.25rem;color:var(--text-secondary);margin:0">Управление товарами, заказами и аналитика</p>
        </div>
    </section>

    <section class="admin-panel">
        <div class="container">
            <div class="admin-tabs">
                <div class="admin-tab active" data-tab="products">
                    📦 Товары
                </div>
                <div class="admin-tab" data-tab="orders">
                    📋 Заказы
                </div>
                <div class="admin-tab" data-tab="csv">
                    📊 Загрузка CSV
                </div>
                <div class="admin-tab" data-tab="stats">
                    📈 Статистика
                </div>
            </div>
            
            <div class="admin-content active" id="products-tab">
                <h2>Управление товарами</h2>
                <div class="admin-actions">
                    <button class="btn-primary" onclick="exportToCSV()">
                        📥 Экспорт в CSV
                    </button>
                    <button class="btn-secondary" onclick="clearProducts()">
                        🗑️ Очистить товары
                    </button>
                </div>
                <div class="products-list">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Артикул</th>
                                <th>Название</th>
                                <th>Категория</th>
                                <th>Цена</th>
                                <th>Остаток</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="productsList">
                            <!-- Товары будут загружены через JS -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="admin-content" id="orders-tab">
                <h2>Управление заказами</h2>
                <div class="orders-list">
                    <div style="font-size:4rem;margin-bottom:1rem;">🚧</div>
                    <p>Функционал управления заказами находится в разработке</p>
                    <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.5rem;">Скоро здесь появится полная информация о заказах</p>
                </div>
            </div>
            
            <div class="admin-content" id="csv-tab">
                <h2>Загрузка товаров из CSV</h2>
                <div class="csv-upload">
                    <div class="upload-area" id="uploadArea">
                        <input type="file" id="csvFile" accept=".csv" style="display: none;">
                        <div class="upload-placeholder">
                            <div class="upload-icon">📁</div>
                            <p><strong>Перетащите CSV файл сюда</strong></p>
                            <p>или нажмите для выбора файла</p>
                            <p class="upload-hint">Поддерживается формат: Артикул, Название, Категория, Цена, Остатки...</p>
                        </div>
                    </div>
                    <button class="btn-primary" id="uploadCsv" style="width:100%">
                        📤 Загрузить CSV файл
                    </button>
                </div>
                <div class="csv-preview" id="csvPreview">
                    <!-- Превью CSV будет загружено через JS -->
                </div>
            </div>
            
            <div class="admin-content" id="stats-tab">
                <h2>Статистика магазина</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Всего товаров</h3>
                        <p id="totalProducts">0</p>
                    </div>
                    <div class="stat-card">
                        <h3>Товаров в наличии</h3>
                        <p id="inStockProducts">0</p>
                    </div>
                    <div class="stat-card">
                        <h3>Новинки</h3>
                        <p id="newProducts">0</p>
                    </div>
                    <div class="stat-card">
                        <h3>Хиты продаж</h3>
                        <p id="hitProducts">0</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div id="footer"></div>
    
    <script src="assets/js/include.js"></script>
    <script src="assets/js/products.js"></script>
    <script src="assets/js/csv-loader.js"></script>
    <script src="assets/js/admin.js"></script>
</body>
</html>