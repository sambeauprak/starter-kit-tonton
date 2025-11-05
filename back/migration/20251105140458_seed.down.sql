-- Down migration

DELETE FROM order_items;

DELETE FROM orders;

DELETE FROM product_categories;

DELETE FROM products;

DELETE FROM categories;

DELETE FROM customers;

/* Reset AUTOINCREMENT */
DELETE FROM sqlite_sequence
WHERE
    name IN (
        'customers',
        'products',
        'categories',
        'orders',
        'order_items'
    );