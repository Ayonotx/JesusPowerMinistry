<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/uploads.php';
require_login();

require_once __DIR__ . '/inc/layout.php';

$store = store_read('events', ['events' => []]);
$events = is_array($store['events'] ?? null) ? $store['events'] : [];

$action = (string) ($_GET['action'] ?? 'list');
$editId = (string) ($_GET['id'] ?? '');
$errors = [];

if (is_post()) {
    if (!csrf_valid()) {
        flash('error', 'Your session expired. Please try again.');
        redirect('events.php');
    }

    $do = (string) ($_POST['do'] ?? '');

    if ($do === 'delete') {
        $id = (string) ($_POST['id'] ?? '');
        $events = array_values(array_filter($events, static fn ($row) => ($row['id'] ?? '') !== $id));
        store_write('events', ['events' => $events]);
        flash('ok', 'Event removed.');
        redirect('events.php');
    }

    if ($do === 'save') {
        $id          = trim((string) ($_POST['id'] ?? ''));
        $title       = trim((string) ($_POST['title'] ?? ''));
        $date        = trim((string) ($_POST['date'] ?? ''));
        $dateLabel   = trim((string) ($_POST['dateLabel'] ?? ''));
        $category    = trim((string) ($_POST['category'] ?? 'general'));
        $description = trim((string) ($_POST['description'] ?? ''));
        $published   = isset($_POST['published']);
        $featured    = isset($_POST['featured']);
        $image       = trim((string) ($_POST['existing_image'] ?? ''));

        if ($title === '') {
            $errors[] = 'A title is required.';
        }
        if ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $errors[] = 'Use a valid date (YYYY-MM-DD).';
        }

        if (isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            [$ok, $result] = handle_upload($_FILES['image']);
            if ($ok) {
                if ($image !== '') {
                    delete_upload($image);
                }
                $image = $result;
            } else {
                $errors[] = $result;
            }
        } elseif (isset($_POST['remove_image']) && $image !== '') {
            delete_upload($image);
            $image = '';
        }

        if (!$errors) {
            if ($id === '') {
                $base = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title) ?? 'event');
                $base = trim($base, '-') ?: 'event';
                $id = $base . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
            }

            $record = [
                'id'          => $id,
                'title'       => $title,
                'date'        => $date,
                'dateLabel'   => $dateLabel,
                'category'    => $category,
                'description' => $description,
                'image'       => $image,
                'published'   => $published,
                'featured'    => $featured,
            ];

            $found = false;
            foreach ($events as $index => $row) {
                if (($row['id'] ?? '') === $id) {
                    $events[$index] = $record;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $events[] = $record;
            }

            if (store_write('events', ['events' => $events])) {
                flash('ok', $found ? 'Event updated.' : 'Event added.');
                redirect('events.php');
            }
            $errors[] = 'Could not save the events file. Check that data/ is writable.';
        }

        $action = 'edit';
        $editId = $id;
    }
}

$editing = null;
if ($action === 'edit' || $action === 'new') {
    if ($editId !== '') {
        foreach ($events as $row) {
            if (($row['id'] ?? '') === $editId) {
                $editing = $row;
                break;
            }
        }
    }
    if ($editing === null) {
        $editing = [
            'id' => '', 'title' => '', 'date' => '', 'dateLabel' => '',
            'category' => 'general', 'description' => '', 'image' => '',
            'published' => true, 'featured' => false,
        ];
    }
}

admin_header($editing ? ($editing['id'] === '' ? 'Add event' : 'Edit event') : 'Events', 'events.php');
render_flashes();

if ($errors): ?>
  <div class="alert alert--error" role="alert">
    <?php foreach ($errors as $message): ?><p><?= e($message) ?></p><?php endforeach; ?>
  </div>
<?php endif;

