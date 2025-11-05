<?php

declare(strict_types=1);

function getCategories(PDO $pdo, array $opts = []): array
{
    $q   = $opts['q'] ?? null;
    $where = [];
    $params = [];
    if ($q) {
        $where[] = "LOWER(name) LIKE :q";
        $params[':q'] = '%' . mb_strtolower($q) . '%';
    }

    $sqlBase = "FROM categories" . ($where ? " WHERE " . implode(" AND ", $where) : "");

    $total = (int)$pdo->query("SELECT COUNT(*) $sqlBase")->fetchColumn();

    $stmt = $pdo->prepare("SELECT * $sqlBase ORDER BY name ASC");
    $stmt->execute($params);
    return ['data' => $stmt->fetchAll(), 'total' => $total];
}

function getCategory(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function createCategory(PDO $pdo, string $name): int
{
    $stmt = $pdo->prepare("INSERT INTO categories(name) VALUES(?)");
    $stmt->execute([$name]);
    return (int)$pdo->lastInsertId();
}

function updateCategory(PDO $pdo, int $id, string $name): void
{
    $stmt = $pdo->prepare("UPDATE categories SET name = ? WHERE id = ?");
    $stmt->execute([$name, $id]);
}

function deleteCategory(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);
}
