<?php
// db.php — подключение к встроенной MySQL на Timeweb

$host = 'localhost';          // сервер из панели
$db   = 'cu87306_bade';       // имя базы данных
$user = 'cu87306_bade';       // имя пользователя (обычно совпадает)
$pass = 'YY17pFLM';           // ваш пароль
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "✅ Подключение к базе данных успешно!";
} catch (PDOException $e) {
    die('❌ Ошибка подключения к БД: ' . $e->getMessage());
}
