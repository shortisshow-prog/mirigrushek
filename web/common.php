<?php
// Общие функции: сессия, роли, единый стиль страниц (Руководство по стилю М2).
declare(strict_types=1);
require_once __DIR__ . '/db.php';

session_start();

// ----- роли -----
const ROLE_ADMIN   = 'Администратор';
const ROLE_MANAGER = 'Менеджер';
const ROLE_CLIENT  = 'Авторизированный клиент';

function current_user(): ?array { return $_SESSION['user'] ?? null; }
function role(): string         { return current_user()['role'] ?? 'Гость'; }
function is_admin(): bool        { return role() === ROLE_ADMIN; }
function is_manager(): bool      { return role() === ROLE_MANAGER; }
// фильтрация/сортировка/поиск и просмотр заказов — менеджер и администратор
function can_manage(): bool      { return is_admin() || is_manager(); }

function require_admin(): void {
    if (!is_admin()) { http_response_code(403); exit('Доступ только для администратора.'); }
}
function require_manage(): void {
    if (!can_manage()) { http_response_code(403); exit('Недостаточно прав.'); }
}

function e(?string $s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

// путь к фото товара (с заглушкой picture.png, если фото нет)
function photo_src(?string $photo): string {
    if ($photo && is_file(__DIR__ . '/images/' . $photo)) return 'images/' . rawurlencode($photo);
    return 'images/picture.png';
}

// ----- единый каркас страницы -----
function layout_header(string $title): void {
    $u = current_user();
    ?><!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="images/icon.png">
<title><?= e($title) ?> — МирИгрушек</title>
<style>
  :root{ --bg:#FFFFFF; --secondary:#F5DEB3; --accent:#DEB887; --sale:#FFDEAD; }
  *{ box-sizing:border-box; }
  body{ margin:0; font-family:Arial, Helvetica, sans-serif; background:var(--bg); color:#222; }
  header.top{ display:flex; align-items:center; gap:16px; padding:12px 24px; background:var(--secondary); border-bottom:3px solid var(--accent); }
  header.top img.logo{ height:48px; }
  header.top h1{ font-size:20px; margin:0; flex:1; }
  header.top .who{ font-size:14px; }
  nav{ display:flex; gap:8px; padding:10px 24px; background:#fff; border-bottom:1px solid #eee; flex-wrap:wrap; }
  a.btn,button.btn{ font-family:inherit; font-size:14px; text-decoration:none; color:#222; background:var(--secondary);
      border:1px solid var(--accent); padding:8px 14px; border-radius:6px; cursor:pointer; }
  a.btn.accent,button.btn.accent{ background:var(--accent); font-weight:bold; }
  main{ padding:24px; }
  .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:18px; }
  .card{ border:1px solid var(--accent); border-radius:10px; background:#fff; padding:14px; display:flex; flex-direction:column; }
  .card.sale{ background:var(--sale); }            /* скидка > 17% */
  .card img.photo{ width:100%; height:180px; object-fit:contain; background:#fafafa; border-radius:8px; }
  .card h3{ font-size:15px; margin:10px 0 6px; }
  .card .meta{ font-size:13px; color:#555; line-height:1.4; flex:1; }
  .price{ font-size:20px; font-weight:bold; margin-top:8px; }
  .price.out{ color:#d00; }                        /* нет на складе -> цена красная */
  .badge{ display:inline-block; background:var(--accent); color:#000; font-size:12px; padding:2px 8px; border-radius:10px; }
  table{ border-collapse:collapse; width:100%; background:#fff; }
  th,td{ border:1px solid var(--accent); padding:8px 10px; text-align:left; font-size:14px; }
  th{ background:var(--secondary); }
  form.bar{ display:flex; gap:10px; flex-wrap:wrap; align-items:end; margin-bottom:18px; }
  label{ font-size:13px; display:flex; flex-direction:column; gap:4px; }
  input,select,textarea{ font-family:inherit; font-size:14px; padding:7px; border:1px solid var(--accent); border-radius:6px; }
  .msg{ padding:10px 14px; border-radius:6px; background:var(--sale); border:1px solid var(--accent); margin-bottom:16px; }
</style>
</head>
<body>
<header class="top">
  <img class="logo" src="images/icon.png" alt="логотип">
  <h1><?= e($title) ?></h1>
  <div class="who">
    <?php if ($u): ?>
      <?= e($u['full_name']) ?> · <b><?= e($u['role']) ?></b>
    <?php else: ?>
      Гость
    <?php endif; ?>
  </div>
</header>
<nav>
  <a class="btn" href="index.php">Товары</a>
  <?php if (can_manage()): ?><a class="btn" href="index.php?page=orders">Заказы</a><?php endif; ?>
  <?php if (is_admin()): ?><a class="btn accent" href="index.php?page=product_edit">+ Товар</a><?php endif; ?>
  <span style="flex:1"></span>
  <?php if ($u): ?>
    <a class="btn" href="index.php?page=logout">Выйти</a>
  <?php else: ?>
    <a class="btn accent" href="index.php?page=login">Войти</a>
  <?php endif; ?>
</nav>
<main>
<?php
}

function layout_footer(): void {
    echo "</main></body></html>";
}
