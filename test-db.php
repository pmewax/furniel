<?php
require 'db.php';

$stmt = $pdo->query("SELECT NOW() AS time_now");
$row = $stmt->fetch();

echo "<h2 style='color:green'>✅ Подключение успешно!</h2>";
echo "<p>Текущее время MySQL: <b>" . $row['time_now'] . "</b></p>";
