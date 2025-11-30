<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

/**
 * Returns a PDO connection using strict environment configuration.
 */
function createPdoConnection(): PDO
{
    static $pdo;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = requireEnv('DB_HOST');
    $dbname = requireEnv('DB_NAME');
    $username = requireEnv('DB_USER');
    $password = requireEnv('DB_PASSWORD');

    try {
        $pdo = new PDO(
            sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $host, $dbname),
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );

        return $pdo;
    } catch (PDOException $e) {
        error_log('Database connection failed: ' . $e->getMessage());
        throw new RuntimeException('Не удалось подключиться к базе данных', 0, $e);
    }
}
