<?php
// Удаление товара (только администратор). Товар, участвующий в заказах,
// удалить нельзя — выводится понятное сообщение.
require_admin();

$article = $_GET['article'] ?? '';
if ($article === '') { header('Location: index.php'); exit; }

$used = db()->prepare('SELECT COUNT(*) c FROM OrderItems WHERE product_article = ?');
$used->execute([$article]);
if ((int)$used->fetch()['c'] > 0) {
    layout_header('Удаление товара');
    echo '<div class="msg">Нельзя удалить товар: он используется в существующих заказах.</div>';
    echo '<a class="btn" href="index.php">Назад к товарам</a>';
    layout_footer();
    return;
}

$st = db()->prepare('DELETE FROM Products WHERE article = ?');
$st->execute([$article]);
header('Location: index.php');
exit;
