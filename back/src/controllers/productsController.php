<?php

declare(strict_types=1);

require_once __DIR__ . '/_http.php';
require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/products.php';

/** GET /?route=products.index */
function productsIndex(PDO $pdo): void
{
    $data = getProducts($pdo, [
        'q'           => $_GET['q'] ?? null,
        'category_id' => $_GET['category_id'] ?? null,
        'page'        => $_GET['page'] ?? null,
        'per_page'    => $_GET['per_page'] ?? null,
        'sort'        => $_GET['sort'] ?? null,
        'dir'         => $_GET['dir'] ?? null,
    ]);
    respond_json($data);
}

/** POST /?route=products.create  {sku,title,price_cents,stock,category_ids?[]} */
function productsCreate(PDO $pdo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond_error('Method Not Allowed', 405);
    $in = parsed_body();
    $sku   = s((string)($in['sku']   ?? ''));
    $title = s((string)($in['title'] ?? ''));
    $price = i($in['price_cents'] ?? null);
    $stock = i($in['stock'] ?? 0) ?? 0;
    if ($sku === '' || $title === '' || $price === null || $price < 0) respond_error('sku, title, price_cents requis', 422);

    $id = createProduct($pdo, $sku, $title, $price, max(0, $stock));

    $cats = $in['category_ids'] ?? [];
    if (is_array($cats) && count($cats) > 0) setProductCategories($pdo, $id, array_map('intval', $cats));

    respond_json(['id' => $id, 'message' => 'created'], 201);
}

/** POST /?route=products.edit&id=1  {sku,title,price_cents,stock,category_ids?[]} */
function productsEdit(PDO $pdo, $id): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond_error('Method Not Allowed', 405);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);

    $in = parsed_body();
    $sku   = s((string)($in['sku']   ?? ''));
    $title = s((string)($in['title'] ?? ''));
    $price = i($in['price_cents'] ?? null);
    $stock = i($in['stock'] ?? 0) ?? 0;
    if ($sku === '' || $title === '' || $price === null || $price < 0) respond_error('sku, title, price_cents requis', 422);

    updateProduct($pdo, $id, $sku, $title, $price, max(0, $stock));

    if (isset($in['category_ids']) && is_array($in['category_ids'])) {
        setProductCategories($pdo, $id, array_map('intval', $in['category_ids']));
    }

    respond_json(['message' => 'updated']);
}

/** GET /?route=products.delete&id=1&delete=1 */
function productsDelete(PDO $pdo, $id): void
{
    if (!isset($_GET['delete'])) respond_error('paramètre delete manquant', 400);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);
    deleteProduct($pdo, $id); // RESTRICT si utilisé par order_items
    respond_json(['message' => 'deleted']);
}
