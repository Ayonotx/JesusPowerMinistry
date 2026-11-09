<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/auth.php';
require_login();

require_once __DIR__ . '/inc/layout.php';

$errors = [];
$done = '';

if (is_post()) {
    if (!csrf_valid()) {
        $errors[] = 'Your session expired. Please try again.';
    } else {
        [$ok, $message] = change_password(
            (string) ($_POST['current'] ?? ''),
            (string) ($_POST['new'] ?? '')
        );
        if ($ok) {
            flash('ok', $message);
            redirect('account.php');
        }
        $errors[] = $message;
    }
}

admin_header('Account', 'account.php');
render_flashes();

if ($errors): ?>
  <div class="alert alert--error" role="alert">
    <?php foreach ($errors as $message): ?><p><?= e($message) ?></p><?php endforeach; ?>
  </div>
<?php endif; ?>

<section class="panel">
  <h2>Change your password</h2>
  <p class="muted">Signed in as <strong><?= e((string) ($_SESSION['user'] ?? '')) ?></strong>. Changing the password signs out every other session.</p>
  <form method="post" action="account.php" class="form form--narrow">
    <?= csrf_field() ?>
    <div class="field">
      <label for="current">Current password</label>
      <input id="current" name="current" type="password" autocomplete="current-password" required>
    </div>
    <div class="field">
      <label for="new">New password</label>
      <input id="new" name="new" type="password" minlength="10" autocomplete="new-password" required>
      <small>At least 10 characters. A short passphrase of several words is both safer and easier to remember.</small>
    </div>
    <button class="btn btn--primary" type="submit">Update password</button>
  </form>
</section>

<section class="panel">
  <h2>Session</h2>
  <p class="muted">You are signed out automatically after two hours of inactivity.</p>
  <p><a class="btn" href="logout.php">Sign out now</a></p>
</section>
<?php
admin_footer();
