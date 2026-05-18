# Database folder

Contains SQLite schema and a small Node script to create `app.db`.

Usage:

1. Install dependencies from the project root:

```bash
npm install
```

2. Initialize the database (creates `database/app.db` and runs `schema.sql`):

```bash
npm run init-db
```

Files:
- `schema.sql` — SQL schema used to create tables.
- `init_db.js` — Node script that reads `schema.sql` and creates `app.db`.
