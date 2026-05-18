const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbDir = path.join(__dirname);
const dbFile = path.join(dbDir, 'app.db');
const schemaFile = path.join(dbDir, 'schema.sql');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const schema = fs.existsSync(schemaFile) ? fs.readFileSync(schemaFile, 'utf8') : '';

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }

  if (schema) {
    db.exec(schema, (err) => {
      if (err) {
        console.error('Failed to run schema:', err);
      } else {
        console.log('Schema executed successfully.');
      }
      db.close();
    });
  } else {
    console.log('No schema.sql found — created empty database at', dbFile);
    db.close();
  }
});
