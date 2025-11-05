<?php

declare(strict_types=1);

require_once __DIR__ . '/_http.php';
require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/categories.php';

/** GET /?route=categories.index */
function categoriesIndex(PDO $pdo): void
{
    $data = getCategories($pdo, ['q' => $_GET['q'] ?? null]);
    respond_json($data);
}

/** POST /?route=categories.create  {name} */
function categoriesCreate(PDO $pdo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond_error('Method Not Allowed', 405);
    $in = parsed_body();
    $name = s((string)($in['name'] ?? ''));
    if ($name === '') respond_error('name requis', 422);
    $id = createCategory($pdo, $name);
    respond_json(['id' => $id, 'message' => 'created'], 201);
}

/** POST /?route=categories.edit&id=1  {name} */
function categoriesEdit(PDO $pdo, $id): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond_error('Method Not Allowed', 405);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);
    $in = parsed_body();
    $name = s((string)($in['name'] ?? ''));
    if ($name === '') respond_error('name requis', 422);
    updateCategory($pdo, $id, $name);
    respond_json(['message' => 'updated']);
}

/** GET /?route=categories.delete&id=1&delete=1 */
function categoriesDelete(PDO $pdo, $id): void
{
    if (!isset($_GET['delete'])) respond_error('paramètre delete manquant', 400);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);
    deleteCategory($pdo, $id);
    respond_json(['message' => 'deleted']);
}
