<?php

declare(strict_types=1);

/** Liste commandes filtrable + pagination + tri */
function getOrders(PDO $pdo, array $opts = []): array
{
    $status = $opts['status'] ?? null;
    $from   = $opts['from']   ?? null;
    $to     = $opts['to']     ?? null;
    $q      = $opts['q']      ?? null; // sur client name/email
    $page = max(1, (int)($opts['page'] ?? 1));
    $per = max(1, min(100, (int)($opts['per_page'] ?? 20)));
    $offset = ($page - 1) * $per;

    $sort = in_array(($opts['sort'] ?? 'created_at'), ['created_at', 'total', 'status', 'id'], true) ? $opts['sort'] : 'created_at';
    $dir  = strtolower($opts['dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

    $where = [];
    $params = [];
    if ($status) {
        $where[] = "o.status = :status";
        $params[':status'] = $status;
    }
    if ($from) {
        $where[] = "date(o.created_at) >= date(:from)";
        $params[':from'] = $from;
    }
    if ($to) {
        $where[] = "date(o.created_at) <= date(:to)";
        $params[':to'] = $to;
    }
    if ($q) {
        $where[] = "(LOWER(c.name) LIKE :q OR LOWER(c.email) LIKE :q)";
        $params[':q'] = '%' . mb_strtolower($q) . '%';
    }

    $sqlBase = "FROM orders o JOIN customers c ON c.id = o.customer_id" . ($where ? " WHERE " . implode(" AND ", $where) : "");

    $stmt = $pdo->prepare("SELECT COUNT(*) $sqlBase");
    $stmt->execute($params);
    $total = (int)$stmt->fetchColumn();

    $stmt = $pdo->prepare("
      SELECT o.*, c.email, c.name
      $sqlBase
      ORDER BY o.$sort $dir
      LIMIT :lim OFFSET :off
    ");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $per, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    return ['data' => $rows, 'total' => $total, 'page' => $page, 'per_page' => $per];
}

function getOrder(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$id]);
    $o = $stmt->fetch();
    return $o ?: null;
}

function getOrderWithItems(PDO $pdo, int $id): ?array
{
    $o = getOrder($pdo, $id);
    if (!$o) return null;
    $items = getOrderItemsByOrder($pdo, $id);
    $o['items'] = $items;
    return $o;
}

function createOrder(PDO $pdo, int $customer_id, string $status, array $items): int
{
    $pdo->beginTransaction();
    try {
        $pdo->prepare("INSERT INTO orders(customer_id, status, total) VALUES(?, ?, 0)")
            ->execute([$customer_id, $status]);
        $order_id = (int)$pdo->lastInsertId();

        $ins = $pdo->prepare("INSERT INTO order_items(order_id, product_id, quantity, unit_price) VALUES(?, ?, ?, ?)");
        foreach ($items as $it) {
            $pid = (int)$it['product_id'];
            $qty = (int)$it['quantity'];
            $price = (int)$it['unit_price'];
            $ins->execute([$order_id, $pid, $qty, $price]);
        }
        _recomputeOrderTotal($pdo, $order_id);

        $pdo->commit();
        return $order_id;
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function updateOrderStatus(PDO $pdo, int $id, string $status): void
{
    $pdo->prepare("UPDATE orders SET status=? WHERE id=?")->execute([$status, $id]);
}

function replaceOrderItems(PDO $pdo, int $order_id, array $items): void
{
    $pdo->beginTransaction();
    try {
        $pdo->prepare("DELETE FROM order_items WHERE order_id = ?")->execute([$order_id]);
        $ins = $pdo->prepare("INSERT INTO order_items(order_id, product_id, quantity, unit_price) VALUES(?, ?, ?, ?)");
        foreach ($items as $it) {
            $pid = (int)$it['product_id'];
            $qty = (int)$it['quantity'];
            $price = (int)$it['unit_price'];
            $ins->execute([$order_id, $pid, $qty, $price]);
        }
        _recomputeOrderTotal($pdo, $order_id);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function deleteOrder(PDO $pdo, int $id): void
{
    // CASCADE supprime order_items
    $pdo->prepare("DELETE FROM orders WHERE id = ?")->execute([$id]);
}

function _recomputeOrderTotal(PDO $pdo, int $order_id): void
{
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(quantity * unit_price),0) FROM order_items WHERE order_id = ?");
    $stmt->execute([$order_id]);
    $total = (int)$stmt->fetchColumn();
    $pdo->prepare("UPDATE orders SET total = ? WHERE id = ?")->execute([$total, $order_id]);
}

/* Dépendances locales */
require_once __DIR__ . '/order_items.php';
