<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/auth.php';
require_login();

require_once __DIR__ . '/inc/layout.php';

$store = store_read('announcements', ['items' => []]);
$items = is_array($store['items'] ?? null) ? $store['items'] : [];
$errors = [];

if (is_post()) {
    if (!csrf_valid()) {
        flash('error', 'Your session expired. Please try again.');
        redirect('announcements.php');
    }

    $do = (string) ($_POST['do'] ?? '');

    if ($do === 'delete') {
        $id = (string) ($_POST['id'] ?? '');
        $items = array_values(array_filter($items, static fn ($row) => ($row['id'] ?? '') !== $id));
        store_write('announcements', ['items' => $items]);
        flash('ok', 'Announcement removed.');
        redirect('announcements.php');
    }

    if ($do === 'save') {
        $id     = (string) ($_POST['id'] ?? '');
        $title  = trim((string) ($_POST['title'] ?? ''));
        $body   = trim((string) ($_POST['body'] ?? ''));
        $active = isset($_POST['active']);

        if ($title === '') {
            $errors[] = 'A title is required.';
        }

        if (!$errors) {
            $record = [
                'id'     => $id !== '' ? $id : 'a-' . bin2hex(random_bytes(5)),
                'title'  => $title,
                'body'   => $body,
                'active' => $active,
                'date'   => gmdate('c'),
            ];

            if ($active) {
                // Only one announcement is shown at a time.
                foreach ($items as $index => $row) {
                    $items[$index]['active'] = false;
                }
            }

            $found = false;
            foreach ($items as $index => $row) {
                if (($row['id'] ?? '') === $record['id']) {
                    $items[$index] = $record;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $items[] = $record;
            }

            store_write('announcements', ['items' => $items]);
            flash('ok', $found ? 'Announcement updated.' : 'Announcement added.');
            redirect('announcements.php');
        }
    }
}

$editId = (string) ($_GET['id'] ?? '');
$editing = ['id' => '', 'title' => '', 'body' => '', 'active' => false];
foreach ($items as $row) {
    if ($editId !== '' && ($row['id'] ?? '') === $editId) {
        $editing = $row;
        break;
    }
}

admin_header('Announcements', 'announcements.php');
render_flashes();

if ($errors): ?>
  <div class="alert alert--error" role="alert">
    <?php foreach ($errors as $message): ?><p><?= e($message) ?></p><?php endforeach; ?>
  </div>
<?php endif; ?>

<section class="panel">
  <h2><?= $editing['id'] === '' ? 'New announcement' : 'Edit announcement' ?></h2>
  <p class="muted">The active announcement appears in a strip on the home page. Leave it inactive to keep it as a draft.</p>
  <form method="post" action="announcements.php" class="form">
    <?= csrf_field() ?>
    <input type="hidden" name="do" value="save">
    <input type="hidden" name="id" value="<?= e((string) $editing['id']) ?>">
    <div class="field">
      <label for="title">Title <span class="req">*</span></label>
      <input id="title" name="title" type="text" required maxlength="120" value="<?= e((string) $editing['title']) ?>" placeholder="e.g. September intake now open">
    </div>
    <div class="field">
      <label for="body">Message</label>
      <textarea id="body" name="body" rows="4" maxlength="400"><?= e((string) $editing['body']) ?></textarea>
    </div>
    <label class="check"><input type="checkbox" name="active" value="1" <?= !empty($editing['active']) ? 'checked' : '' ?>> Show this announcement on the home page</label>
    <div class="form-actions">
      <button class="btn btn--primary" type="submit">Save</button>
      <?php if ($editing['id'] !== ''): ?>
        <a class="btn" href="announcements.php">Cancel</a>
      <?php endif; ?>
    </div>
  </form>
</section>

<section class="panel">
  <h2>All announcements</h2>
  <?php if (!$items): ?>
    <p class="muted">Nothing here yet.</p>
  <?php else: ?>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Title</th><th>Status</th><th class="right">Actions</th></tr></thead>
        <tbody>
        <?php foreach ($items as $row): ?>
          <tr>
            <td>
              <strong><?= e((string) $row['title']) ?></strong>
              <div class="tiny muted"><?= e(shorten((string) ($row['body'] ?? ''), 100)) ?></div>
            </td>
            <td>
              <span class="pill <?= !empty($row['active']) ? 'pill--ok' : 'pill--muted' ?>">
                <?= !empty($row['active']) ? 'Active' : 'Draft' ?>
              </span>
            </td>
            <td class="right">
              <a class="link" href="announcements.php?id=<?= e(rawurlencode((string) $row['id'])) ?>">Edit</a>
              <form method="post" action="announcements.php" class="inline" onsubmit="return confirm('Delete this announcement?');">
                <?= csrf_field() ?>
                <input type="hidden" name="do" value="delete">
                <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                <button class="link link--danger" type="submit">Delete</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</section>

<?php
admin_footer();
