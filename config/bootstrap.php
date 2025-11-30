<?php

declare(strict_types=1);

/**
 * Lightweight project bootstrap providing environment loading, session helpers
 * and common utilities for secure PHP scripts.
 */

// Load environment variables from a local .env file when present
(function (): void {
    $envPath = __DIR__ . '/../.env';
    if (!is_readable($envPath)) {
        return;
    }

    $env = parse_ini_file($envPath, false, INI_SCANNER_TYPED);
    if (!is_array($env)) {
        return;
    }

    foreach ($env as $key => $value) {
        if (getenv((string) $key) === false) {
            putenv($key . '=' . $value);
        }
    }
})();

function env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }

    return $value;
}

function requireEnv(string $key): string
{
    $value = env($key);
    if ($value === null || $value === '') {
        throw new RuntimeException("Environment variable {$key} is not set");
    }

    return $value;
}

function ensureSession(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start([
            'cookie_httponly' => true,
            'cookie_samesite' => 'Lax',
            'use_strict_mode' => true,
        ]);
    }
}

function getCsrfToken(): string
{
    ensureSession();

    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    if (!headers_sent()) {
        setcookie('XSRF-TOKEN', $_SESSION['csrf_token'], [
            'path' => '/',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => false,
            'samesite' => 'Lax',
        ]);
    }

    return (string) $_SESSION['csrf_token'];
}

function validateCsrfToken(?string $token): bool
{
    ensureSession();
    if (empty($_SESSION['csrf_token']) || $token === null) {
        return false;
    }

    return hash_equals($_SESSION['csrf_token'], (string) $token);
}

function jsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sanitizeString(string $value): string
{
    return trim(strip_tags($value));
}

function getRequestHeader(string $name): ?string
{
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return $_SERVER[$key] ?? null;
}
