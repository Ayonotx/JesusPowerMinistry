<?php
/**
 * Authentication and authorisation.
 */
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

const SESSION_IDLE_SECONDS = 7200; // 2 hours

function current_user(): ?string
{
    if (empty($_SESSION['user']) || !is_string($_SESSION['user'])) {
        return null;
    }
    $last = (int) ($_SESSION['last_seen'] ?? 0);
    if ($last > 0 && (time() - $last) > SESSION_IDLE_SECONDS) {
        logout_user();
        return null;
    }
    $_SESSION['last_seen'] = time();
    return $_SESSION['user'];
}

function require_login(): void
{
    if (!is_installed()) {
        redirect('setup.php');
    }
    if (current_user() === null) {
        $_SESSION['return_to'] = basename((string) ($_SERVER['SCRIPT_NAME'] ?? 'dashboard.php'));
        redirect('index.php');
    }
}

function attempt_login(string $username, string $password): array
{
    $creds = load_credentials();
    if (!$creds || empty($creds['username']) || empty($creds['password_hash'])) {
        return [false, 'This site has not been set up yet.'];
    }

    $wait = throttle_check($username);
    if ($wait > 0) {
        return [false, 'Too many attempts. Please try again in ' . (int) ceil($wait / 60) . ' minute(s).'];
    }

    $okUser = hash_equals((string) $creds['username'], trim($username));
    $okPass = password_verify($password, (string) $creds['password_hash']);

    if (!$okUser || !$okPass) {
        throttle_record($username, false);
        usleep(random_int(120000, 320000)); // slow down automated guessing
        return [false, 'Incorrect username or password.'];
    }

    throttle_record($username, true);
    session_regenerate_id(true);
    $_SESSION['user'] = $creds['username'];
    $_SESSION['last_seen'] = time();
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return [true, ''];
}

function logout_user(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires'  => time() - 42000,
            'path'     => $params['path'] ?: '/',
            'domain'   => $params['domain'] ?? '',
            'secure'   => (bool) ($params['secure'] ?? false),
            'httponly' => (bool) ($params['httponly'] ?? true),
            'samesite' => 'Strict',
        ]);
    }
    session_destroy();
}

function change_password(string $current, string $new): array
{
    $creds = load_credentials();
    if (!$creds) {
        return [false, 'Account not found.'];
    }
    if (!password_verify($current, (string) $creds['password_hash'])) {
        return [false, 'The current password is incorrect.'];
    }
    if (strlen($new) < 10) {
        return [false, 'Use at least 10 characters for the new password.'];
    }
    $creds['password_hash'] = password_hash($new, PASSWORD_DEFAULT);
    $creds['updated_at'] = gmdate('c');
    if (!save_credentials($creds)) {
        return [false, 'Could not save the new password. Check file permissions on data/private.'];
    }
    session_regenerate_id(true);
    return [true, 'Your password has been changed.'];
}

function create_account(string $username, string $password): array
{
    if (is_installed()) {
        return [false, 'This site has already been set up.'];
    }
    $username = trim($username);
    if (!preg_match('/^[a-zA-Z0-9._-]{3,40}$/', $username)) {
        return [false, 'Username must be 3–40 characters (letters, numbers, dot, dash, underscore).'];
    }
    if (strlen($password) < 10) {
        return [false, 'Use at least 10 characters for the password.'];
    }

    $data = [
        'username'      => $username,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'created_at'    => gmdate('c'),
    ];

    if (!save_credentials($data)) {
        return [false, 'Could not write data/private/credentials.json. Check permissions.'];
    }

    // Deny direct web access to the private directory.
    $htaccess = PRIVATE_DIR . '/.htaccess';
    if (!is_file($htaccess)) {
        @file_put_contents($htaccess, "Require all denied\nDeny from all\n");
    }

    return [true, ''];
}
