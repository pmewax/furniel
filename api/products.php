<?php
session_start();

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = createPdoConnection();
} catch (RuntimeException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Ошибка подключения к базе данных"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$isAdmin = !empty($_SESSION['is_admin']);

if (in_array($method, ['POST', 'DELETE'], true) && !$isAdmin) {
    http_response_code(403);
    echo json_encode(["error" => "Доступ запрещен"]);
    exit;
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Нет данных"]);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO products
            (article, link, title, category, category2, price, stock, description, manufacturer, is_hit, is_new, images)
            VALUES
            (:article, :link, :title, :category, :category2, :price, :stock, :description, :manufacturer, :is_hit, :is_new, :images)
        ");

        $stmt->execute([
            ':article' => $data['article'] ?? '',
            ':link' => $data['link'] ?? '',
            ':title' => $data['title'] ?? '',
            ':category' => $data['category'] ?? '',
            ':category2' => $data['category2'] ?? '',
            ':price' => $data['price'] ?? 0,
            ':stock' => $data['stock'] ?? 0,
            ':description' => $data['description'] ?? '',
            ':manufacturer' => $data['manufacturer'] ?? '',
            ':is_hit' => $data['is_hit'] ?? 0,
            ':is_new' => $data['is_new'] ?? 0,
            ':images' => $data['images'] ?? ''
        ]);

        echo json_encode(["success" => true]);
        break;

    case 'DELETE':
        parse_str($_SERVER['QUERY_STRING'] ?? '', $params);
        $id = $params['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Не указан ID"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Метод не поддерживается"]);
}
