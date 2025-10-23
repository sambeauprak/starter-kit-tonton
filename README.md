# TodoList Starter — Back/Front

## Dossiers

- `back/` : API PHP (PDO + SQLite), CORS `*`, JSON par défaut.
- `front/` : petit front JS(formulaire + liste), CSS minimal, toggle light/dark (switch animé).

## Lancer le back (PHP intégré)

```bash
php -S localhost:8000 -t public
```

Endpoints:

- `GET http://localhost:8000/tasks`
- `POST http://localhost:8000/tasks` (JSON ou form-urlencoded)

## Utiliser le front

Ouvrez `front/index.html` dans votre navigateur, ou servez-le avec un serveur statique.
Par défaut, il appelle `http://localhost:8000/tasks` (modifier `front/script.js` si besoin).
