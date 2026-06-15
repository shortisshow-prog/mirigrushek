<?php
// Добавление / редактирование заказа (только администратор).
require_admin();

$id     = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$isEdit = $id > 0;
$errors = [];

$statuses = db()->query('SELECT id,name FROM OrderStatuses ORDER BY id')->fetchAll();
$points   = db()->query('SELECT id,address FROM PickupPoints ORDER BY id')->fetchAll();
$clients  = db()->query(
    "SELECT u.id, u.full_name FROM Users u JOIN Roles r ON r.id=u.role_id
     WHERE r.name = '" . ROLE_CLIENT . "' ORDER BY u.full_name")->fetchAll();
$prodList = db()->query('SELECT article FROM Products ORDER BY article')->fetchAll(PDO::FETCH_COLUMN);

$o = ['order_date'=>'','delivery_date'=>'','pickup_point_id'=>$points[0]['id']??null,
      'client_user_id'=>$clients[0]['id']??null,'receive_code'=>'','status_id'=>$statuses[0]['id']??1];
$itemsText = '';

if ($isEdit) {
    $st = db()->prepare('SELECT * FROM Orders WHERE id=?'); $st->execute([$id]);
    $o = $st->fetch();
    if (!$o) { exit('Заказ не найден.'); }
    $it = db()->prepare('SELECT product_article, quantity FROM OrderItems WHERE order_id=?'); $it->execute([$id]);
    $itemsText = implode("\n", array_map(fn($r) => $r['product_article'].' '.$r['quantity'], $it->fetchAll()));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $o['order_date']      = $_POST['order_date']    ?: null;
    $o['delivery_date']   = $_POST['delivery_date'] ?: null;
    $o['pickup_point_id'] = (int)$_POST['pickup_point_id'];
    $o['client_user_id']  = (int)$_POST['client_user_id'];
    $o['receive_code']    = trim($_POST['receive_code'] ?? '');
    $o['status_id']       = (int)$_POST['status_id'];
    $itemsText            = trim($_POST['items'] ?? '');

    // разбор позиций: каждая строка "АРТИКУЛ КОЛИЧЕСТВО"
    $items = [];
    foreach (preg_split('/\r?\n/', $itemsText) as $line) {
        $line = trim($line);
        if ($line === '') continue;
        $parts = preg_split('/[\s,×x]+/u', $line);
        $art = strtoupper(trim($parts[0] ?? ''));
        $qty = (int)($parts[1] ?? 0);
        if (!in_array($art, $prodList, true)) { $errors[] = "Неизвестный артикул: $art"; continue; }
        if ($qty <= 0) { $errors[] = "Количество должно быть > 0 (артикул $art)"; continue; }
        $items[] = [$art, $qty];
    }
    if (!$items) $errors[] = 'Добавьте хотя бы одну позицию заказа.';

    if (!$errors) {
        $pdo = db();
        $pdo->beginTransaction();
        try {
            if ($isEdit) {
                $st = $pdo->prepare('UPDATE Orders SET order_date=?,delivery_date=?,pickup_point_id=?,client_user_id=?,receive_code=?,status_id=? WHERE id=?');
                $st->execute([$o['order_date'],$o['delivery_date'],$o['pickup_point_id'],$o['client_user_id'],$o['receive_code'],$o['status_id'],$id]);
                $pdo->prepare('DELETE FROM OrderItems WHERE order_id=?')->execute([$id]);
                $oid = $id;
            } else {
                $st = $pdo->prepare('INSERT INTO Orders (order_date,delivery_date,pickup_point_id,client_user_id,receive_code,status_id) VALUES (?,?,?,?,?,?)');
                $st->execute([$o['order_date'],$o['delivery_date'],$o['pickup_point_id'],$o['client_user_id'],$o['receive_code'],$o['status_id']]);
                $oid = (int)$pdo->lastInsertId();
            }
            $ins = $pdo->prepare('INSERT INTO OrderItems (order_id,product_article,quantity) VALUES (?,?,?)');
            foreach ($items as [$art,$qty]) $ins->execute([$oid,$art,$qty]);
            $pdo->commit();
        } catch (Throwable $ex) { $pdo->rollBack(); $errors[] = 'Ошибка сохранения: '.$ex->getMessage(); }
        if (!$errors) { header('Location: index.php?page=orders'); exit; }
    }
}

layout_header($isEdit ? "Редактирование заказа №$id" : 'Новый заказ');
?>
<div style="max-width:640px;">
  <?php foreach ($errors as $err): ?><div class="msg"><?= e($err) ?></div><?php endforeach; ?>
  <form method="post" style="display:flex; flex-direction:column; gap:12px;">
    <label>Статус заказа
      <select name="status_id"><?php foreach ($statuses as $s): ?>
        <option value="<?= (int)$s['id'] ?>" <?= $s['id']==$o['status_id']?'selected':'' ?>><?= e($s['name']) ?></option>
      <?php endforeach; ?></select></label>
    <label>Клиент
      <select name="client_user_id"><?php foreach ($clients as $c): ?>
        <option value="<?= (int)$c['id'] ?>" <?= $c['id']==$o['client_user_id']?'selected':'' ?>><?= e($c['full_name']) ?></option>
      <?php endforeach; ?></select></label>
    <label>Адрес пункта выдачи
      <select name="pickup_point_id"><?php foreach ($points as $pt): ?>
        <option value="<?= (int)$pt['id'] ?>" <?= $pt['id']==$o['pickup_point_id']?'selected':'' ?>><?= e($pt['address']) ?></option>
      <?php endforeach; ?></select></label>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <label>Дата заказа     <input type="date" name="order_date"    value="<?= e($o['order_date']) ?>"></label>
      <label>Дата доставки   <input type="date" name="delivery_date" value="<?= e($o['delivery_date']) ?>"></label>
      <label>Код для получения <input type="text" name="receive_code" value="<?= e($o['receive_code']) ?>"></label>
    </div>
    <label>Позиции заказа (по строке: <b>АРТИКУЛ КОЛИЧЕСТВО</b>)
      <textarea name="items" rows="5" placeholder="PMEZMH 2&#10;BPV4MM 1"><?= e($itemsText) ?></textarea></label>
    <small>Доступные артикулы: <?= e(implode(', ', $prodList)) ?></small>
    <div style="display:flex; gap:10px;">
      <button class="btn accent" type="submit"><?= $isEdit ? 'Сохранить' : 'Создать заказ' ?></button>
      <a class="btn" href="index.php?page=orders">Отмена</a>
    </div>
  </form>
</div>
<?php layout_footer();
