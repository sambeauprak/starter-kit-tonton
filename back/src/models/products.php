<?php

declare(strict_types=1);

/** Liste produits filtrable + pagination + tri */
function getProducts(PDO $pdo, array $opts = []): array
{
    $q   = $opts['q'] ?? null;
    $categoryId = isset($opts['category_id']) ? (int)$opts['category_id'] : null;
    $page = max(1, (int)($opts['page'] ?? 1));
    $per = max(1, min(100, (int)($opts['per_page'] ?? 20)));
    $offset = ($page - 1) * $per;

    $sort = in_array(($opts['sort'] ?? 'created_at'), ['created_at', 'title', 'price', 'stock', 'id'], true) ? $opts['sort'] : 'created_at';
    $dir  = strtolower($opts['dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

    $where = [];
    $params = [];
    if ($q) {
        $where[] = "(LOWER(title) LIKE :q OR LOWER(sku) LIKE :q)";
        $params[':q'] = '%' . mb_strtolower($q) . '%';
    }
    if ($categoryId) {
        $where[] = "EXISTS(SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = :cid)";
        $params[':cid'] = $categoryId;
    }

    $sqlBase = "FROM products p" . ($where ? " WHERE " . implode(" AND ", $where) : "");

    $stmt = $pdo->prepare("SELECT COUNT(*) $sqlBase");
    $stmt->execute($params);
    $total = (int)$stmt->fetchColumn();

    $stmt = $pdo->prepare("SELECT p.* $sqlBase  LIMIT :lim OFFSET :off");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $per, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    return ['data' => $rows, 'total' => $total, 'page' => $page, 'per_page' => $per];
}

function getProduct(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function createProduct(PDO $pdo, string $sku, string $title, int $price, int $stock = 0): int
{
    $stmt = $pdo->prepare("INSERT INTO products(sku, title, price, stock) VALUES(?, ?, ?, ?)");
    $stmt->execute([$sku, $title, $price, $stock]);
    return (int)$pdo->lastInsertId();
}

function updateProduct(PDO $pdo, int $id, string $sku, string $title, int $price, int $stock): void
{
    $stmt = $pdo->prepare("UPDATE products SET sku=?, title=?, price=?, stock=? WHERE id=?");
    $stmt->execute([$sku, $title, $price, $stock, $id]);
}

function deleteProduct(PDO $pdo, int $id): void
{
    // Peut échouer si des order_items référencent ce produit (RESTRICT)
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
}

/* --- Fonctions pivot dans le modèle A (products) --- */

function getProductCategories(PDO $pdo, int $product_id): array
{
    $stmt = $pdo->prepare("
        SELECT c.* FROM categories c
        JOIN product_categories pc ON pc.category_id = c.id
        WHERE pc.product_id = ?
        ORDER BY c.name ASC
    ");
    $stmt->execute([$product_id]);
    return $stmt->fetchAll();
}

function setProductCategories(PDO $pdo, int $product_id, array $category_ids): void
{
    $pdo->beginTransaction();
    try {
        $pdo->prepare("DELETE FROM product_categories WHERE product_id = ?")->execute([$product_id]);
        $ins = $pdo->prepare("INSERT INTO product_categories(product_id, category_id) VALUES(?, ?)");
        foreach (array_unique(array_map('intval', $category_ids)) as $cid) {
            $ins->execute([$product_id, $cid]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}
