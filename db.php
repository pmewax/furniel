<?php
require_once __DIR__ . '/config/database.php';

try {
    $pdo = get_database_connection();
    echo "✅ Подключение к базе данных успешно!";
} catch (PDOException $e) {
    http_response_code(500);
    echo '❌ Ошибка подключения к БД: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
}