if ($editing): ?>
  <form method="post" action="events.php" enctype="multipart/form-data" class="panel form">
    <?= csrf_field() ?>
    <input type="hidden" name="do" value="save">
    <input type="hidden" name="id" value="<?= e($editing['id']) ?>">
    <input type="hidden" name="existing_image" value="<?= e($editing['image']) ?>">

    <div class="field">
      <label for="title">Event title <span class="req">*</span></label>
      <input id="title" name="title" type="text" required value="<?= e($editing['title']) ?>">
    </div>

    <div class="row">
      <div class="field">
        <label for="date">Date</label>
        <input id="date" name="date" type="date" value="<?= e($editing['date']) ?>">
        <small>Leave blank for past or undated events.</small>
      </div>
      <div class="field">
        <label for="dateLabel">Date label (optional)</label>
        <input id="dateLabel" name="dateLabel" type="text" maxlength="40"
               value="<?= e($editing['dateLabel']) ?>" placeholder="e.g. Community outreach">
        <small>Shown instead of the date when no date is set.</small>
      </div>
    </div>

    <div class="field">
      <label for="category">Category</label>
      <select id="category" name="category">
        <?php foreach (['general', 'school', 'milestone', 'outreach', 'conference'] as $cat): ?>
          <option value="<?= e($cat) ?>" <?= $editing['category'] === $cat ? 'selected' : '' ?>><?= e(ucfirst($cat)) ?></option>
        <?php endforeach; ?>
      </select>
    </div>

    <div class="field">
      <label for="description">Short description</label>
      <textarea id="description" name="description" rows="4" maxlength="400"><?= e($editing['description']) ?></textarea>
    </div>

    <div class="field">
      <label for="image">Photograph</label>
      <?php if (!empty($editing['image'])): ?>
        <div class="thumb">
          <img src="../<?= e($editing['image']) ?>" alt="">
          <label class="check"><input type="checkbox" name="remove_image" value="1"> Remove this image</label>
        </div>
      <?php endif; ?>
      <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp">
      <small>JPEG, PNG or WebP · maximum 8 MB. Replacing the image deletes the old file.</small>
    </div>

    <div class="checks">
      <label class="check"><input type="checkbox" name="published" value="1" <?= $editing['published'] ? 'checked' : '' ?>> Published (visible on the website)</label>
      <label class="check"><input type="checkbox" name="featured" value="1" <?= !empty($editing['featured']) ? 'checked' : '' ?>> Feature on the home page</label>
    </div>

    <div class="form-actions">
      <button class="btn btn--primary" type="submit">Save event</button>
      <a class="btn" href="events.php">Cancel</a>
    </div>
  </form>
<?php else: ?>
  <div class="toolbar">
    <a class="btn btn--primary" href="events.php?action=new">Add event</a>
    <span class="muted"><?= count($events) ?> event(s)</span>
  </div>

  <?php if (!$events): ?>
    <div class="panel empty-state">
      <h2>No events yet</h2>
      <p class="muted">Add your first event and it will appear on the Events page and on the home page.</p>
      <a class="btn btn--primary" href="events.php?action=new">Add an event</a>
    </div>
  <?php else: ?>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Event</th><th>Date</th><th>Status</th><th class="right">Actions</th></tr>
        </thead>
        <tbody>
        <?php foreach ($events as $row): ?>
          <tr>
            <td>
              <strong><?= e($row['title'] ?? 'Untitled') ?></strong>
              <?php if (!empty($row['description'])): ?>
                <div class="tiny muted"><?= e(shorten((string) $row['description'], 90)) ?></div>
              <?php endif; ?>
            </td>
            <td><?= e(($row['date'] ?? '') !== '' ? (string) $row['date'] : (string) ($row['dateLabel'] ?? '—')) ?></td>
            <td>
              <span class="pill <?= !empty($row['published']) ? 'pill--ok' : 'pill--muted' ?>">
                <?= !empty($row['published']) ? 'Published' : 'Draft' ?>
              </span>
            </td>
            <td class="right">
              <a class="link" href="events.php?action=edit&amp;id=<?= e(rawurlencode((string) $row['id'])) ?>">Edit</a>
              <form method="post" action="events.php" class="inline" onsubmit="return confirm('Delete this event?');">
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
<?php endif;

admin_footer();
