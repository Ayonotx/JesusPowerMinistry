<?php
/**
 * Image upload handling.
 */
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

const MAX_UPLOAD_BYTES = 8388608; // 8 MB

function allowed_mime_map(): array
{
    return [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];
}

/**
 * Validate and store an uploaded image.
 *
 * @return array{0: bool, 1: string} [success, relative path or error message]
 */
function handle_upload(array $file): array
{
    if (!isset($file['error']) || is_array($file['error'])) {
        return [false, 'No file was received.'];
    }

    switch ($file['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            return [false, 'That image is larger than the server allows. Try a smaller file.'];
        case UPLOAD_ERR_NO_FILE:
            return [false, 'Please choose an image to upload.'];
        default:
            return [false, 'The upload failed. Please try again.'];
    }

    if (($file['size'] ?? 0) <= 0 || $file['size'] > MAX_UPLOAD_BYTES) {
        return [false, 'Images must be smaller than 8 MB.'];
    }

    if (!is_uploaded_file($file['tmp_name'])) {
        return [false, 'The upload could not be verified.'];
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = (string) $finfo->file($file['tmp_name']);
    $map   = allowed_mime_map();
    if (!isset($map[$mime])) {
        return [false, 'Only JPEG, PNG and WebP images are accepted.'];
    }

    $size = @getimagesize($file['tmp_name']);
    if ($size === false || $size[0] < 200 || $size[1] < 200) {
        return [false, 'That image is too small. Use at least 200 × 200 pixels.'];
    }

    // Reject files that merely claim to be images.
    if ((int) $size[2] !== constant('IMAGETYPE_' . strtoupper($map[$mime] === 'jpg' ? 'JPEG' : $map[$mime]))) {
        return [false, 'That file is not a valid image.'];
    }

    if (!is_dir(UPLOAD_DIR) && !@mkdir(UPLOAD_DIR, 0755, true)) {
        return [false, 'The uploads folder is not writable.'];
    }

    $extension = $map[$mime];
    $filename  = gmdate('Ymd') . '-' . bin2hex(random_bytes(6)) . '.' . $extension;
    $target    = UPLOAD_DIR . '/' . $filename;

    $stored = false;
    if (extension_loaded('gd')) {
        $stored = reencode_image($file['tmp_name'], $target, $mime);
    }

    if (!$stored) {
        $stored = @move_uploaded_file($file['tmp_name'], $target);
    }

    if (!$stored) {
        return [false, 'The image could not be saved. Check folder permissions.'];
    }

    @chmod($target, 0644);
    return [true, UPLOAD_REL . '/' . $filename];
}

/**
 * Re-encode an image through GD: strips EXIF, caps the long edge, normalises quality.
 */
function reencode_image(string $source, string $target, string $mime): bool
{
    $maxEdge = 2000;

    switch ($mime) {
        case 'image/jpeg':
            $image = @imagecreatefromjpeg($source);
            break;
        case 'image/png':
            $image = @imagecreatefrompng($source);
            break;
        case 'image/webp':
            $image = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($source) : false;
            break;
        default:
            return false;
    }

    if (!$image) {
        return false;
    }

    $width  = imagesx($image);
    $height = imagesy($image);

    if ($width > $maxEdge || $height > $maxEdge) {
        $scale     = $maxEdge / max($width, $height);
        $newWidth  = max(1, (int) round($width * $scale));
        $newHeight = max(1, (int) round($height * $scale));
        $resized   = imagecreatetruecolor($newWidth, $newHeight);
        if ($mime === 'image/png') {
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
        }
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($image);
        $image = $resized;
    }

    $ok = false;
    if ($mime === 'image/jpeg') {
        $ok = imagejpeg($image, $target, 82);
    } elseif ($mime === 'image/png') {
        imagepng($image, $target, 6);
        $ok = is_file($target);
    } elseif ($mime === 'image/webp') {
        $ok = function_exists('imagewebp') ? imagewebp($image, $target, 82) : false;
    }

    imagedestroy($image);
    return (bool) $ok;
}

/**
 * Delete a file that lives inside the uploads directory.
 */
function delete_upload(string $relativePath): bool
{
    $relativePath = str_replace('\\', '/', $relativePath);
    if (strpos($relativePath, UPLOAD_REL . '/') !== 0) {
        return false;
    }

    $name = basename($relativePath);
    if ($name === '' || $name !== basename($relativePath)) {
        return false;
    }

    $path = UPLOAD_DIR . '/' . $name;
    if (is_file($path)) {
        return @unlink($path);
    }
    return false;
}

function upload_size_label(int $bytes): string
{
    if ($bytes >= 1048576) {
        return round($bytes / 1048576, 1) . ' MB';
    }
    return round($bytes / 1024) . ' KB';
}
