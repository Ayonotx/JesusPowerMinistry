<?php
/**
 * Admin chrome.
 */
declare(strict_types=1);

function nav_items(): array
{
    return [
        'dashboard.php'     => ['Dashboard', 'M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z'],
        'events.php'        => ['Events', 'M3 5h18v16H3zM8 3v4M16 3v4M3 10h18'],
        'media.php'         => ['Photos', 'M3 4h18v16H3zM8.5 9.5a1.5 1.5 0 1 0 0-.01M4 18l5-5 4.5 4.5L17 13l3 3.5'],
        'announcements.php' => ['Announcements', 'M4 10v4h3l6 4V6L7 10zM17 9a4 4 0 0 1 0 6'],
        'account.php'       => ['Account', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'],
    ];
}

function admin_header(string $title, string $active = ''): void
{
    $user = current_user();
    ?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title><?= e($title) ?> · JPSMRC Admin</title>
<link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/admin.css?v=20261110g">
</head>
<body class="admin">
<a class="skip" href="#content">Skip to content</a>
<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M6.5 8.5h11"/></svg>
      <div>
        <strong>JPSMRC</strong>
        <span>Content admin</span>
      </div>
    </div>
    <nav aria-label="Admin sections">
      <?php foreach (nav_items() as $file => [$label, $path]): ?>
        <a href="<?= e($file) ?>" class="<?= $file === $active ? 'active' : '' ?>"<?= $file === $active ? ' aria-current="page"' : '' ?>>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="<?= e($path) ?>"/></svg>
          <span><?= e($label) ?></span>
        </a>
      <?php endforeach; ?>
    </nav>
    <div class="sidebar-foot">
      <a href="../index.html" target="_blank" rel="noopener">View site ↗</a>
      <a href="logout.php">Sign out</a>
    </div>
  </aside>
  <main class="main" id="content">
    <header class="topbar">
      <h1><?= e($title) ?></h1>
      <span class="who">Signed in as <strong><?= e($user ?? '') ?></strong></span>
    </header>
    <?php
}

function admin_footer(): void
{
    ?>
  </main>
</div>
<script src="assets/admin.js?v=20261110g" defer></script>
</body>
</html>
<?php
}

function flash(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function render_flashes(): void
{
    if (empty($_SESSION['flash'])) {
        return;
    }
    foreach ($_SESSION['flash'] as $item) {
        $type = in_array($item['type'], ['ok', 'warn', 'error'], true) ? $item['type'] : 'ok';
        echo '<div class="alert alert--' . e($type) . '">' . e($item['message']) . '</div>';
    }
    unset($_SESSION['flash']);
}
