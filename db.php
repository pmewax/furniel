<?php
// db.php — подключение к встроенной MySQL на Timeweb

require_once __DIR__ . '/config/database.php';

try {
    $pdo = createPdoConnection();
} catch (RuntimeException $e) {
    die('❌ Ошибка подключения к БД');
}
