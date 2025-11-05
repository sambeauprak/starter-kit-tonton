<?php

declare(strict_types=1);

require_once __DIR__ . '/_http.php';
require_once __DIR__ . '/../models/db.php';

/** GET /?route=stats.index  -> KPIs + top produits + répartition statuts */
function statsIndex(PDO $pdo): void
{
    $from = $_GET['from'] ?? date('Y-m-d', strtotime('-13 days'));
    $to   = $_GET['to']   ?? date('Y-m-d');

    // KPIs
    $stmt = $pdo->prepare("
      WITH paid AS (
        SELECT * FROM orders
        WHERE status='paid' AND date(created_at) BETWEEN date(:from) AND date(:to)
      )
      SELECT
        COALESCE(SUM(total_cents),0)         AS revenue_cents,
        (SELECT COUNT(*) FROM paid)          AS orders_count
      FROM paid
    ");
    $stmt->execute([':from' => $from, ':to' => $to]);
    $kpi = $stmt->fetch() ?: ['revenue_cents' => 0, 'orders_count' => 0];
    $aov_cents = ($kpi['orders_count'] ?? 0) ? (int)round(($kpi['revenue_cents'] ?? 0) / $kpi['orders_count']) : 0;

    // Top produits (qty)
    $stmt = $pdo->prepare("
      SELECT p.title, SUM(oi.quantity) AS qty
      FROM order_items oi
      JOIN orders o   ON o.id = oi.order_id AND o.status='paid'
      JOIN products p ON p.id = oi.product_id
      WHERE date(o.created_at) BETWEEN date(:from) AND date(:to)
      GROUP BY oi.product_id
      ORDER BY qty DESC
      LIMIT 10
    ");
    $stmt->execute([':from' => $from, ':to' => $to]);
    $top = $stmt->fetchAll();

    // Répartition statuts
    $stmt = $pdo->prepare("
      SELECT status, COUNT(*) AS c
      FROM orders
      WHERE date(created_at) BETWEEN date(:from) AND date(:to)
      GROUP BY status
    ");
    $stmt->execute([':from' => $from, ':to' => $to]);
    $status = [];
    foreach ($stmt->fetchAll() as $r) $status[$r['status']] = (int)$r['c'];

    respond_json([
        'revenue_cents'   => (int)$kpi['revenue_cents'],
        'orders_count'    => (int)$kpi['orders_count'],
        'aov_cents'       => $aov_cents,
        'orders_by_status' => $status,
        'top_products'    => array_map(fn($x) => ['title' => $x['title'], 'qty' => (int)$x['qty']], $top),
        'from'            => $from,
        'to'              => $to,
    ]);
}

/** GET /?route=stats.revenue  -> CA / jour sur 14 jours (ou plage) */
function statsRevenue(PDO $pdo): void
{
    $from = $_GET['from'] ?? date('Y-m-d', strtotime('-13 days'));
    $to   = $_GET['to']   ?? date('Y-m-d');

    $stmt = $pdo->prepare("
      WITH RECURSIVE days(d) AS (
        SELECT date(:from) UNION ALL
        SELECT date(d,'+1 day') FROM days WHERE d < date(:to)
      )
      SELECT d AS day,
        COALESCE((
          SELECT SUM(total_cents) FROM orders o
          WHERE o.status='paid' AND date(o.created_at)=d
        ),0) AS revenue_cents
      FROM days
      ORDER BY d
    ");
    $stmt->execute([':from' => $from, ':to' => $to]);
    $rows = $stmt->fetchAll();

    respond_json([
        'labels' => array_column($rows, 'day'),
        'values' => array_map(fn($x) => (int)$x, array_column($rows, 'revenue_cents')),
        'from'   => $from,
        'to'     => $to,
    ]);
}
