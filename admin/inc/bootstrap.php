<?php
/**
 * Shared bootstrap for the JPSMRC admin panel.
 * Requires PHP 7.4+ (tested against 8.1 semantics).
 */
declare(strict_types=1);

define('APP_ROOT', dirname(__DIR__, 2));
define('ADMIN_DIR', APP_ROOT . '/admin');
define('DATA_DIR', APP_ROOT . '/data');
define('PRIVATE_DIR', DATA_DIR . '/private');
define('UPLOAD_DIR', APP_ROOT . '/assets/img/uploads');
define('UPLOAD_REL', 'assets/img/uploads');

// Never leak errors to the browser in production.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

foreach ([DATA_DIR, PRIVATE_DIR, UPLOAD_DIR] as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

ini_set('error_log', PRIVATE_DIR . '/php-error.log');

// --- Session hardening -----------------------------------------------------
if (session_status() !== PHP_SESSION_ACTIVE) {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_name('jpsmrc_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}

// --- Helpers ---------------------------------------------------------------
function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function redirect(string $path): void
{
    header('Location: ' . $path);
    exit;
}

function is_post(): bool
{
    return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
}

/**
 * Trim a string to a maximum number of characters without breaking multibyte text.
 */
function shorten(string $text, int $limit): string
{
    $text = trim(preg_replace('/\s+/', ' ', $text) ?? '');
    $length = function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : strlen($text);
    if ($length <= $limit) {
        return $text;
    }
    $cut = function_exists('mb_substr') ? mb_substr($text, 0, $limit, 'UTF-8') : substr($text, 0, $limit);
    return rtrim($cut) . '…';
}

function client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// --- JSON store ------------------------------------------------------------
function store_path(string $name): string
{
    $safe = preg_replace('/[^a-z0-9_-]/i', '', $name);
    return DATA_DIR . '/' . $safe . '.json';
}

function store_read(string $name, array $fallback = []): array
{
    $path = store_path($name);
    if (!is_file($path)) {
        return $fallback;
    }
    $handle = @fopen($path, 'rb');
    if (!$handle) {
        return $fallback;
    }
    @flock($handle, LOCK_SH);
    $raw = stream_get_contents($handle);
    @flock($handle, LOCK_UN);
    fclose($handle);

    $decoded = json_decode((string) $raw, true);
    return is_array($decoded) ? $decoded : $fallback;
}

function store_write(string $name, array $data): bool
{
    $path = store_path($name);
    $dir  = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        return false;
    }

    $temp = $path . '.tmp' . bin2hex(random_bytes(4));
    if (file_put_contents($temp, $json, LOCK_EX) === false) {
        return false;
    }

    // Preserve any existing permissions, then swap atomically.
    if (!@rename($temp, $path)) {
        @unlink($temp);
        return false;
    }
    @chmod($path, 0644);
    return true;
}

// --- Credentials -----------------------------------------------------------
function credentials_path(): string
{
    return PRIVATE_DIR . '/credentials.json';
}

function is_installed(): bool
{
    return is_file(credentials_path());
}

function load_credentials(): ?array
{
    if (!is_installed()) {
        return null;
    }
    $raw = @file_get_contents(credentials_path());
    $data = json_decode((string) $raw, true);
    return is_array($data) ? $data : null;
}

function save_credentials(array $data): bool
{
    if (!is_dir(PRIVATE_DIR)) {
        @mkdir(PRIVATE_DIR, 0755, true);
    }
    $json = json_encode($data, JSON_PRETTY_PRINT);
    if ($json === false) {
        return false;
    }
    $ok = @file_put_contents(credentials_path(), $json, LOCK_EX) !== false;
    if ($ok) {
        @chmod(credentials_path(), 0600);
    }
    return $ok;
}

// --- Login throttling ------------------------------------------------------
function attempts_path(): string
{
    return PRIVATE_DIR . '/attempts.json';
}

function throttle_key(string $username): string
{
    return hash('sha256', strtolower($username) . '|' . client_ip());
}

function throttle_check(string $username): int
{
    $window = 15 * 60;
    $limit  = 5;
    $raw    = @file_get_contents(attempts_path());
    $data   = json_decode((string) $raw, true);
    if (!is_array($data)) {
        $data = [];
    }

    $key  = throttle_key($username);
    $now  = time();
    $hits = array_values(array_filter($data[$key] ?? [], static fn ($t) => is_int($t) && ($now - $t) < $window));

    if (count($hits) >= $limit) {
        return max(0, $window - ($now - min($hits)));
    }
    return 0;
}

function throttle_record(string $username, bool $success): void
{
    $raw  = @file_get_contents(attempts_path());
    $data = json_decode((string) $raw, true);
    if (!is_array($data)) {
        $data = [];
    }

    $key = throttle_key($username);
    if ($success) {
        unset($data[$key]);
    } else {
        $data[$key][] = time();
        // Keep the file bounded.
        $data[$key] = array_slice($data[$key], -20);
    }

    // Drop stale keys.
    $now = time();
    foreach ($data as $k => $stamps) {
        if (!is_array($stamps)) {
            unset($data[$k]);
            continue;
        }
        $kept = array_values(array_filter($stamps, static fn ($t) => is_int($t) && ($now - $t) < 86400));
        if (!$kept) {
            unset($data[$k]);
        } else {
            $data[$k] = $kept;
        }
    }

    @file_put_contents(attempts_path(), json_encode($data), LOCK_EX);
    @chmod(attempts_path(), 0600);
}

// --- CSRF ------------------------------------------------------------------
function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function csrf_valid(): bool
{
    $sent = $_POST['_csrf'] ?? '';
    return is_string($sent) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $sent);
}
