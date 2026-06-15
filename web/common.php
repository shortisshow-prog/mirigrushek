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
  /* Цвета строго по ТЗ (Руководство по стилю М2) */
  :root{
    --bg:#FFFFFF; --secondary:#F5DEB3; --accent:#DEB887; --sale:#FFDEAD;
    --ink:#2c2723; --muted:#8a7f72; --line:#efe7d8;
    --radius:14px; --radius-sm:10px;
    --shadow:0 1px 2px rgba(60,45,20,.05), 0 8px 24px rgba(60,45,20,.06);
    --shadow-hover:0 4px 10px rgba(60,45,20,.08), 0 16px 40px rgba(60,45,20,.10);
  }
  *{ box-sizing:border-box; }
  html{ -webkit-text-size-adjust:100%; }
  body{ margin:0; font-family:Arial, Helvetica, sans-serif; background:var(--bg); color:var(--ink);
        line-height:1.5; -webkit-font-smoothing:antialiased; }

  /* ---- Шапка ---- */
  header.top{ position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:14px;
              padding:14px 32px; background:rgba(255,255,255,.85); backdrop-filter:saturate(1.2) blur(8px);
              border-bottom:1px solid var(--line); }
  header.top img.logo{ height:40px; width:auto; display:block; }
  header.top h1{ font-size:18px; font-weight:700; letter-spacing:-.01em; margin:0; flex:1; }
  header.top .who{ font-size:13px; color:var(--muted); background:var(--secondary);
                   padding:6px 12px; border-radius:999px; white-space:nowrap; }
  header.top .who b{ color:var(--ink); font-weight:700; }

  /* ---- Навигация ---- */
  nav{ position:sticky; top:69px; z-index:19; display:flex; align-items:center; gap:8px;
       padding:12px 32px; background:rgba(255,255,255,.9); backdrop-filter:blur(8px);
       border-bottom:1px solid var(--line); flex-wrap:wrap; }

  /* ---- Кнопки ---- */
  a.btn,button.btn{ font-family:inherit; font-size:14px; line-height:1; text-decoration:none; color:var(--ink);
      background:#fff; border:1px solid var(--line); padding:10px 16px; border-radius:999px; cursor:pointer;
      transition:background .15s, border-color .15s, transform .05s, box-shadow .15s; }
  a.btn:hover,button.btn:hover{ background:var(--secondary); border-color:var(--accent); }
  a.btn:active,button.btn:active{ transform:translateY(1px); }
  a.btn.accent,button.btn.accent{ background:var(--accent); border-color:var(--accent); color:#3a2c16; font-weight:700; }
  a.btn.accent:hover,button.btn.accent:hover{ box-shadow:var(--shadow); filter:brightness(.97); }

  main{ padding:32px; max-width:1200px; margin:0 auto; }

  /* ---- Сетка карточек ---- */
  .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:20px; }
  .card{ border:1px solid var(--line); border-radius:var(--radius); background:#fff; padding:16px;
         display:flex; flex-direction:column; box-shadow:var(--shadow);
         transition:transform .18s ease, box-shadow .18s ease; }
  .card:hover{ transform:translateY(-3px); box-shadow:var(--shadow-hover); }
  .card.sale{ background:var(--sale); border-color:var(--accent); }   /* скидка > 17% — фон #FFDEAD */
  .card img.photo{ width:100%; height:190px; object-fit:contain; background:#fbf9f5;
                   border-radius:var(--radius-sm); padding:8px; }
  .card h3{ font-size:15px; font-weight:700; line-height:1.35; margin:14px 0 8px; }
  .card .meta{ font-size:13px; color:var(--muted); line-height:1.55; flex:1; }
  .card .meta small{ color:var(--muted); }
  .price{ font-size:22px; font-weight:800; letter-spacing:-.02em; margin-top:12px; }
  .price.out{ color:#e0322f; }                        /* нет на складе -> цена красная */

  .badge{ display:inline-block; background:var(--secondary); color:#5b4a31; font-size:11px; font-weight:700;
          letter-spacing:.02em; text-transform:uppercase; padding:4px 10px; border-radius:999px; margin-bottom:6px; }

  /* ---- Таблицы ---- */
  table{ border-collapse:separate; border-spacing:0; width:100%; background:#fff;
         border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow); }
  th,td{ padding:12px 14px; text-align:left; font-size:14px; border-bottom:1px solid var(--line); }
  th{ background:var(--secondary); color:#5b4a31; font-weight:700; font-size:12px;
      text-transform:uppercase; letter-spacing:.03em; }
  tr:last-child td{ border-bottom:0; }
  tbody tr:hover td{ background:#fdfbf7; }

  /* ---- Формы ---- */
  form.bar{ display:flex; gap:12px; flex-wrap:wrap; align-items:end; margin-bottom:24px;
            background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:16px; box-shadow:var(--shadow); }
  label{ font-size:13px; font-weight:600; color:var(--muted); display:flex; flex-direction:column; gap:6px; }
  input,select,textarea{ font-family:inherit; font-size:14px; color:var(--ink); padding:10px 12px;
      background:#fff; border:1px solid var(--line); border-radius:var(--radius-sm); outline:none;
      transition:border-color .15s, box-shadow .15s; }
  input:focus,select:focus,textarea:focus{ border-color:var(--accent); box-shadow:0 0 0 3px rgba(222,184,135,.35); }

  .msg{ padding:12px 16px; border-radius:var(--radius-sm); background:var(--sale);
        border:1px solid var(--accent); color:#5b4a31; margin-bottom:18px; font-size:14px; }

  h2,h3.section{ font-weight:700; letter-spacing:-.01em; }
  @media (max-width:600px){
    header.top,nav,main{ padding-left:16px; padding-right:16px; }
    nav{ top:69px; }
  }
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
