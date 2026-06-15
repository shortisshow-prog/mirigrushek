<?php
// Добавление / редактирование товара (только администратор).
require_admin();

$article = $_GET['article'] ?? '';
$isEdit  = $article !== '';
$errors  = [];

$cats  = db()->query('SELECT id,name FROM Categories ORDER BY name')->fetchAll();
$sups  = db()->query('SELECT id,name FROM Suppliers ORDER BY name')->fetchAll();
$mans  = db()->query('SELECT id,name FROM Manufacturers ORDER BY name')->fetchAll();
$units = db()->query('SELECT id,name FROM Units ORDER BY name')->fetchAll();

// текущие данные
if ($isEdit) {
    $st = db()->prepare('SELECT * FROM Products WHERE article = ?');
    $st->execute([$article]);
    $p = $st->fetch();
    if (!$p) { exit('Товар не найден.'); }
} else {
    $p = ['article'=>'', 'name'=>'', 'unit_id'=>$units[0]['id'] ?? 1, 'price'=>'', 'supplier_id'=>$sups[0]['id'] ?? 1,
          'manufacturer_id'=>$mans[0]['id'] ?? 1, 'category_id'=>$cats[0]['id'] ?? 1, 'discount'=>0, 'stock_qty'=>0,
          'description'=>'', 'photo'=>null];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $p['name']            = trim($_POST['name'] ?? '');
    $p['unit_id']         = (int)($_POST['unit_id'] ?? 0);
    $p['price']           = $_POST['price'] ?? '';
    $p['supplier_id']     = (int)($_POST['supplier_id'] ?? 0);
    $p['manufacturer_id'] = (int)($_POST['manufacturer_id'] ?? 0);
    $p['category_id']     = (int)($_POST['category_id'] ?? 0);
    $p['discount']        = (int)($_POST['discount'] ?? 0);
    $p['stock_qty']       = (int)($_POST['stock_qty'] ?? 0);
    $p['description']     = trim($_POST['description'] ?? '');

    if ($p['name'] === '')                 $errors[] = 'Укажите наименование.';
    if (!is_numeric($p['price']) || (float)$p['price'] < 0) $errors[] = 'Цена не может быть отрицательной.';
    if ($p['stock_qty'] < 0)               $errors[] = 'Количество не может быть отрицательным.';
    if ($p['discount'] < 0)                $errors[] = 'Скидка не может быть отрицательной.';

    // загрузка фото (минимум 300×200 px)
    $photoName = $p['photo'];
    if (!empty($_FILES['photo']['tmp_name'])) {
        $info = @getimagesize($_FILES['photo']['tmp_name']);
        if (!$info) {
            $errors[] = 'Файл не является изображением.';
        } elseif ($info[0] < 300 || $info[1] < 200) {
            $errors[] = 'Минимальный размер изображения 300×200 пикселей (загружено '
                        . $info[0] . '×' . $info[1] . ').';
        } else {
            $ext = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION)) ?: 'jpg';
            $photoName = 'p_' . bin2hex(random_bytes(5)) . '.' . $ext;
            move_uploaded_file($_FILES['photo']['tmp_name'], __DIR__ . '/../images/' . $photoName);
        }
    }

    if (!$errors) {
        if ($isEdit) {
            $st = db()->prepare(
                'UPDATE Products SET name=?, unit_id=?, price=?, supplier_id=?, manufacturer_id=?,
                        category_id=?, discount=?, stock_qty=?, description=?, photo=? WHERE article=?');
            $st->execute([$p['name'],$p['unit_id'],$p['price'],$p['supplier_id'],$p['manufacturer_id'],
                          $p['category_id'],$p['discount'],$p['stock_qty'],$p['description'],$photoName,$article]);
        } else {
            // Артикул нового товара генерируется автоматически и не отображается при добавлении
            do {
                $newArticle = strtoupper(bin2hex(random_bytes(3)));
                $chk = db()->prepare('SELECT 1 FROM Products WHERE article=?'); $chk->execute([$newArticle]);
            } while ($chk->fetch());
            $st = db()->prepare(
                'INSERT INTO Products (article,name,unit_id,price,supplier_id,manufacturer_id,category_id,discount,stock_qty,description,photo)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?)');
            $st->execute([$newArticle,$p['name'],$p['unit_id'],$p['price'],$p['supplier_id'],$p['manufacturer_id'],
                          $p['category_id'],$p['discount'],$p['stock_qty'],$p['description'],$photoName]);
        }
        header('Location: index.php');
        exit;
    }
}

layout_header($isEdit ? 'Редактирование товара' : 'Новый товар');
?>
<div style="max-width:640px;">
  <?php foreach ($errors as $err): ?><div class="msg"><?= e($err) ?></div><?php endforeach; ?>
  <form method="post" enctype="multipart/form-data" style="display:flex; flex-direction:column; gap:12px;">
    <label>Наименование товара
      <input type="text" name="name" required value="<?= e($p['name']) ?>"></label>
    <label>Описание
      <textarea name="description" rows="3"><?= e($p['description']) ?></textarea></label>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <label>Категория
        <select name="category_id"><?php foreach ($cats as $c): ?>
          <option value="<?= (int)$c['id'] ?>" <?= $c['id']==$p['category_id']?'selected':'' ?>><?= e($c['name']) ?></option>
        <?php endforeach; ?></select></label>
      <label>Поставщик
        <select name="supplier_id"><?php foreach ($sups as $s): ?>
          <option value="<?= (int)$s['id'] ?>" <?= $s['id']==$p['supplier_id']?'selected':'' ?>><?= e($s['name']) ?></option>
        <?php endforeach; ?></select></label>
      <label>Производитель
        <select name="manufacturer_id"><?php foreach ($mans as $m): ?>
          <option value="<?= (int)$m['id'] ?>" <?= $m['id']==$p['manufacturer_id']?'selected':'' ?>><?= e($m['name']) ?></option>
        <?php endforeach; ?></select></label>
      <label>Ед. изм.
        <select name="unit_id"><?php foreach ($units as $unt): ?>
          <option value="<?= (int)$unt['id'] ?>" <?= $unt['id']==$p['unit_id']?'selected':'' ?>><?= e($unt['name']) ?></option>
        <?php endforeach; ?></select></label>
    </div>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <label>Цена, ₽
        <input type="number" step="0.01" min="0" name="price" required value="<?= e((string)$p['price']) ?>"></label>
      <label>Кол-во на складе
        <input type="number" min="0" name="stock_qty" value="<?= (int)$p['stock_qty'] ?>"></label>
      <label>Скидка, %
        <input type="number" min="0" max="100" name="discount" value="<?= (int)$p['discount'] ?>"></label>
    </div>
    <label>Фото (минимум 300×200 px)
      <input type="file" name="photo" accept="image/*"></label>
    <?php if ($isEdit && $p['photo']): ?>
      <img src="<?= e(photo_src($p['photo'])) ?>" style="max-width:200px;border:1px solid #ccc;border-radius:8px">
    <?php endif; ?>
    <div style="display:flex; gap:10px;">
      <button class="btn accent" type="submit"><?= $isEdit ? 'Сохранить' : 'Добавить' ?></button>
      <a class="btn" href="index.php">Отмена</a>
    </div>
  </form>
</div>
<?php layout_footer();
