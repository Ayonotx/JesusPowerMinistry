<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/uploads.php';
require_login();

require_once __DIR__ . '/inc/layout.php';

$store = store_read('gallery', ['items' => []]);
$items = is_array($store['items'] ?? null) ? $store['items'] : [];
$errors = [];

/** Turn $_FILES['photos'] into a list of single-file arrays. */
function normalise_files(array $files): array
{
    $out = [];
    if (!isset($files['name'])) {
        return $out;
    }
    if (!is_array($files['name'])) {
        return [$files];
    }
    foreach ($files['name'] as $index => $name) {
        $out[] = [
            'name'     => $name,
            'type'     => $files['type'][$index] ?? '',
            'tmp_name' => $files['tmp_name'][$index] ?? '',
            'error'    => $files['error'][$index] ?? UPLOAD_ERR_NO_FILE,
            'size'     => $files['size'][$index] ?? 0,
        ];
    }
    return $out;
}

if (is_post()) {
    if (!csrf_valid()) {
        flash('error', 'Your session expired. Please try again.');
        redirect('media.php');
    }

    $do = (string) ($_POST['do'] ?? '');

    if ($do === 'delete') {
        $id = (string) ($_POST['id'] ?? '');
        foreach ($items as $index => $row) {
            if (($row['id'] ?? '') === $id) {
                if (!empty($row['src'])) {
                    delete_upload((string) $row['src']);
                }
                unset($items[$index]);
            }
        }
        $items = array_values($items);
        store_write('gallery', ['items' => $items]);
        flash('ok', 'Photograph removed from the gallery.');
        redirect('media.php');
    }

    if ($do === 'update') {
        $id       = (string) ($_POST['id'] ?? '');
        $caption  = trim((string) ($_POST['caption'] ?? ''));
        $category = (string) ($_POST['category'] ?? 'other');
        foreach ($items as $index => $row) {
            if (($row['id'] ?? '') === $id) {
                $items[$index]['caption']  = $caption;
                $items[$index]['category'] = $category;
                $items[$index]['published'] = isset($_POST['published']);
            }
        }
        store_write('gallery', ['items' => $items]);
        flash('ok', 'Photo details updated.');
        redirect('media.php');
    }

    if ($do === 'upload') {
        $caption  = trim((string) ($_POST['caption'] ?? ''));
        $category = (string) ($_POST['category'] ?? 'other');
        $added    = 0;

        foreach (normalise_files($_FILES['photos'] ?? []) as $file) {
            if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                continue;
            }
            [$ok, $result] = handle_upload($file);
            if (!$ok) {
                $errors[] = basename((string) $file['name']) . ': ' . $result;
                continue;
            }
            $items[] = [
                'id'        => 'p-' . bin2hex(random_bytes(6)),
                'src'       => $result,
                'caption'   => $caption,
                'category'  => $category,
                'added'     => gmdate('c'),
                'published' => true,
            ];
            $added++;
        }

        if ($added > 0) {
            store_write('gallery', ['items' => $items]);
            flash('ok', $added . ' photograph(s) uploaded.');
        }
        if ($added === 0 && !$errors) {
            $errors[] = 'No images were selected.';
        }
        if (!$errors) {
            redirect('media.php');
        }
    }
}

admin_header('Photos', 'media.php');
render_flashes();

if ($errors): ?>
  <div class="alert alert--error" role="alert">
    <?php foreach ($errors as $message): ?><p><?= e($message) ?></p><?php endforeach; ?>
  </div>
<?php endif; ?>

<section class="panel">
  <h2>Upload photographs</h2>
  <form method="post" action="media.php" enctype="multipart/form-data" class="form">
    <?= csrf_field() ?>
    <input type="hidden" name="do" value="upload">
    <div class="field">
      <label for="photos">Images</label>
      <input id="photos" name="photos[]" type="file" accept="image/jpeg,image/png,image/webp" multiple required>
      <small>Up to 8 MB each · JPEG, PNG or WebP. You can select several at once.</small>
    </div>
    <div class="row">
      <div class="field">
        <label for="caption">Caption (optional)</label>
        <input id="caption" name="caption" type="text" maxlength="120" placeholder="e.g. Graduation 2026">
      </div>
      <div class="field">
        <label for="category">Category</label>
        <select id="category" name="category">
          <option value="general">General</option>
          <option value="exterior">Exterior</option>
          <option value="interior">Interior</option>
          <option value="nature">Nature</option>
          <option value="events">Events</option>
          <option value="school">School of Ministry</option>
        </select>
      </div>
    </div>
    <button class="btn btn--primary" type="submit">Upload</button>
  </form>
</section>

<section class="panel">
  <h2>Gallery</h2>
  <p class="muted">These photographs are appended to the public Gallery page. Images already on the site stay where they are.</p>

  <?php if (!$items): ?>
    <p class="muted">Nothing uploaded yet.</p>
  <?php else: ?>
    <div class="media-grid">
      <?php foreach ($items as $row): ?>
        <article class="media-card">
          <img src="../<?= e((string) ($row['src'] ?? '')) ?>" alt="<?= e((string) ($row['caption'] ?? '')) ?>" loading="lazy">
          <form method="post" action="media.php" class="form form--tight">
            <?= csrf_field() ?>
            <input type="hidden" name="do" value="update">
            <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
            <div class="field">
              <label for="caption-<?= e((string) $row['id']) ?>">Caption</label>
              <input id="caption-<?= e((string) $row['id']) ?>" name="caption" type="text" maxlength="120" value="<?= e((string) ($row['caption'] ?? '')) ?>">
            </div>
            <div class="field">
              <label for="cat-<?= e((string) $row['id']) ?>">Category</label>
              <select id="cat-<?= e((string) $row['id']) ?>" name="category">
                <?php foreach (['general', 'exterior', 'interior', 'nature', 'events', 'school'] as $cat): ?>
                  <option value="<?= e($cat) ?>" <?= (($row['category'] ?? '') === $cat) ? 'selected' : '' ?>><?= e(ucfirst($cat)) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <label class="check"><input type="checkbox" name="published" value="1" <?= !empty($row['published']) ? 'checked' : '' ?>> Visible</label>
            <div class="form-actions">
              <button class="btn btn--small" type="submit">Save</button>
            </div>
          </form>
          <form method="post" action="media.php" class="inline" onsubmit="return confirm('Delete this photograph permanently?');">
            <?= csrf_field() ?>
            <input type="hidden" name="do" value="delete">
            <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
            <button class="link link--danger" type="submit">Delete photo</button>
          </form>
        </article>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</section>

<?php
admin_footer();
