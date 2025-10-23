# Documentation — Système de migrations (Tonton)

Ce guide montre comment créer des migrations **exemple** autour d'une table `notes`, puis comment utiliser les **migrations de base** fournies pour le starter.

---

## 1) Création d'une table `notes` (exemple)

Créez une migration :

```bash
php tonton make:migration create_notes_table
```

Deux fichiers sont créés dans `back/migration/` :

```
YYYYMMDDHHMMSS_create_notes_table.up.sql
YYYYMMDDHHMMSS_create_notes_table.down.sql
```

### Contenu recommandé — `.up.sql`

```sql
-- CREATE
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INSERT (exemples)
INSERT INTO notes (title, content) VALUES
  ('Première note', 'Ceci est une note de démo.'),
  ('Deuxième note', 'Un autre contenu de test.');

-- ALTER TABLE (exemple d'évolution)
ALTER TABLE notes ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
```

### Contenu recommandé — `.down.sql`

```sql
-- Pour rollback: remettre l'état antérieur
-- (Selon vos contraintes, vous pouvez soit supprimer la colonne,
-- soit dropper et recréer la table. Le plus simple ici: on droppe la table.)
DROP TABLE IF EXISTS notes;
```

> Vous pouvez aussi scinder `CREATE` / `INSERT` / `ALTER TABLE` en **plusieurs** migrations (plus réaliste), par ex:  
> `create_notes_table` → `seed_notes` → `add_archived_to_notes`.

Appliquez la migration :

```bash
php tonton migrate
```

Rollback si nécessaire :

```bash
php tonton rollback    # 1 étape
php tonton rollback 2  # 2 étapes, etc.
```
