<?php

declare(strict_types=1);

require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/config/database.php';

try {
    $pdo = createPdoConnection();
} catch (RuntimeException $e) {
    http_response_code(500);
    exit('❌ Ошибка подключения к БД');
}
