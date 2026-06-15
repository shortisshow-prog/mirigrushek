<?php
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = trim($_POST['login'] ?? '');
    $pass  = (string)($_POST['password'] ?? '');
    $st = db()->prepare(
        'SELECT u.id, u.full_name, u.login, u.password, r.name AS role
         FROM Users u JOIN Roles r ON r.id = u.role_id
         WHERE u.login = ?'
    );
    $st->execute([$login]);
    $u = $st->fetch();
    if ($u && hash_equals($u['password'], $pass)) {
        unset($u['password']);
        $_SESSION['user'] = $u;
        header('Location: index.php');
        exit;
    }
    $error = 'Неверный логин или пароль.';
}

layout_header('Вход в систему');
?>
<div style="max-width:420px; margin:0 auto;">
  <?php if ($error): ?><div class="msg"><?= e($error) ?></div><?php endif; ?>
  <form method="post" style="display:flex; flex-direction:column; gap:14px;">
    <label>Логин (e-mail)
      <input type="text" name="login" required autofocus value="<?= e($_POST['login'] ?? '') ?>">
    </label>
    <label>Пароль
      <input type="password" name="password" required>
    </label>
    <button class="btn accent" type="submit">Войти</button>
    <a class="btn" href="index.php?page=register">Регистрация нового пользователя</a>
    <a class="btn" href="index.php">Войти как гость (только просмотр товаров)</a>
  </form>
</div>
<?php layout_footer();
