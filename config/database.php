<?php

declare(strict_types=1);

/**
 * Returns a PDO connection using environment variables when available.
 */
function createPdoConnection(): PDO
{
    static $pdo;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'cu87306_bade';
    $username = getenv('DB_USER') ?: 'cu87306_bade';
    $password = getenv('DB_PASSWORD') ?: 'YY17pFLM';

    try {
        $pdo = new PDO(
            "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );

        return $pdo;
    } catch (PDOException $e) {
        error_log('Database connection failed: ' . $e->getMessage());
        throw new RuntimeException('Не удалось подключиться к базе данных', 0, $e);
    }
}
