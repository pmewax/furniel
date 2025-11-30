<?php

declare(strict_types=1);

require_once __DIR__ . '/config/bootstrap.php';

ensureSession();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

if (!validateCsrfToken(getRequestHeader('X-CSRF-Token'))) {
    jsonResponse(['success' => false, 'error' => 'Неверный CSRF-токен'], 403);
}

$recipient = env('ORDER_RECIPIENT');
if (!$recipient || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'error' => 'Получатель писем не настроен'], 500);
}

$fields = [
    'name' => sanitizeString((string) ($_POST['name'] ?? '')),
    'phone' => sanitizeString((string) ($_POST['phone'] ?? '')),
    'email' => filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL) ?: '',
    'city' => sanitizeString((string) ($_POST['city'] ?? '')),
    'address' => sanitizeString((string) ($_POST['address'] ?? '')),
    'comment' => sanitizeString((string) ($_POST['comment'] ?? '')),
    'items' => trim((string) ($_POST['items'] ?? '')),
    'total' => sanitizeString((string) ($_POST['total'] ?? '')),
];

if ($fields['name'] === '' || $fields['phone'] === '' || $fields['items'] === '') {
    jsonResponse(['success' => false, 'error' => 'Пожалуйста, заполните обязательные поля и добавьте товары'], 422);
}

if ($fields['email'] === '') {
    jsonResponse(['success' => false, 'error' => 'Укажите корректный email'], 422);
}

foreach ($fields as $key => $value) {
    if (preg_match('/\r|\n/', $value)) {
        jsonResponse(['success' => false, 'error' => 'Недопустимые символы в поле ' . $key], 400);
    }
}

$subject = 'Новая заявка с сайта Furniel';

$messageBody = [
    "<div class='header'><h1>Новая заявка с сайта Furniel</h1></div>",
    "<div class='content'>",
    "<div class='field'><span class='label'>ФИО:</span> " . htmlspecialchars($fields['name'], ENT_QUOTES, 'UTF-8') . '</div>',
    "<div class='field'><span class='label'>Телефон:</span> " . htmlspecialchars($fields['phone'], ENT_QUOTES, 'UTF-8') . '</div>',
    "<div class='field'><span class='label'>Email:</span> " . htmlspecialchars((string) $fields['email'], ENT_QUOTES, 'UTF-8') . '</div>',
    "<div class='field'><span class='label'>Город:</span> " . htmlspecialchars($fields['city'], ENT_QUOTES, 'UTF-8') . '</div>',
    "<div class='field'><span class='label'>Адрес доставки:</span> " . htmlspecialchars($fields['address'], ENT_QUOTES, 'UTF-8') . '</div>',
    "<div class='field'><span class='label'>Комментарий:</span> " . ($fields['comment'] !== '' ? htmlspecialchars($fields['comment'], ENT_QUOTES, 'UTF-8') : 'Не указан') . '</div>',
    "<div class='items'><strong>Состав заказа:</strong><br>" . nl2br(htmlspecialchars($fields['items'], ENT_QUOTES, 'UTF-8')) . '</div>',
    "<div class='total'>Общая сумма: " . htmlspecialchars($fields['total'], ENT_QUOTES, 'UTF-8') . '</div>',
    "<p><em>Для дальнейшего оформления заказа свяжитесь с клиентом для уточнения способа оплаты и доставки.</em></p>",
    '</div>',
];

$message = "<html><head><title>Новая заявка с сайта Furniel</title>" .
    '<style>body{font-family:Arial,sans-serif;} .header{background:#667eea;color:#fff;padding:20px;text-align:center;} .content{padding:20px;} .field{margin-bottom:10px;padding:8px;background:#f8f9fa;border-radius:4px;} .label{font-weight:bold;color:#667eea;display:inline-block;width:150px;} .items{background:#e9ecef;padding:15px;border-radius:4px;margin:15px 0;} .total{font-size:18px;font-weight:bold;color:#28a745;padding:10px;background:#d4edda;border-radius:4px;}</style></head><body>' .
    implode('', $messageBody) .
    '</body></html>';

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: no-reply@furniel.com',
    'Reply-To: ' . $fields['email'],
];

$sent = mail(
    $recipient,
    mb_encode_mimeheader($subject, 'UTF-8'),
    $message,
    implode("\r\n", $headers)
);

if ($sent) {
    jsonResponse(['success' => true]);
}

jsonResponse(['success' => false, 'error' => 'Произошла ошибка при отправке заявки. Попробуйте позже.'], 500);
