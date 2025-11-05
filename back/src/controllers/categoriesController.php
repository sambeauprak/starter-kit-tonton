<?php

declare(strict_types=1);

require_once __DIR__ . '/_http.php';
require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/customers.php';

/** GET /?route=customers.index */
function customersIndex(PDO $pdo): void
{
    $data = getCustomers($pdo, [
        'q'        => $_GET['q']   ?? null,
        'from'     => $_GET['from'] ?? null,
        'to'       => $_GET['to']  ?? null,
        'page'     => $_GET['page'] ?? null,
        'per_page' => $_GET['per_page'] ?? null,
        'sort'     => $_GET['sort'] ?? null,
        'dir'      => $_GET['dir'] ?? null,
    ]);
    respond_json($data);
}

/** POST /?route=customers.create  {email,name} */
function customersCreate(PDO $pdo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond_error('Method Not Allowed', 405);
    $in = parsed_body();
    $email = s((string)($in['email'] ?? ''));
    $name  = s((string)($in['name']  ?? ''));
    if ($email === '' || $name === '') respond_error('email et name requis', 422);
    $id = createCustomer($pdo, $email, $name);
    respond_json(['id' => $id, 'message' => 'created'], 201);
}

/** POST /?route=customers.edit&id=1  {email,name} */
function customersEdit(PDO $pdo, $id): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond_error('Method Not Allowed', 405);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);
    $in = parsed_body();
    $email = s((string)($in['email'] ?? ''));
    $name  = s((string)($in['name']  ?? ''));
    if ($email === '' || $name === '') respond_error('email et name requis', 422);
    updateCustomer($pdo, $id, $email, $name);
    respond_json(['message' => 'updated']);
}

/** GET /?route=customers.delete&id=1&delete=1 */
function customersDelete(PDO $pdo, $id): void
{
    if (!isset($_GET['delete'])) respond_error('paramètre delete manquant', 400);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);
    deleteCustomer($pdo, $id);
    respond_json(['message' => 'deleted']);
}
