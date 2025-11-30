<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

ensureSession();

if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    jsonResponse(['success' => false, 'error' => 'Доступ запрещен'], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Метод не поддерживается'], 405);
}

if (!validateCsrfToken(getRequestHeader('X-CSRF-Token'))) {
    jsonResponse(['success' => false, 'error' => 'Неверный CSRF-токен'], 403);
}

try {
    $pdo = createPdoConnection();
} catch (RuntimeException $e) {
    jsonResponse(['success' => false, 'error' => 'Ошибка подключения к базе данных'], 500);
}

$uploadDir = __DIR__ . '/../uploads/';
$csvPath = $uploadDir . 'woodville_transformed_for_craftum_v2.csv';

if (!is_readable($csvPath)) {
    jsonResponse(['success' => false, 'error' => 'CSV файл не найден'], 404);
}

$imported = 0;
$skipped = 0;

try {
    $pdo->exec('TRUNCATE TABLE products');
} catch (PDOException $e) {
    // Не прерываем процесс, но логируем проблему
    error_log('Не удалось очистить таблицу products: ' . $e->getMessage());
}

if (($file = fopen($csvPath, 'r')) === false) {
    jsonResponse(['success' => false, 'error' => 'Ошибка открытия файла'], 500);
}

$header = fgetcsv($file, 0, ',');
if (!$header) {
    fclose($file);
    jsonResponse(['success' => false, 'error' => 'Не удалось прочитать заголовок CSV'], 400);
}

function getValue(array $data, string $key): string
{
    foreach ($data as $k => $v) {
        if (mb_strtolower(trim((string) $k)) === mb_strtolower(trim($key))) {
            return trim((string) $v);
        }
    }
    return '';
}

$stmt = $pdo->prepare('
    INSERT INTO products (
        article, link, title, category, category2,
        price, stock, description, manufacturer,
        is_hit, is_new, images
    ) VALUES (
        :article, :link, :title, :category, :category2,
        :price, :stock, :description, :manufacturer,
        :is_hit, :is_new, :images
    )
');

while (($row = fgetcsv($file, 0, ',')) !== false) {
    $data = @array_combine($header, $row);
    if (!$data) {
        $skipped++;
        continue;
    }

    $article = getValue($data, 'Артикул');
    $link = getValue($data, 'Ссылка');
    $title = getValue($data, 'Модель');
    $category = getValue($data, 'Категория1');
    $category2 = getValue($data, 'Категория2');
    $stock = (int) getValue($data, 'Остатки склад МСК');
    $description = getValue($data, 'Описание ОПТ');
    $manufacturer = getValue($data, 'Производитель');
    $is_hit = !empty(getValue($data, 'Хит')) ? 1 : 0;
    $is_new = !empty(getValue($data, 'Новинка')) ? 1 : 0;

    $priceRaw = getValue($data, 'цена');
    if (!$priceRaw || !is_numeric(str_replace([' ', ','], '', $priceRaw))) {
        $priceRaw = getValue($data, 'мрц');
        if (!$priceRaw || !is_numeric(str_replace([' ', ','], '', $priceRaw))) {
            if (preg_match_all('/(\d{3,})/', implode(';', $data), $matches)) {
                $priceRaw = end($matches[1]) ?: '0';
            }
        }
    }

    $price = (float) str_replace(['₽', ' ', ',', '"'], '', $priceRaw);

    $images = [];
    for ($i = 1; $i <= 20; $i++) {
        $col = "Фото{$i}";
        $val = getValue($data, $col);
        if ($val !== '') {
            $images[] = trim($val);
        }
    }

    $imgExtra = getValue($data, 'Изображения');
    if ($imgExtra === '') {
        $imgExtra = getValue($data, 'Изображения:');
    }
    if ($imgExtra !== '') {
        $parts = explode(',', $imgExtra);
        foreach ($parts as $img) {
            $img = trim($img);
            if ($img !== '' && !in_array($img, $images, true)) {
                $images[] = $img;
            }
        }
    }

    if ($article === '' && $title === '') {
        $skipped++;
        continue;
    }

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
            ':images' => implode(',', $images),
        ]);
        $imported++;
    } catch (Throwable $e) {
        $skipped++;
        continue;
    }
}

fclose($file);

jsonResponse([
    'success' => true,
    'imported' => $imported,
    'skipped' => $skipped,
]);
