<?php
require_once __DIR__ . '/common.php';

$page = $_GET['page'] ?? (current_user() ? 'catalog' : 'login');
$routes = [
    'login'          => 'pages/login.php',
    'register'       => 'pages/register.php',
    'logout'         => 'pages/logout.php',
    'orders'         => 'pages/orders.php',
    'product_edit'   => 'pages/product_edit.php',
    'product_delete' => 'pages/product_delete.php',
    'order_edit'     => 'pages/order_edit.php',
    'order_delete'   => 'pages/order_delete.php',
];
if (isset($routes[$page])) { require __DIR__ . '/' . $routes[$page]; return; }

$manage = can_manage();

$where = [];
$args  = [];
$search = trim($_GET['q'] ?? '');
$cat    = $_GET['cat'] ?? '';
$sort   = $_GET['sort'] ?? '';

if ($manage) {
    if ($search !== '') { $where[] = 'p.name LIKE ?'; $args[] = '%' . $search . '%'; }
    if ($cat !== '' && ctype_digit((string)$cat)) { $where[] = 'p.category_id = ?'; $args[] = (int)$cat; }
}
$order = 'p.name';
if ($manage && $sort === 'price_asc')  $order = 'p.price ASC';
if ($manage && $sort === 'price_desc') $order = 'p.price DESC';

$sql = "SELECT p.*, c.name cat_name, s.name sup_name, m.name man_name, u.name unit_name
        FROM Products p
        JOIN Categories c    ON c.id = p.category_id
        JOIN Suppliers s     ON s.id = p.supplier_id
        JOIN Manufacturers m ON m.id = p.manufacturer_id
        JOIN Units u         ON u.id = p.unit_id";
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= " ORDER BY $order";
$st = db()->prepare($sql);
$st->execute($args);
$products = $st->fetchAll();

$cats = db()->query('SELECT id, name FROM Categories ORDER BY name')->fetchAll();

layout_header('Каталог товаров');

if ($manage): ?>
  <form class="bar" method="get">
    <label>Поиск по наименованию
      <input type="text" name="q" value="<?= e($search) ?>" placeholder="введите название…">
    </label>
    <label>Категория
      <select name="cat">
        <option value="">— все —</option>
        <?php foreach ($cats as $c): ?>
          <option value="<?= (int)$c['id'] ?>" <?= ((string)$cat === (string)$c['id']) ? 'selected' : '' ?>><?= e($c['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </label>
    <label>Сортировка
      <select name="sort">
        <option value="">— без сортировки —</option>
        <option value="price_asc"  <?= $sort === 'price_asc'  ? 'selected' : '' ?>>Цена ↑</option>
        <option value="price_desc" <?= $sort === 'price_desc' ? 'selected' : '' ?>>Цена ↓</option>
      </select>
    </label>
    <button class="btn accent" type="submit">Применить</button>
    <a class="btn" href="index.php?page=catalog">Сбросить</a>
  </form>
<?php endif; ?>

<div class="grid">
  <?php foreach ($products as $p):
      $discount = (int)$p['discount'];
      $price    = (float)$p['price'];
      $final    = round($price * (1 - $discount / 100), 2);
      $outStock = (int)$p['stock_qty'] === 0;
      $state    = $outStock ? 'oos' : ($discount > 17 ? 'sale' : '');
  ?>
    <div class="card <?= $state ?>">
      <img class="photo" src="<?= e(photo_src($p['photo'])) ?>" alt="<?= e($p['name']) ?>">
      <h3><?= e($p['name']) ?></h3>
      <div class="meta">
        <span class="badge"><?= e($p['cat_name']) ?></span><br>
        <?= e($p['description']) ?><br>
        <small>Поставщик: <?= e($p['sup_name']) ?> · Производитель: <?= e($p['man_name']) ?></small><br>
        <small>Артикул: <?= e($p['article']) ?> · На складе: <?= (int)$p['stock_qty'] ?> <?= e($p['unit_name']) ?> · Скидка: <?= $discount ?>%</small>
      </div>
      <div class="price">
        <?php if ($discount > 0): ?>
          <span class="old"><?= number_format($price, 2, ',', ' ') ?> ₽</span>
          <span class="new"><?= number_format($final, 2, ',', ' ') ?> ₽</span>
        <?php else: ?>
          <span class="new"><?= number_format($price, 2, ',', ' ') ?> ₽</span>
        <?php endif; ?>
      </div>
      <?php if (is_admin()): ?>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <a class="btn" href="index.php?page=product_edit&article=<?= e($p['article']) ?>">Изменить</a>
          <a class="btn" href="index.php?page=product_delete&article=<?= e($p['article']) ?>"
             onclick="return confirm('Удалить товар «<?= e(addslashes($p['name'])) ?>»?');">Удалить</a>
        </div>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
  <?php if (!$products): ?><p>Товары не найдены.</p><?php endif; ?>
</div>

<?php layout_footer();
