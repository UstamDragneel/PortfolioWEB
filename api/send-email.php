<?php
declare(strict_types=1);

/**
 * Contact form endpoint — sends a notification through Resend.
 *
 * POST JSON: { "name": "...", "email": "...", "message": "...", "website": "" }
 * The "website" field is a honeypot and must stay empty.
 */

require __DIR__ . '/mailer.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);

if (!is_array($data)) {
    $data = $_POST;
}

$name = trim((string) ($data['name'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));
$honeypot = trim((string) ($data['website'] ?? ''));

// Keep newlines out of headers and subjects.
$name = preg_replace('/[\r\n]+/', ' ', $name) ?? $name;
$email = preg_replace('/[\r\n]+/', '', $email) ?? $email;

// Bots fill hidden fields — pretend everything worked.
if ($honeypot !== '') {
    respond(200, ['ok' => true, 'message' => 'Thanks! Your message has been sent.']);
}

if ($name === '' || mb_strlen($name) > 100) {
    respond(422, ['ok' => false, 'error' => 'Please enter your name (100 characters max).']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    respond(422, ['ok' => false, 'error' => 'Please enter a valid email address.']);
}

if (mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    respond(422, ['ok' => false, 'error' => 'Your message should be between 10 and 5000 characters.']);
}

$result = deliver_contact_message($name, $email, $message);

$payload = [
    'ok' => $result['ok'],
    'mode' => $result['mode'],
];

if ($result['ok']) {
    $payload['message'] = $result['message'];
} else {
    $payload['error'] = $result['error'];
}

respond($result['status'], $payload);
