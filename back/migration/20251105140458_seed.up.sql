-- Up migration

/* --- Catégories --- */
INSERT INTO
    categories (name)
VALUES ('T-shirts'),
    ('Hoodies'),
    ('Accessories'),
    ('Pants'),
    ('Shoes');

/* --- Produits (20) --- */
WITH RECURSIVE
    seq (n) AS (
        SELECT 1
        UNION ALL
        SELECT n + 1
        FROM seq
        WHERE
            n < 20
    )
INSERT INTO
    products (
        sku,
        title,
        price,
        stock,
        created_at
    )
SELECT printf('SKU%04d', n), printf('Produit %02d', n), ((abs(random()) % 9000) + 1000) * 100, -- 10€ à 100€
    (abs(random()) % 150), datetime(
        'now', '-' || (abs(random()) % 30) || ' days'
    )
FROM seq;

/* --- Clients (50) --- */
WITH RECURSIVE
    seq (n) AS (
        SELECT 1
        UNION ALL
        SELECT n + 1
        FROM seq
        WHERE
            n < 50
    )
INSERT INTO
    customers (email, name, created_at)
SELECT printf('client%02d@example.test', n), printf('Client %02d', n), datetime(
        'now', '-' || (abs(random()) % 60) || ' days'
    )
FROM seq;

/* --- Pivot produit↔catégorie : 1 à 2 catégories par produit --- */
INSERT INTO
    product_categories (product_id, category_id)
SELECT p.id, (
        (p.id - 1) % (
            SELECT COUNT(*)
            FROM categories
        )
    ) + 1
FROM products p;

INSERT INTO
    product_categories (product_id, category_id)
SELECT p.id, (
        (p.id) % (
            SELECT COUNT(*)
            FROM categories
        )
    ) + 1
FROM products p
WHERE (p.id % 2) = 0;
-- ~50% des produits ont une 2e catégorie

/* --- Commandes sur 14 jours (≈ 8/jour) --- */
WITH RECURSIVE
    days (d) AS (
        SELECT date('now', '-13 days')
        UNION ALL
        SELECT date(d, '+1 day')
        FROM days
        WHERE
            d < date('now')
    ),
    seq (n) AS (
        SELECT 1
        UNION ALL
        SELECT n + 1
        FROM seq
        WHERE
            n < 8
    )
INSERT INTO
    orders (
        customer_id,
        status,
        total,
        created_at
    )
SELECT (
        abs(random()) % (
            SELECT COUNT(*)
            FROM customers
        )
    ) + 1,
    CASE
        WHEN (abs(random()) % 100) < 75 THEN 'paid'
        WHEN (abs(random()) % 100) < 90 THEN 'pending'
        WHEN (abs(random()) % 100) < 95 THEN 'cancelled'
        ELSE 'refunded'
    END,
    0,
    datetime(
        d,
        printf(
            '+%d seconds',
            abs(random()) % 86400
        )
    )
FROM days, seq;

/* --- Lignes de commande : 1 à 4 items par commande --- */
WITH
    rep (n) AS (
        VALUES (1),
            (2),
            (3),
            (4)
    )
INSERT INTO
    order_items (
        order_id,
        product_id,
        quantity,
        unit_price
    )
SELECT order_id, pid, qty, (
        SELECT price
        FROM products
        WHERE
            id = pid
    )
FROM (
        SELECT o.id AS order_id, (
                SELECT id
                FROM products
                ORDER BY random()
                LIMIT 1
            ) AS pid, 1 + (abs(random()) % 3) AS qty
        FROM orders o
            JOIN rep ON rep.n <= 1 + (abs(random()) % 3)
    );

/* --- Mise à jour des totaux --- */
UPDATE orders
SET
    total = COALESCE(
        (
            SELECT SUM(oi.quantity * oi.unit_price)
            FROM order_items oi
            WHERE
                oi.order_id = orders.id
        ),
        0
    );