-- Initial schema for dotsduelsOnline
-- Players table
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  hp INTEGER DEFAULT 200,
  class INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Matches table (store simple match metadata)
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player1_id INTEGER,
  player2_id INTEGER,
  winner_id INTEGER,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME,
  FOREIGN KEY(player1_id) REFERENCES players(id),
  FOREIGN KEY(player2_id) REFERENCES players(id),
  FOREIGN KEY(winner_id) REFERENCES players(id)
);

-- Example: player stats / scores
CREATE TABLE IF NOT EXISTS player_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(player_id) REFERENCES players(id)
);
