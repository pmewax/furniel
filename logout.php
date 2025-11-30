<?php

declare(strict_types=1);

require_once __DIR__ . '/config/bootstrap.php';

ensureSession();
$_SESSION = [];
session_destroy();

header('Location: /');
exit;
