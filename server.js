const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, 'database', 'app.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not open database', err);
  } else {
    console.log('Connected to', dbPath);
  }
});

// Register: create player with unique name and hashed password
app.post('/api/register', (req, res) => {
  const { name, password } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (!password || !password.trim()) return res.status(400).json({ error: 'Password is required' });

  const trimmed = name.trim();
  const hash = bcrypt.hashSync(password, 10);
  const stmt = `INSERT INTO players (name, password) VALUES (?, ?)`;

  db.run(stmt, [trimmed, hash], function (err) {
    if (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Name already exists' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    const playerId = this.lastID;
    db.run(`INSERT INTO player_stats (player_id) VALUES (?)`, [playerId], (e) => {
      if (e) console.error('Failed to create stats row', e);
    });

    res.json({ id: playerId, name: trimmed, hp: 200 });
  });
});

// Login by name and password
app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (!password || !password.trim()) return res.status(400).json({ error: 'Password is required' });

  const trimmed = name.trim();
  db.get(`SELECT id, name, hp, class, password FROM players WHERE name = ?`, [trimmed], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Account not found' });

    if (!bcrypt.compareSync(password, row.password)) {
      return res.status(401).json({ error: 'Invalid name or password' });
    }

    const { password: _, ...user } = row;
    res.json(user);
  });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
