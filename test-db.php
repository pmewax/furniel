<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

$stmt = $pdo->query('SELECT NOW() AS time_now');
$row = $stmt->fetch();

$time = htmlspecialchars((string) ($row['time_now'] ?? ''), ENT_QUOTES, 'UTF-8');

echo "<h2 style='color:green'>✅ Подключение успешно!</h2>";
echo "<p>Текущее время MySQL: <b>{$time}</b></p>";
