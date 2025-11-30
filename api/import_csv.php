<?php
session_start();

// 🔒 Только для админа
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(404);
    exit('404 Not Found');
}

header('Content-Type: text/plain; charset=utf-8');

/** @var PDO $pdo */
$pdo = require __DIR__ . '/../db.php';

// ✅ Очищаем таблицу перед импортом
try {
    $pdo->exec("TRUNCATE TABLE products");
    echo "🧹 Таблица products очищена\n";
} catch (PDOException $e) {
    error_log('Не удалось очистить таблицу products: ' . $e->getMessage());
    echo "⚠️ Не удалось очистить таблицу, данные будут добавлены к существующим.\n";
}

// ✅ Путь к CSV
$uploadDir = __DIR__ . '/../uploads/';
$csvPath = $uploadDir . 'woodville_transformed_for_craftum_v2.csv';

if (!file_exists($csvPath)) {
    exit("❌ Файл не найден: $csvPath");
}

echo "📁 Путь к файлу: $csvPath\n";

// Открываем CSV
$file = fopen($csvPath, 'r');
if (!$file) exit("❌ Ошибка открытия файла");

// Читаем заголовки
$header = fgetcsv($file, 0, ',');

// Вспомогательная функция
function getValue($data, $key) {
    foreach ($data as $k => $v) {
        if (mb_strtolower(trim($k)) === mb_strtolower(trim($key))) {
            return trim($v);
        }
    }
    return '';
}

$imported = 0;
$skipped = 0;

$stmt = $pdo->prepare("
    INSERT INTO products (
        article, link, title, category, category2,
        price, stock, description, manufacturer,
        is_hit, is_new, images
    ) VALUES (
        :article, :link, :title, :category, :category2,
        :price, :stock, :description, :manufacturer,
        :is_hit, :is_new, :images
    )
");

while (($row = fgetcsv($file, 0, ',')) !== false) {
    $data = @array_combine($header, $row);
    if (!$data) { $skipped++; continue; }

    // 🔍 Извлекаем значения
    $article = getValue($data, 'Артикул');
    $link = getValue($data, 'Ссылка');
    $title = getValue($data, 'Модель');
    $category = getValue($data, 'Категория1');
    $category2 = getValue($data, 'Категория2');
    $stock = intval(getValue($data, 'Остатки склад МСК'));
    $description = getValue($data, 'Описание ОПТ');
    $manufacturer = getValue($data, 'Производитель');
    $is_hit = !empty(getValue($data, 'Хит')) ? 1 : 0;
    $is_new = !empty(getValue($data, 'Новинка')) ? 1 : 0;

    // 💰 Цена (ищем в нескольких местах)
    $price_raw = getValue($data, 'цена');
    if (!$price_raw || !is_numeric(str_replace([' ', ','], '', $price_raw))) {
        $price_raw = getValue($data, 'мрц');
        if (!$price_raw || !is_numeric(str_replace([' ', ','], '', $price_raw))) {
            if (preg_match_all('/(\d{3,})/', implode(';', $data), $m)) {
                $price_raw = end($m[1]);
            }
        }
    }

    $price_raw = str_replace(['₽', ' ', ',', '"'], '', $price_raw);
    $price = floatval($price_raw);

    // 🖼 Изображения
    $images = [];
    for ($i = 1; $i <= 20; $i++) {
        $col = "Фото$i";
        $val = getValue($data, $col);
        if (!empty($val)) $images[] = trim($val);
    }

    // Дополнительные поля
    $img_extra = getValue($data, 'Изображения');
    if (!$img_extra) $img_extra = getValue($data, 'Изображения:');
    if ($img_extra) {
        $parts = explode(',', $img_extra);
        foreach ($parts as $img) {
            $img = trim($img);
            if ($img !== '' && !in_array($img, $images)) $images[] = $img;
        }
    }

    $images_str = implode(',', $images);

    // ⚙️ Пропускаем пустые строки
    if (!$article && !$title) { $skipped++; continue; }

    try {
        $stmt->execute([
            ':article' => $article,
            ':link' => $link,
            ':title' => $title,
            ':category' => $category,
            ':category2' => $category2,
            ':price' => $price,
            ':stock' => $stock,
            ':description' => $description,
            ':manufacturer' => $manufacturer,
            ':is_hit' => $is_hit,
            ':is_new' => $is_new,
            ':images' => $images_str
        ]);
        $imported++;
    } catch (Exception $e) {
        $skipped++;
        continue;
    }
}

fclose($file);

echo "✅ Импортировано товаров: $imported\n";
echo "⚠️ Пропущено строк: $skipped\n";
?>
