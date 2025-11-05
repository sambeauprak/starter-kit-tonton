<?php

declare(strict_types=1);

function getOrderItemsByOrder(PDO $pdo, int $order_id): array
{
    $stmt = $pdo->prepare("
      SELECT oi.*, p.title, p.sku
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    ");
    $stmt->execute([$order_id]);
    return $stmt->fetchAll();
}

function addOrderItem(PDO $pdo, int $order_id, int $product_id, int $quantity, int $unit_price): int
{
    $stmt = $pdo->prepare("INSERT INTO order_items(order_id, product_id, quantity, unit_price) VALUES(?, ?, ?, ?)");
    $stmt->execute([$order_id, $product_id, $quantity, $unit_price]);
    return (int)$pdo->lastInsertId();
}

function updateOrderItem(PDO $pdo, int $id, int $quantity, int $unit_price): void
{
    $stmt = $pdo->prepare("UPDATE order_items SET quantity=?, unit_price=? WHERE id=?");
    $stmt->execute([$quantity, $unit_price, $id]);
}

function deleteOrderItem(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare("DELETE FROM order_items WHERE id = ?");
    $stmt->execute([$id]);
}
