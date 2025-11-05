<?php

declare(strict_types=1);

require_once __DIR__ . '/_http.php';
require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/orders.php';

/** GET /?route=orders.index */
function ordersIndex(PDO $pdo): void
{
    $data = getOrders($pdo, [
        'status'   => $_GET['status'] ?? null,
        'from'     => $_GET['from']   ?? null,
        'to'       => $_GET['to']     ?? null,
        'q'        => $_GET['q']      ?? null,
        'page'     => $_GET['page']   ?? null,
        'per_page' => $_GET['per_page'] ?? null,
        'sort'     => $_GET['sort']   ?? null,
        'dir'      => $_GET['dir']    ?? null,
    ]);
    respond_json($data);
}

/** GET /?route=orders.show&id=123 */
function ordersShow(PDO $pdo, $id): void
{
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);
    $o = getOrderWithItems($pdo, $id);
    if (!$o) respond_error('Not Found', 404);
    respond_json($o);
}

/** POST /?route=orders.create  {customer_id,status,items:[{product_id,quantity,unit_price_cents}]} */
function ordersCreate(PDO $pdo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond_error('Method Not Allowed', 405);
    $in = parsed_body();
    $cid = i($in['customer_id'] ?? null);
    $status = s((string)($in['status'] ?? 'pending'));
    $items = is_array($in['items'] ?? null) ? $in['items'] : [];
    if (!$cid || $cid < 1 || !in_array($status, ['pending', 'paid', 'refunded', 'cancelled'], true) || empty($items)) {
        respond_error('customer_id, status, items requis', 422);
    }
    $id = createOrder($pdo, $cid, $status, $items);
    respond_json(['id' => $id, 'message' => 'created'], 201);
}

/** POST /?route=orders.editStatus&id=123  {status} */
function ordersEditStatus(PDO $pdo, $id): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond_error('Method Not Allowed', 405);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);
    $in = parsed_body();
    $status = s((string)($in['status'] ?? ''));
    if (!in_array($status, ['pending', 'paid', 'refunded', 'cancelled'], true)) respond_error('status invalide', 422);
    updateOrderStatus($pdo, $id, $status);
    respond_json(['message' => 'updated']);
}

/** POST /?route=orders.replaceItems&id=123  {items:[...]} */
function ordersReplaceItems(PDO $pdo, $id): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond_error('Method Not Allowed', 405);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);
    $in = parsed_body();
    $items = is_array($in['items'] ?? null) ? $in['items'] : [];
    if (empty($items)) respond_error('items requis', 422);
    replaceOrderItems($pdo, $id, $items);
    respond_json(['message' => 'updated']);
}

/** GET /?route=orders.delete&id=123&delete=1 */
function ordersDelete(PDO $pdo, $id): void
{
    if (!isset($_GET['delete'])) respond_error('paramètre delete manquant', 400);
    $id = (int)$id;
    if ($id < 1) respond_error('id invalide', 400);
    deleteOrder($pdo, $id);
    respond_json(['message' => 'deleted']);
}

/** GET /?route=orders.export ... -> CSV */
function ordersExport(PDO $pdo): void
{
    // Reuse la même requête que ordersIndex côté modèle
    $data = getOrders($pdo, [
        'status'   => $_GET['status'] ?? null,
        'from'     => $_GET['from']   ?? null,
        'to'       => $_GET['to']     ?? null,
        'q'        => $_GET['q']      ?? null,
        'page'     => 1,
        'per_page' => 100000, // export all filtered
        'sort'     => $_GET['sort'] ?? 'created_at',
        'dir'      => $_GET['dir']  ?? 'desc',
    ]);

    // Override Content-Type pour CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="orders.csv"');

    $out = fopen('php://output', 'w');
    fputcsv($out, ['id', 'created_at', 'status', 'customer_email', 'customer_name', 'total_eur']);

    foreach ($data['data'] as $r) {
        fputcsv($out, [
            $r['id'],
            $r['created_at'],
            $r['status'],
            $r['email'] ?? '',
            $r['name'] ?? '',
            number_format(($r['total_cents'] ?? 0) / 100, 2, '.', '')
        ]);
    }
    exit;
}
