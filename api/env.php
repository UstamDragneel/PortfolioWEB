<?php
declare(strict_types=1);

/**
 * Minimal .env loader — no Composer required.
 * Reads key=value pairs from the project-root .env file once per request.
 */

// Block direct browser access; this file is only meant to be included.
if (basename((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

/**
 * @return array<string, string>
 */
function env_values(): array
{
    static $values = null;

    if ($values !== null) {
        return $values;
    }

    $values = [];
    $path = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';

    if (!is_readable($path)) {
        return $values;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines ?: [] as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key === '') {
            continue;
        }

        $length = strlen($value);

        if ($length >= 2) {
            $first = $value[0];
            $last = $value[$length - 1];

            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }

        $values[$key] = $value;
    }

    return $values;
}

/**
 * Read a value from .env, falling back to the real environment.
 */
function env(string $key, string $default = ''): string
{
    $values = env_values();
    $value = $values[$key] ?? getenv($key);

    if ($value === false || $value === null || $value === '') {
        return $default;
    }

    return (string) $value;
}
