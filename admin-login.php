<?php

declare(strict_types=1);

require_once __DIR__ . '/config/bootstrap.php';

ensureSession();
$csrfToken = getCsrfToken();

$adminPasswordHash = env('ADMIN_PASSWORD_HASH');
$error = '';

if ($adminPasswordHash === null || $adminPasswordHash === '') {
    $error = 'Пароль администратора не настроен. Установите ADMIN_PASSWORD_HASH в .env';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($error)) {
    $pass = (string) ($_POST['password'] ?? '');
    $token = $_POST['csrf_token'] ?? null;

    if (!validateCsrfToken(is_string($token) ? $token : null)) {
        $error = 'Неверный CSRF-токен';
    } elseif (password_verify($pass, (string) $adminPasswordHash)) {
        $_SESSION['is_admin'] = true;
        session_regenerate_id(true);
        header('Location: /admin.php');
        exit;
    } else {
        $error = 'Неверный пароль';
    }
}
?>
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Вход в админку Furniel</title>
<style>
body {font-family: Inter, sans-serif; background: #f8fafc; display: flex; justify-content:center; align-items:center; height:100vh;}
form {background:white; padding:2rem; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);}
input {width:100%; padding:0.75rem; margin-bottom:1rem; border:1px solid #cbd5e0; border-radius:8px;}
button {background:#667eea; color:white; border:none; padding:0.75rem 1.5rem; border-radius:8px; cursor:pointer;}
.error {color:red; margin-bottom:1rem;}
</style>
</head>
<body>
<form method="post" autocomplete="off">
    <h2>Вход в админку Furniel</h2>
    <?php if (!empty($error)): ?><div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
    <input type="password" name="password" placeholder="Введите пароль" required>
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">
    <button type="submit">Войти</button>
</form>
</body>
</html>
