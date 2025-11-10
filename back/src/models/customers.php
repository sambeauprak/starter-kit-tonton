<?php

declare(strict_types=1);

function getCustomers(PDO $pdo, array $opts = []): array
{
    $q   = $opts['q']   ?? null;
    $from = $opts['from'] ?? null;
    $to  = $opts['to']  ?? null;
    $page = max(1, (int)($opts['page'] ?? 1));
    $per = max(1, min(100, (int)($opts['per_page'] ?? 20)));
    $offset = ($page - 1) * $per;

    $sort = in_array(($opts['sort'] ?? 'created_at'), ['created_at', 'name', 'email', 'id'], true) ? $opts['sort'] : 'created_at';
    $dir  = strtolower($opts['dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

    $where = [];
    $params = [];
    if ($q) {
        $where[] = "(LOWER(name) LIKE :q OR LOWER(email) LIKE :q)";
        $params[':q'] = '%' . mb_strtolower($q) . '%';
    }
    if ($from) {
        $where[] = "date(created_at) >= date(:from)";
        $params[':from'] = $from;
    }
    if ($to) {
        $where[] = "date(created_at) <= date(:to)";
        $params[':to'] = $to;
    }

    $sqlBase = "FROM customers" . ($where ? " WHERE " . implode(" AND ", $where) : "");

    $stmt = $pdo->prepare("SELECT COUNT(*) AS c $sqlBase");
    $stmt->execute($params);
    $total = (int)$stmt->fetchColumn();

    $stmt = $pdo->prepare("SELECT * $sqlBase  LIMIT :lim OFFSET :off");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $per, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    return ['data' => $rows, 'total' => $total, 'page' => $page, 'per_page' => $per];
}

function getCustomer(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function createCustomer(PDO $pdo, string $email, string $name): int
{
    $stmt = $pdo->prepare("INSERT INTO customers(email, name) VALUES(?, ?)");
    $stmt->execute([$email, $name]);
    return (int)$pdo->lastInsertId();
}

function updateCustomer(PDO $pdo, int $id, string $email, string $name): void
{
    $stmt = $pdo->prepare("UPDATE customers SET email = ?, name = ? WHERE id = ?");
    $stmt->execute([$email, $name, $id]);
}

function deleteCustomer(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
    $stmt->execute([$id]);
}
