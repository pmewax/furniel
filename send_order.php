<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из формы
    $name = htmlspecialchars($_POST['name']);
    $phone = htmlspecialchars($_POST['phone']);
    $email = htmlspecialchars($_POST['email']);
    $city = htmlspecialchars($_POST['city']);
    $address = htmlspecialchars($_POST['address']);
    $comment = htmlspecialchars($_POST['comment']);
    $items = htmlspecialchars($_POST['items']);
    $total = htmlspecialchars($_POST['total']);
    
    // Email получателя (замените на ваш email)
    $to = "your-email@furniel.com";
    
    // Тема письма
    $subject = "Новая заявка с сайта Furniel";
    
    // Сообщение
    $message = "
    <html>
    <head>
        <title>Новая заявка с сайта Furniel</title>
        <style>
            body { font-family: Arial, sans-serif; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .field { margin-bottom: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px; }
            .label { font-weight: bold; color: #667eea; display: inline-block; width: 150px; }
            .items { background: #e9ecef; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .total { font-size: 18px; font-weight: bold; color: #28a745; padding: 10px; background: #d4edda; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>Новая заявка с сайта Furniel</h1>
        </div>
        <div class='content'>
            <div class='field'><span class='label'>ФИО:</span> $name</div>
            <div class='field'><span class='label'>Телефон:</span> $phone</div>
            <div class='field'><span class='label'>Email:</span> $email</div>
            <div class='field'><span class='label'>Город:</span> $city</div>
            <div class='field'><span class='label'>Адрес доставки:</span> $address</div>
            <div class='field'><span class='label'>Комментарий:</span> " . ($comment ? $comment : 'Не указан') . "</div>
            
            <div class='items'>
                <strong>Состав заказа:</strong><br>
                " . nl2br($items) . "
            </div>
            
            <div class='total'>
                Общая сумма: $total
            </div>
            
            <p><em>Для дальнейшего оформления заказа свяжитесь с клиентом для уточнения способа оплаты и доставки.</em></p>
        </div>
    </body>
    </html>
    ";
    
    // Заголовки
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: no-reply@furniel.com" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n";
    
    // Отправка письма
    if (mail($to, $subject, $message, $headers)) {
        // Перенаправляем на страницу благодарности
        header('Location: thank-you.html');
        exit();
    } else {
        // В случае ошибки
        echo "<script>alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.'); window.history.back();</script>";
    }
} else {
    header('Location: checkout.html');
    exit();
}
?>