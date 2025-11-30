<?php
session_start();

// 🔒 Хеш пароля — замени на свой (я помогу сгенерировать)
$PASSWORD_HASH = '$2y$12$pBMvUAi5dj2EbCke6YIM0OUMD86.OIXqaMSqWcFz3vqrGnad17EoK';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pass = $_POST['password'] ?? '';
    if (password_verify($pass, $PASSWORD_HASH)) {
        $_SESSION['is_admin'] = true;
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
<form method="post">
    <h2>Вход в админку Furniel</h2>
    <?php if (!empty($error)): ?><div class="error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <input type="password" name="password" placeholder="Введите пароль" required>
    <button type="submit">Войти</button>
</form>
</body>
</html>
