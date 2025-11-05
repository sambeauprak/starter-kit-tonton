<?php

declare(strict_types=1);

/** CORS + JSON pour toutes les réponses par défaut */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if (!headers_sent()) header('Content-Type: application/json; charset=utf-8');

/** Préflight CORS */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/** Helpers réponse */
function respond_json($data, int $status = 200): void
{
    if (!headers_sent()) header('Content-Type: application/json; charset=utf-8');
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function respond_error(string $message, int $status = 400, array $extra = []): void
{
    respond_json(['error' => $message] + $extra, $status);
}

/** Parsing entrée */
function parsed_body(): array
{
    $ctype = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($ctype, 'application/json') !== false) {
        $raw = file_get_contents('php://input') ?: '';
        $json = json_decode($raw, true);
        return is_array($json) ? $json : [];
    }
    return $_POST ?? [];
}

/** Sanitize */
function s(string $v): string
{
    return trim($v);
}
function i($v, ?int $def = null): ?int
{
    if ($v === null || $v === '') return $def;
    $n = (int)$v;
    return $n;
}
