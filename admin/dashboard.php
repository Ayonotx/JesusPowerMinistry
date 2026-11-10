<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/auth.php';
require_login();

require_once __DIR__ . '/inc/layout.php';

$events        = store_read('events', ['events' => []]);
$gallery       = store_read('gallery', ['items' => []]);
$announcements = store_read('announcements', ['items' => []]);

$eventCount = count($events['events'] ?? []);
$photoCount = count($gallery['items'] ?? []);
$noticeCount = count($announcements['items'] ?? []);

$uploadCount = 0;
if (is_dir(UPLOAD_DIR)) {
    foreach (scandir(UPLOAD_DIR) ?: [] as $name) {
        if ($name !== '' && $name[0] === '.') {
            continue;
        }
        if (is_file(UPLOAD_DIR . '/' . $name)) {
            $uploadCount++;
        }
    }
}

$writable = [
    'data/'                  => is_writable(DATA_DIR),
    'data/private/'          => is_writable(PRIVATE_DIR),
    'assets/img/uploads/'    => is_writable(UPLOAD_DIR),
];

admin_header('Dashboard', 'dashboard.php');
render_flashes();
?>
<div class="grid grid--stats">
  <a class="stat-card" href="events.php">
    <span class="stat-card__label">Events</span>
    <strong><?= $eventCount ?></strong>
    <span class="stat-card__hint">Add or edit dates</span>
  </a>
  <a class="stat-card" href="media.php">
    <span class="stat-card__label">Gallery photos</span>
    <strong><?= $photoCount ?></strong>
    <span class="stat-card__hint"><?= $uploadCount ?> file(s) uploaded</span>
  </a>
  <a class="stat-card" href="announcements.php">
    <span class="stat-card__label">Announcements</span>
    <strong><?= $noticeCount ?></strong>
    <span class="stat-card__hint">Shown on the home page</span>
  </a>
</div>

<section class="panel">
  <h2>What do you want to do?</h2>
  <div class="quick-actions">
    <a class="btn btn--primary" href="events.php?action=new">Add an event</a>
    <a class="btn" href="media.php">Upload photos</a>
    <a class="btn" href="announcements.php?action=new">New announcement</a>
    <a class="btn" href="account.php">Change password</a>
  </div>
</section>

<section class="panel">
  <h2>System check</h2>
  <p class="muted">If a folder is not writable, changes will not be saved. Contact your host if any of these show a red cross.</p>
  <ul class="checklist">
    <li class="<?= PHP_VERSION_ID >= 70400 ? 'ok' : 'bad' ?>">
      PHP <?= e(PHP_VERSION) ?> <?= PHP_VERSION_ID >= 70400 ? '— supported' : '— upgrade required' ?>
    </li>
    <?php foreach ($writable as $dir => $ok): ?>
      <li class="<?= $ok ? 'ok' : 'bad' ?>">
        <?= e($dir) ?> <?= $ok ? 'writable' : 'not writable' ?>
      </li>
    <?php endforeach; ?>
    <li class="<?= extension_loaded('gd') ? 'ok' : 'warn' ?>">
      GD image library <?= extension_loaded('gd') ? 'available' : 'missing (uploads are stored as-is)' ?>
    </li>
  </ul>
  <p><a href="health.php">Open the full diagnostics page</a></p>
</section>
<?php
admin_footer();
