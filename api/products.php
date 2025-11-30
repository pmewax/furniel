<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$dbname = "cu87306_bade";
$username = "cu87306_bade";
$password = "YY17pFLM";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Ошибка подключения: " . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
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
        parse_str($_SERVER['QUERY_STRING'], $params);
        $id = $params['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["error" => "Не указан ID"]);
        }
        break;
}
