<?php
declare(strict_types=1);

/**
 * Send a real test email through Resend.
 *
 * Usage:
 *   php scripts/test-email.php [recipient@example.com]
 *
 * Defaults to CONTACT_TO_EMAIL from .env.
 */

require __DIR__ . '/../api/env.php';
require __DIR__ . '/../api/resend.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$to = $argv[1] ?? env('CONTACT_TO_EMAIL');
$from = env('RESEND_FROM_EMAIL');
$siteName = env('SITE_NAME', 'Portfolio');

if (!resend_configured()) {
    fwrite(STDERR, "Resend is not configured yet.\n");
    fwrite(STDERR, "Fill RESEND_API_KEY, RESEND_FROM_EMAIL and CONTACT_TO_EMAIL in .env.\n");
    exit(1);
}

if (trim($to) === '') {
    fwrite(STDERR, "No recipient. Pass one as an argument or set CONTACT_TO_EMAIL in .env.\n");
    exit(1);
}

$recipients = array_values(array_filter(array_map('trim', explode(',', $to))));

$html = <<<HTML
<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;">
    <h2 style="margin:0 0 16px;">Resend is working</h2>
    <p style="margin:0 0 8px;">This test email was sent from {$siteName}.</p>
    <p style="margin:0;color:#6b7280;">Sent at: {$siteName} local test</p>
</div>
HTML;

$result = resend_send([
    'from' => $from,
    'to' => $recipients,
    'subject' => 'Resend test from ' . $siteName,
    'html' => $html,
    'text' => "Resend is working. This test email was sent from {$siteName}.",
]);

if ($result['ok']) {
    echo "Sent test email to " . implode(', ', $recipients) . PHP_EOL;
    exit(0);
}

fwrite(
    STDERR,
    'Failed (' . $result['status'] . '): '
    . ($result['body'] !== '' ? $result['body'] : $result['error'])
    . PHP_EOL
);
exit(1);
