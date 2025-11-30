<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

ensureSession();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = createPdoConnection();
} catch (RuntimeException $e) {
    jsonResponse(['success' => false, 'error' => 'Ошибка подключения к базе данных'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$isAdmin = !empty($_SESSION['is_admin']);

$requiresCsrf = in_array($method, ['POST', 'DELETE'], true);
if ($requiresCsrf && !validateCsrfToken(getRequestHeader('X-CSRF-Token'))) {
    jsonResponse(['success' => false, 'error' => 'Неверный CSRF-токен'], 403);
}

if (in_array($method, ['POST', 'DELETE'], true) && !$isAdmin) {
    jsonResponse(['success' => false, 'error' => 'Доступ запрещен'], 403);
}

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query('SELECT * FROM products ORDER BY id DESC');
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'POST':
            $data = json_decode((string) file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);

            $payload = [
                'article' => sanitizeString((string) ($data['article'] ?? '')),
                'link' => filter_var($data['link'] ?? '', FILTER_SANITIZE_URL),
                'title' => sanitizeString((string) ($data['title'] ?? '')),
                'category' => sanitizeString((string) ($data['category'] ?? '')),
                'category2' => sanitizeString((string) ($data['category2'] ?? '')),
                'price' => isset($data['price']) ? (float) $data['price'] : 0.0,
                'stock' => isset($data['stock']) ? (int) $data['stock'] : 0,
                'description' => trim((string) ($data['description'] ?? '')),
                'manufacturer' => sanitizeString((string) ($data['manufacturer'] ?? '')),
                'is_hit' => !empty($data['is_hit']) ? 1 : 0,
                'is_new' => !empty($data['is_new']) ? 1 : 0,
                'images' => trim((string) ($data['images'] ?? '')),
            ];

            if ($payload['title'] === '' || $payload['article'] === '') {
                jsonResponse(['success' => false, 'error' => 'Не заполнены обязательные поля'], 422);
            }

            $stmt = $pdo->prepare('
                INSERT INTO products
                (article, link, title, category, category2, price, stock, description, manufacturer, is_hit, is_new, images)
                VALUES
                (:article, :link, :title, :category, :category2, :price, :stock, :description, :manufacturer, :is_hit, :is_new, :images)
            ');

            $stmt->execute([
                ':article' => $payload['article'],
                ':link' => $payload['link'],
                ':title' => $payload['title'],
                ':category' => $payload['category'],
                ':category2' => $payload['category2'],
                ':price' => $payload['price'],
                ':stock' => $payload['stock'],
                ':description' => $payload['description'],
                ':manufacturer' => $payload['manufacturer'],
                ':is_hit' => $payload['is_hit'],
                ':is_new' => $payload['is_new'],
                ':images' => $payload['images'],
            ]);

            jsonResponse(['success' => true]);
            break;

        case 'DELETE':
            parse_str($_SERVER['QUERY_STRING'] ?? '', $params);
            $id = isset($params['id']) ? (int) $params['id'] : 0;

            if ($id <= 0) {
                jsonResponse(['success' => false, 'error' => 'Не указан ID'], 400);
            }

            $stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
            $stmt->execute([':id' => $id]);
            jsonResponse(['success' => true]);
            break;

        default:
            jsonResponse(['success' => false, 'error' => 'Метод не поддерживается'], 405);
    }
} catch (JsonException $e) {
    jsonResponse(['success' => false, 'error' => 'Невалидный JSON'], 400);
} catch (Throwable $e) {
    error_log('API error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Внутренняя ошибка сервера'], 500);
}
