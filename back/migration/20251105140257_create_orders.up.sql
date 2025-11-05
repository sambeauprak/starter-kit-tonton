-- Up migration

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN (
            'pending',
            'paid',
            'refunded',
            'cancelled'
        )
    ),
    total INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT
);