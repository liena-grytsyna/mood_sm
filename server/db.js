import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(currentDir, 'data');
const dbPath = process.env.SQLITE_PATH || path.join(dataDir, 'mood.db');

let db = null;
let sqliteEnabled = false;
let sqliteUnavailableReason = '';
let sqliteDriver = '';

function createSchema(connection) {
  connection.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  
  connection.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      mood TEXT NOT NULL,
      intensity REAL NOT NULL,
      reactions TEXT NOT NULL DEFAULT '{}',
      reacted_users TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      FOREIGN KEY (author) REFERENCES users(username)
    )
  `);
}

try {
  fs.mkdirSync(dataDir, { recursive: true });

  const { DatabaseSync } = await import('node:sqlite');
  const builtInDb = new DatabaseSync(dbPath);
  builtInDb.exec('PRAGMA journal_mode = WAL;');
  builtInDb.exec('PRAGMA foreign_keys = ON;');
  createSchema(builtInDb);

  db = builtInDb;
  sqliteEnabled = true;
  sqliteDriver = 'node:sqlite';
} catch (error) {
  sqliteUnavailableReason = error instanceof Error ? error.message : String(error);
}

export { db, dbPath, sqliteEnabled, sqliteDriver, sqliteUnavailableReason };
