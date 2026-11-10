<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/auth.php';

if (is_installed()) {
    header('HTTP/1.1 403 Forbidden');
    echo '<!doctype html><meta charset="utf-8"><title>Setup complete</title>'
        . '<p style="font-family:system-ui;padding:40px">This site is already set up. '
        . '<a href="index.php">Go to the sign-in page</a>.</p>';
    exit;
}

$error = '';

if (is_post()) {
    if (!csrf_valid()) {
        $error = 'Your session expired. Please reload and try again.';
    } else {
        $password = (string) ($_POST['password'] ?? '');
        $confirm  = (string) ($_POST['confirm'] ?? '');
        if ($password !== $confirm) {
            $error = 'The two passwords do not match.';
        } else {
            [$ok, $message] = create_account((string) ($_POST['username'] ?? ''), $password);
            if ($ok) {
                [$loggedIn, ] = attempt_login((string) ($_POST['username'] ?? ''), $password);
                if ($loggedIn) {
                    flash('ok', 'Your admin account is ready. Add your first event or photograph.');
                    redirect('dashboard.php');
                }
                redirect('index.php');
            }
            $error = $message;
        }
    }
}

require_once __DIR__ . '/inc/layout.php';
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>First-time setup · JPSMRC Admin</title>
<link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/admin.css?v=20261110h">
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

  <h1>First-time setup</h1>
  <p class="muted">Create the single administrator account for this site. This page disables itself once the account exists.</p>

  <?php if ($error !== ''): ?>
    <div class="alert alert--error" role="alert"><?= e($error) ?></div>
  <?php endif; ?>

  <form method="post" action="setup.php" autocomplete="off">
    <?= csrf_field() ?>
    <div class="field">
      <label for="username">Choose a username</label>
      <input id="username" name="username" type="text" pattern="[a-zA-Z0-9._-]{3,40}" required
             value="<?= e((string) ($_POST['username'] ?? 'admin')) ?>" autocomplete="username">
      <small>3–40 characters: letters, numbers, dot, dash or underscore.</small>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" minlength="10" required autocomplete="new-password">
      <small>At least 10 characters. Use a passphrase you do not use elsewhere.</small>
    </div>
    <div class="field">
      <label for="confirm">Confirm password</label>
      <input id="confirm" name="confirm" type="password" minlength="10" required autocomplete="new-password">
    </div>
    <button class="btn btn--primary" type="submit">Create account</button>
  </form>

  <p class="auth-foot"><a href="../index.html">← Back to the website</a></p>
</main>
</body>
</html>
