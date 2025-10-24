<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/noteModel.php';

error_reporting(E_ALL);
ini_set('display_errors', '1');

/** CORS + JSON pour toutes les réponses */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

/** Préflight CORS */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/** ---------- Helpers ---------- */
function respond_json($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function respond_error(string $message, int $status = 400, array $extra = []): void
{
    respond_json(['error' => $message] + $extra, $status);
}

/** Accepte JSON (application/json) ou formulaire (x-www-form-urlencoded/multipart) */
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
function s(string $v): string
{
    return trim($v);
}

/** ---------- Actions ---------- */

function createNote($pdo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }

    $input = parsed_body();

    $title   = s((string)($input['title']   ?? ''));
    $content = s((string)($input['content'] ?? ''));

    if ($title === '' || $content === '') {
        respond_error('title et content sont requis', 422); // HTTP Code erreur
    }

    addNote($pdo, $title, $content);
    respond_json(['message' => 'success'], 201);
}

function editNote($pdo, $id): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }

    $id = (int)$id;
    if ($id < 1) {
        respond_error('id invalide', 400);
    }

    $in = parsed_body();
    $title   = s((string)($in['title']   ?? ''));
    $content = s((string)($in['content'] ?? ''));

    if ($title === '' || $content === '') {
        respond_error('title et content sont requis', 422);
    }

    updateNote($pdo, $id, $title, $content);
    respond_json(['message' => 'updated']);
}

function listNotes($pdo): void
{
    $notes = getNotes($pdo);
    respond_json($notes);
}

function removeNote($pdo, $id): void
{
    $hasDeleteFlag = isset($_GET['delete']) || isset($_POST['delete']);
    if (!$hasDeleteFlag) {
        respond_error('paramètre delete manquant', 400);
    }

    $id = (int)$id;
    if ($id < 1) {
        respond_error('id invalide', 400);
    }

    deleteNote($pdo, $id);
    respond_json(['message' => 'deleted']);
}