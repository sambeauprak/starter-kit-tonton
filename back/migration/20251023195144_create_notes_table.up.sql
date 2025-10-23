-- Up migration
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    notes (title, content)
VALUES (
        'Première note',
        'Ceci est une note de démo.'
    ),
    (
        'Deuxième note',
        'Un autre contenu de test.'
    );