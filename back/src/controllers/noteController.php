<?php

declare(strict_types=1);

require_once __DIR__ . '/_http.php';              // CORS + helpers
require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/noteModel.php';

/** GET /?route=notes.index */
function notesIndex(PDO $pdo): void
{
    $rows = getNotes($pdo);
    respond_json($rows);
}

/** POST /?route=notes.create  {title,content} */
function notesCreate(PDO $pdo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }
    $in = parsed_body();
    $title   = s((string)($in['title']   ?? ''));
    $content = s((string)($in['content'] ?? ''));
    if ($title === '' || $content === '') {
        respond_error('title et content sont requis', 422);
    }
    addNote($pdo, $title, $content);
    respond_json(['message' => 'created'], 201);
}

/** POST /?route=notes.edit&id=123  {title,content} */
function notesEdit(PDO $pdo, $id): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);

    $in = parsed_body();
    $title   = s((string)($in['title']   ?? ''));
    $content = s((string)($in['content'] ?? ''));
    if ($title === '' || $content === '') {
        respond_error('title et content sont requis', 422);
    }
    updateNote($pdo, $id, $title, $content);
    respond_json(['message' => 'updated']);
}

/** GET /?route=notes.delete&id=123&delete=1 */
function notesDelete(PDO $pdo, $id): void
{
    if (!isset($_GET['delete'])) respond_error('paramètre delete manquant', 400);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);

    deleteNote($pdo, $id);
    respond_json(['message' => 'deleted']);
}
