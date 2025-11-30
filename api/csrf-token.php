<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

ensureSession();

jsonResponse([
    'success' => true,
    'token' => getCsrfToken(),
]);
