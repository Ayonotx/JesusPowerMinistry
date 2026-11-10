<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/auth.php';

if (!is_installed()) {
    redirect('setup.php');
}
if (current_user() !== null) {
    redirect('dashboard.php');
}

$error = '';

if (is_post()) {
    if (!csrf_valid()) {
        $error = 'Your session expired. Please try again.';
    } else {
        [$ok, $message] = attempt_login((string) ($_POST['username'] ?? ''), (string) ($_POST['password'] ?? ''));
        if ($ok) {
            $target = $_SESSION['return_to'] ?? 'dashboard.php';
            unset($_SESSION['return_to']);
            $target = preg_replace('/[^a-z0-9._-]/i', '', (string) $target) ?: 'dashboard.php';
            redirect($target);
        }
        $error = $message;
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Sign in · JPSMRC Admin</title>
<link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/admin.css?v=20261110g">
</head>
<body class="auth-page">
<main class="auth-card">
  <div class="auth-brand">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M6.5 8.5h11"/></svg>
    <div>
      <strong>Jesus Power</strong>
      <span>School of Ministry &amp; Retreat Center</span>
    </div>
  </div>

  <h1>Content admin</h1>
  <p class="muted">Sign in to update events, photographs and announcements.</p>

  <?php if ($error !== ''): ?>
    <div class="alert alert--error" role="alert"><?= e($error) ?></div>
  <?php endif; ?>

  <form method="post" action="index.php" autocomplete="on">
    <?= csrf_field() ?>
    <div class="field">
      <label for="username">Username</label>
      <input id="username" name="username" type="text" autocomplete="username" required autofocus>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
    </div>
    <button class="btn btn--primary" type="submit">Sign in</button>
  </form>

  <p class="auth-foot"><a href="../index.html">← Back to the website</a></p>
</main>
</body>
</html>
