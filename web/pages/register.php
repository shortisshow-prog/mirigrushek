<?php
// Регистрация нового пользователя (гость -> Авторизированный клиент).
$errors = [];
$fio = trim($_POST['full_name'] ?? '');
$login = trim($_POST['login'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pass  = (string)($_POST['password'] ?? '');
    $pass2 = (string)($_POST['password2'] ?? '');

    if ($fio === '')                                   $errors[] = 'Укажите ФИО.';
    if (!filter_var($login, FILTER_VALIDATE_EMAIL))    $errors[] = 'Укажите корректный e-mail (он же логин).';
    if (strlen($pass) < 6)                             $errors[] = 'Пароль не короче 6 символов.';
    if ($pass !== $pass2)                              $errors[] = 'Пароли не совпадают.';

    if (!$errors) {
        $exists = db()->prepare('SELECT 1 FROM Users WHERE login = ?');
        $exists->execute([$login]);
        if ($exists->fetch()) {
            $errors[] = 'Пользователь с таким e-mail уже существует.';
        }
    }

    if (!$errors) {
        $role = db()->prepare('SELECT id FROM Roles WHERE name = ?');
        $role->execute([ROLE_CLIENT]);
        $roleId = (int)$role->fetch()['id'];

        $ins = db()->prepare('INSERT INTO Users (role_id, full_name, login, password) VALUES (?,?,?,?)');
        $ins->execute([$roleId, $fio, $login, $pass]);

        // сразу авторизуем нового пользователя
        $_SESSION['user'] = [
            'id'        => (int)db()->lastInsertId(),
            'full_name' => $fio,
            'login'     => $login,
            'role'      => ROLE_CLIENT,
        ];
        header('Location: index.php');
        exit;
    }
}

layout_header('Регистрация');
?>
<div style="max-width:420px; margin:0 auto;">
  <?php foreach ($errors as $err): ?><div class="msg"><?= e($err) ?></div><?php endforeach; ?>
  <p>Регистрация создаёт учётную запись <b>авторизированного клиента</b> (просмотр товаров).</p>
  <form method="post" style="display:flex; flex-direction:column; gap:14px;">
    <label>ФИО
      <input type="text" name="full_name" required value="<?= e($fio) ?>"></label>
    <label>E-mail (логин)
      <input type="email" name="login" required value="<?= e($login) ?>"></label>
    <label>Пароль
      <input type="password" name="password" required minlength="6"></label>
    <label>Повторите пароль
      <input type="password" name="password2" required minlength="6"></label>
    <button class="btn accent" type="submit">Зарегистрироваться</button>
    <a class="btn" href="index.php?page=login">Уже есть аккаунт? Войти</a>
  </form>
</div>
<?php layout_footer();
