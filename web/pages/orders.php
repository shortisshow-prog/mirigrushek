<?php
require_manage();

$rows = db()->query(
    "SELECT o.id, o.order_date, o.delivery_date, o.receive_code,
            pp.address      AS pickup,
            cu.full_name    AS client,
            os.name         AS status,
            GROUP_CONCAT(CONCAT(oi.product_article, ' ×', oi.quantity) SEPARATOR ', ') AS items
     FROM Orders o
     LEFT JOIN PickupPoints  pp ON pp.id = o.pickup_point_id
     LEFT JOIN Users         cu ON cu.id = o.client_user_id
     JOIN      OrderStatuses os ON os.id = o.status_id
     LEFT JOIN OrderItems    oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.id"
)->fetchAll();

layout_header('Заказы');
?>
<?php if (is_admin()): ?>
  <p><a class="btn accent" href="index.php?page=order_edit">+ Новый заказ</a></p>
<?php endif; ?>
<table>
  <tr>
    <th>№</th><th>Артикулы заказа</th><th>Статус</th><th>Адрес пункта выдачи</th>
    <th>Дата заказа</th><th>Дата доставки</th><th>Клиент</th><th>Код</th>
    <?php if (is_admin()): ?><th>Действия</th><?php endif; ?>
  </tr>
  <?php foreach ($rows as $o): ?>
    <tr>
      <td><?= (int)$o['id'] ?></td>
      <td><?= e($o['items']) ?></td>
      <td><?= e($o['status']) ?></td>
      <td><?= e($o['pickup']) ?></td>
      <td><?= e($o['order_date'] ?: '—') ?></td>
      <td><?= e($o['delivery_date'] ?: '—') ?></td>
      <td><?= e($o['client']) ?></td>
      <td><?= e($o['receive_code']) ?></td>
      <?php if (is_admin()): ?>
        <td style="white-space:nowrap">
          <a class="btn" href="index.php?page=order_edit&id=<?= (int)$o['id'] ?>">Изменить</a>
          <a class="btn" href="index.php?page=order_delete&id=<?= (int)$o['id'] ?>"
             onclick="return confirm('Удалить заказ №<?= (int)$o['id'] ?>?');">Удалить</a>
        </td>
      <?php endif; ?>
    </tr>
  <?php endforeach; ?>
  <?php if (!$rows): ?><tr><td colspan="9">Заказов нет.</td></tr><?php endif; ?>
</table>
<?php layout_footer();
