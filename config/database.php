<?php
// Centralized database configuration
// Uses environment variables to avoid committing sensitive credentials

function get_env_value(string $key, string $default = ''): string
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}

function get_database_connection(): PDO
{
    $host = get_env_value('DB_HOST', 'localhost');
    $dbname = get_env_value('DB_NAME', 'furniel');
    $user = get_env_value('DB_USER', 'furniel_user');
    $password = get_env_value('DB_PASSWORD', 'change_me');
    $charset = get_env_value('DB_CHARSET', 'utf8mb4');

    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $host, $dbname, $charset);

    return new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
