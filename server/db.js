import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(currentDir, 'data'); // path to data directory
const dbPath = path.join(dataDir, 'mood.db'); // path to database file

let db = null; // empty database variable
let sqliteEnabled = false; // indicator if sqlite is working

try {
  // ensure data directory exists
  fs.mkdirSync(dataDir, { recursive: true });
  // initialize sqlite database
  db = new DatabaseSync(dbPath);
  // create users table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `); 
  // create posts table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      mood TEXT NOT NULL,
      reactions TEXT NOT NULL,
      reacted_users TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  sqliteEnabled = true; // if we came here sqlite is working :D
} catch (error) {
  console.log('SQLite not working:', error.message); // if sqlite fail :( continue with in-memory storage
}

export { db, dbPath, sqliteEnabled }; // export database variables
