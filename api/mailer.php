<?php
declare(strict_types=1);

/**
 * Builds the contact notification and delivers it.
 *
 * Delivery is controlled by MAIL_DRIVER in .env:
 *   auto   - Resend when configured, otherwise the local outbox (local env only)
 *   resend - always call Resend
 *   log    - always write to storage/outbox, never send
 */

require_once __DIR__ . '/env.php';
require_once __DIR__ . '/resend.php';

// Block direct browser access; this file is only meant to be included.
if (basename((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

/**
 * @return array{subject: string, html: string, text: string}
 */
function build_contact_email(string $name, string $email, string $message): array
{
    $siteName = env('SITE_NAME', 'Portfolio');
    $safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeEmail = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));

    $html = <<<HTML
<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;">
    <h2 style="margin:0 0 16px;">New message from {$siteName}</h2>
    <p style="margin:0 0 8px;"><strong>Name:</strong> {$safeName}</p>
    <p style="margin:0 0 8px;"><strong>Email:</strong> {$safeEmail}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
    <p style="margin:0;white-space:pre-wrap;">{$safeMessage}</p>
</div>
HTML;

    return [
        'subject' => "New portfolio message from {$name}",
        'html' => $html,
        'text' => "New message from {$siteName}\n\nName: {$name}\nEmail: {$email}\n\n{$message}",
    ];
}

/**
 * Writes a copy of the email to storage/outbox for local testing.
 *
 * @param array<string, mixed> $record
 */
function write_to_outbox(array $record): ?string
{
    $directory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'outbox';

    if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
        return null;
    }

    $file = $directory . DIRECTORY_SEPARATOR . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.json';
    $json = json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    if ($json === false || file_put_contents($file, $json) === false) {
        return null;
    }

    return $file;
}

/**
 * @return array{ok: bool, mode: string, status: int, error: string, message: string}
 */
function deliver_contact_message(string $name, string $email, string $message): array
{
    $driver = strtolower(env('MAIL_DRIVER', 'auto'));
    $appEnv = strtolower(env('APP_ENV', 'local'));
    $configured = resend_configured();

    if (!in_array($driver, ['auto', 'resend', 'log'], true)) {
        $driver = 'auto';
    }

    if ($driver === 'resend' && !$configured) {
        error_log('MAIL_DRIVER=resend but Resend is not configured in .env.');

        return [
            'ok' => false,
            'mode' => 'none',
            'status' => 500,
            'error' => 'Email service is not configured yet.',
            'message' => '',
        ];
    }

    if ($driver === 'log' || ($driver === 'auto' && !$configured)) {
        if ($appEnv === 'production') {
            error_log('No email driver is configured while APP_ENV=production.');

            return [
                'ok' => false,
                'mode' => 'none',
                'status' => 500,
                'error' => 'Email service is not configured yet.',
                'message' => '',
            ];
        }

        $body = build_contact_email($name, $email, $message);
        $recipients = array_values(array_filter(array_map('trim', explode(',', env('CONTACT_TO_EMAIL')))));

        $path = write_to_outbox([
            'created_at' => date('c'),
            'mode' => 'local-outbox',
            'from' => env('RESEND_FROM_EMAIL'),
            'to' => $recipients,
            'reply_to' => $email,
            'subject' => $body['subject'],
            'name' => $name,
            'email' => $email,
            'message' => $message,
            'html' => $body['html'],
            'text' => $body['text'],
        ]);

        if ($path === null) {
            return [
                'ok' => false,
                'mode' => 'log',
                'status' => 500,
                'error' => 'Could not write to the local outbox.',
                'message' => '',
            ];
        }

        return [
            'ok' => true,
            'mode' => 'log',
            'status' => 200,
            'error' => '',
            'message' => 'Saved to the local outbox (dev mode) - no email was sent.',
        ];
    }

    $body = build_contact_email($name, $email, $message);
    $recipients = array_values(array_filter(array_map('trim', explode(',', env('CONTACT_TO_EMAIL')))));

    $result = resend_send([
        'from' => env('RESEND_FROM_EMAIL'),
        'to' => $recipients,
        'reply_to' => $email,
        'subject' => $body['subject'],
        'html' => $body['html'],
        'text' => $body['text'],
    ]);

    if (!$result['ok']) {
        error_log(
            'Resend send failed (' . $result['status'] . '): '
            . ($result['body'] !== '' ? $result['body'] : $result['error'])
        );

        return [
            'ok' => false,
            'mode' => 'resend',
            'status' => 502,
            'error' => 'The email service rejected the request. Please try again later.',
            'message' => '',
        ];
    }

    return [
        'ok' => true,
        'mode' => 'resend',
        'status' => 200,
        'error' => '',
        'message' => 'Thanks! Your message has been sent.',
    ];
}
