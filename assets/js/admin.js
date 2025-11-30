// ======= admin.js ======

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

function initializeAdminPanel() {
    console.log('Инициализация админ-панели...');

    if (!csrfToken) {
        showNotification('Не удалось получить CSRF токен. Обновите страницу.', 'error');
    }

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchAdminTab(this.dataset.tab);
        });
    });

    loadProductsList();
    initCSVUpload();
}

// --- Переключение вкладок ---
function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab, .admin-content').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`${tabName}-tab`)?.classList.add('active');

    if (tabName === 'products') loadProductsList();
    if (tabName === 'stats') updateStats();
}

// --- Работа с API ---
async function getProducts() {
    try {
        const res = await fetch('/api/products.php');
        if (!res.ok) throw new Error('Ошибка загрузки товаров');
        const { success, data } = await res.json();
        if (!success) throw new Error('Ошибка загрузки товаров');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка загрузки товаров', 'error');
        return [];
    }
}

async function saveProduct(product) {
    try {
        const res = await fetch('/api/products.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Ошибка сохранения товара');
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Ошибка сохранения товара');
        return result;
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка сохранения товара', 'error');
        throw error;
    }
}

async function deleteProduct(id) {
    if (!confirm('Удалить этот товар?')) return;

    try {
        const res = await fetch(`/api/products.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-Token': csrfToken
            }
        });
        if (!res.ok) throw new Error('Ошибка удаления товара');
        showNotification('Товар удалён');
        loadProductsList();
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка удаления товара', 'error');
    }
}

// --- Загрузка и отображение списка ---
async function loadProductsList() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    container.innerHTML = "<tr><td colspan='7' style='text-align: center; padding: 2rem;'>Загрузка...</td></tr>";

    const products = await getProducts();

    if (products.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <div class="empty-state">
                        <p>Нет товаров</p>
                        <p>Загрузите их через вкладку "CSV"</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    let html = '';
    products.forEach(p => {
        const imageUrl = p.images ? p.images.split(',')[0] : 'https://via.placeholder.com/60x60?text=No+Image';
        const statusClass = p.stock > 0 ? 'status-active' : 'status-inactive';
        const statusText = p.stock > 0 ? 'В наличии' : 'Нет в наличии';
        
        html += `
            <tr>
                <td>${p.article || 'N/A'}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${imageUrl}" 
                             alt="${p.title}" 
                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;"
                             onerror="this.src='https://via.placeholder.com/40x40?text=No+Image'">
                        <span>${p.title || 'Без названия'}</span>
                    </div>
                </td>
                <td>${p.category || 'Не указана'}</td>
                <td>${Number(p.price || 0).toLocaleString()} ₽</td>
                <td>${p.stock || 0}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="product-actions">
                        <button class="btn-small btn-edit" onclick="editProduct(${p.id})">✏️</button>
                        <button class="btn-small btn-delete" onclick="deleteProduct(${p.id})">🗑️</button>
                    </div>
                </td>
            </tr>`;
    });
    
    container.innerHTML = html;
}

// --- Импорт CSV ---
function initCSVUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const csvFileInput = document.getElementById('csvFile');
    const uploadCsvBtn = document.getElementById('uploadCsv');

    if (!uploadArea || !csvFileInput) return;

    // Клик по области загрузки
    uploadArea.addEventListener('click', () => csvFileInput.click());
    
    // Клик по кнопке загрузки
    if (uploadCsvBtn) {
        uploadCsvBtn.addEventListener('click', () => csvFileInput.click());
    }

    // Обработка выбора файла
    csvFileInput.addEventListener('change', e => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

    // Drag & Drop
    uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
}

async function handleFileSelect(file) {
    if (!file.name.endsWith('.csv')) {
        showNotification('Выберите CSV файл', 'error');
        return;
    }

    showNotification('Начинаем импорт...', 'info');

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const csvText = e.target.result;
            const rows = csvText.split('\n').filter(row => row.trim() !== '');
            const headers = rows[0].split(';').map(h => h.trim().toLowerCase());
            const products = [];

            // Парсим CSV
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(';').map(v => v.trim());
                const product = {};
                
                headers.forEach((header, index) => {
                    product[header] = values[index] || '';
                });
                
                products.push(product);
            }

            let saved = 0;
            let errors = 0;

            // Сохраняем товары
            for (const p of products) {
                try {
await saveProduct({
  article: p['артикул'] || '',
  link: p['ссылка'] || '',
  title: `${p['префикс'] || ''} ${p['модель'] || ''}`.trim(),
  category: p['категория1'] || '',
  category2: p['категория2'] || '',
  price: parseFloat(p['с ндс'] || 0),
  stock: parseInt(p['остатки склад мск'] || 0),
  description: p['описание'] || p['описание опт'] || '',
  manufacturer: p['производитель'] || '',
  is_hit: p['хит'] === 'Да' ? 1 : 0,
  is_new: p['новинка'] === 'Да' ? 1 : 0,
  images: (() => {
    const imgs = [];
    for (let i = 1; i <= 20; i++) {
      if (p[`фото${i}`]) imgs.push(p[`фото${i}`]);
    }
    if (p['изображения']) imgs.push(...p['изображения'].split(','));
    return imgs.join(',');
  })()
});

                    saved++;
                } catch (error) {
                    console.error('Ошибка сохранения товара:', p, error);
                    errors++;
                }
            }

            if (errors > 0) {
                showNotification(`Импортировано ${saved} товаров, ошибок: ${errors}`, 'error');
            } else {
                showNotification(`Успешно импортировано ${saved} товаров!`);
            }
            
            loadProductsList();
            
        } catch (error) {
            console.error('Ошибка обработки CSV:', error);
            showNotification('Ошибка обработки CSV файла', 'error');
        }
    };

    reader.onerror = function() {
        showNotification('Ошибка чтения файла', 'error');
    };

    reader.readAsText(file, 'UTF-8');
}

// --- Статистика ---
async function updateStats() {
    try {
        const products = await getProducts();
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('inStockProducts').textContent = products.filter(p => p.stock > 0).length;
        document.getElementById('newProducts').textContent = products.filter(p => p.is_new == 1).length;
        document.getElementById('hitProducts').textContent = products.filter(p => p.is_hit == 1).length;
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// --- Дополнительные функции ---
function editProduct(id) {
    alert(`Редактирование товара ID: ${id}\n\nЭта функция будет реализована в следующем обновлении.`);
}

function exportToCSV() {
    alert('Экспорт в CSV будет реализован в следующем обновлении.');
}

// --- Импорт CSV с сервера ---
document.addEventListener('DOMContentLoaded', () => {
    const importBtn = document.getElementById('runServerImport');
    if (importBtn) {
        importBtn.addEventListener('click', async () => {
            if (!confirm('Импортировать файл woodville_transformed_for_craftum_v2.csv в базу данных?')) return;

            showNotification('Импорт запущен...', 'info');
            try {
                const res = await fetch('/api/import_csv.php', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-Token': csrfToken
                    }
                });
                const data = await res.json();

                if (data.success) {
                    showNotification(`Импортировано ${data.imported} товаров`);
                    loadProductsList();
                } else {
                    showNotification('Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
                }
            } catch (err) {
                console.error(err);
                showNotification('Ошибка при выполнении импорта', 'error');
            }
        });
    }
});

function clearProducts() {
    if (!confirm('ВНИМАНИЕ! Это удалит ВСЕ товары из базы данных. Продолжить?')) return;
    alert('Очистка товаров будет реализована в следующем обновлении.');
}

function showNotification(message, type = 'success') {
    // Удаляем существующие уведомления
    document.querySelectorAll('.custom-notification').forEach(n => n.remove());
    
    const n = document.createElement('div');
    n.className = 'custom-notification';
    n.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        padding: 12px 20px; background: ${type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#10b981'};
        color: white; border-radius: 8px; z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-weight: 500;
    `;
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 4000);
}