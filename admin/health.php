<?php
/**
 * Environment diagnostics. Safe to open before setup — it never prints secrets.
 */
declare(strict_types=1);

require_once __DIR__ . '/inc/bootstrap.php';

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

$checks = [];

$checks[] = [
    'label' => 'PHP version',
    'value' => PHP_VERSION,
    'ok'    => PHP_VERSION_ID >= 70400,
    'note'  => PHP_VERSION_ID >= 70400 ? 'Supported' : 'PHP 7.4 or newer is required',
];

foreach (['json', 'fileinfo', 'session', 'gd', 'mbstring'] as $ext) {
    $loaded = extension_loaded($ext);
    $checks[] = [
        'label' => 'Extension: ' . $ext,
        'value' => $loaded ? 'loaded' : 'missing',
        'ok'    => $ext === 'gd' || $ext === 'mbstring' ? true : $loaded,
        'note'  => $loaded ? '' : ($ext === 'gd' ? 'Optional — images will be stored without re-encoding' : ($ext === 'mbstring' ? 'Optional — falling back to byte functions' : 'Required')),
    ];
}

foreach ([
    'data/'               => DATA_DIR,
    'data/private/'       => PRIVATE_DIR,
    'assets/img/uploads/' => UPLOAD_DIR,
] as $label => $path) {
    $exists = is_dir($path);
    $writable = $exists && is_writable($path);
    $checks[] = [
        'label' => 'Writable: ' . $label,
        'value' => $exists ? ($writable ? 'writable' : 'not writable') : 'missing',
        'ok'    => $writable,
        'note'  => $writable ? '' : 'The web server must be able to write here (permissions 755 or 775)',
    ];
}

$checks[] = [
    'label' => 'Admin account',
    'value' => is_installed() ? 'created' : 'not created yet',
    'ok'    => is_installed(),
    'note'  => is_installed() ? '' : 'Open setup.php to create it',
];

$checks[] = [
    'label' => 'HTTPS',
    'value' => $https ? 'on' : 'off',
    'ok'    => $https,
    'note'  => $https ? '' : 'Sign in over HTTPS only. Enable the free certificate in cPanel.',
];

$checks[] = [
    'label' => 'Upload limit',
    'value' => ini_get('upload_max_filesize') . ' / ' . ini_get('post_max_size'),
    'ok'    => true,
    'note'  => 'upload_max_filesize / post_max_size',
];

$checks[] = [
    'label' => '.htaccess protection',
    'value' => is_file(PRIVATE_DIR . '/.htaccess') ? 'present' : 'missing',
    'ok'    => is_file(PRIVATE_DIR . '/.htaccess'),
    'note'  => 'Blocks direct browser access to credentials and logs',
];

$failed = count(array_filter($checks, static fn ($c) => !$c['ok']));
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Diagnostics · JPSMRC Admin</title>
<link rel="stylesheet" href="assets/admin.css?v=20261110f">
</head>
<body class="auth-page">
<main class="auth-card auth-card--wide">
  <div class="auth-brand">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M6.5 8.5h11"/></svg>
    <div><strong>Diagnostics</strong><span>Server environment check</span></div>
  </div>

  <p class="muted"><?= $failed === 0 ? 'Everything looks correct.' : $failed . ' item(s) need attention.' ?></p>

  <table class="table">
    <thead><tr><th>Check</th><th>Result</th><th>Note</th></tr></thead>
    <tbody>
      <?php foreach ($checks as $check): ?>
        <tr>
          <td><?= e($check['label']) ?></td>
          <td><span class="pill <?= $check['ok'] ? 'pill--ok' : 'pill--bad' ?>"><?= e($check['value']) ?></span></td>
          <td class="tiny muted"><?= e($check['note']) ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>

  <p class="auth-foot"><a href="index.php">← Admin sign in</a></p>
</main>
</body>
</html>
