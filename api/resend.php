<?php
declare(strict_types=1);

/**
 * Thin wrapper around Resend's REST API.
 * The API key is read from .env on the server and never sent to the browser.
 */

require_once __DIR__ . '/env.php';

// Block direct browser access; this file is only meant to be included.
if (basename((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

function resend_configured(): bool
{
    return env('RESEND_API_KEY') !== ''
        && env('RESEND_FROM_EMAIL') !== ''
        && env('CONTACT_TO_EMAIL') !== '';
}

/**
 * @param array<string, mixed> $payload
 * @return array{ok: bool, status: int, error: string, body: string}
 */
function resend_send(array $payload): array
{
    $apiKey = env('RESEND_API_KEY');

    if ($apiKey === '') {
        return ['ok' => false, 'status' => 0, 'error' => 'RESEND_API_KEY is not set in .env.', 'body' => ''];
    }

    if (!function_exists('curl_init')) {
        return ['ok' => false, 'status' => 0, 'error' => 'The PHP cURL extension is not enabled.', 'body' => ''];
    }

    $json = json_encode(
        $payload,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );

    if ($json === false) {
        return ['ok' => false, 'status' => 0, 'error' => 'Could not encode the email payload.', 'body' => ''];
    }

    $ch = curl_init('https://api.resend.com/emails');

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => $json,
        CURLOPT_TIMEOUT => 15,
    ]);

    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($response === false) {
        return [
            'ok' => false,
            'status' => 0,
            'error' => $curlError !== '' ? $curlError : 'Unknown cURL error.',
            'body' => '',
        ];
    }

    return [
        'ok' => $status >= 200 && $status < 300,
        'status' => $status,
        'error' => '',
        'body' => (string) $response,
    ];
}
