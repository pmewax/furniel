<?php
$config = require __DIR__ . '/config.php';

$requiredKeys = ['db_host', 'db_name', 'db_user', 'db_pass'];
foreach ($requiredKeys as $key) {
    if (empty($config[$key])) {
        throw new RuntimeException('Database configuration is missing. Set DB_HOST, DB_NAME, DB_USER, and DB_PASS environment variables or provide them in config.php.');
    }
}

$dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $config['db_host'], $config['db_name'], $config['db_charset']);
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], $options);
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    http_response_code(500);
    exit('Ошибка подключения к базе данных. Пожалуйста, попробуйте позже.');
}

return $pdo;
