import { createHash } from 'node:crypto';
import { db, sqliteEnabled } from '../db.js';
import { createId, normalizeLower } from './storeUtils.js';

const users = [];
const USER_FIELDS = 'id, email, username, password_hash, created_at';

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    created_at: user.created_at,
  };
}

function createUserRecord({ email, username, password }) {
  return {
    id: createId('u'),
    email,
    username,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
  };
}

function findUserByEmail(email) {
  if (sqliteEnabled) {
    return db.prepare(`SELECT ${USER_FIELDS} FROM users WHERE email = ?`).get(email) || null;
  }

  return users.find((user) => user.email === email) || null;
}

function findUserByUsername(username) {
  if (sqliteEnabled) {
    return db.prepare(`SELECT ${USER_FIELDS} FROM users WHERE username = ?`).get(username) || null;
  }

  return users.find((user) => user.username === username) || null;
}

function userExists(email, username) {
  if (sqliteEnabled) {
    return Boolean(db.prepare('SELECT 1 FROM users WHERE email = ? OR username = ?').get(email, username));
  }

  return users.some((user) => user.email === email || user.username === username);
}

function saveUser(user) {
  if (sqliteEnabled) {
    db.prepare(`
      INSERT INTO users (id, email, username, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.id, user.email, user.username, user.password_hash, user.created_at);

    return;
  }

  users.push(user);
}

export const userStore = {
  register({ email, username, password }) {
    const normalizedEmail = normalizeLower(email);
    const normalizedUsername = normalizeLower(username);

    if (!normalizedEmail || !normalizedUsername || !password) {
      return { error: 'missing-fields' };
    }

    if (userExists(normalizedEmail, normalizedUsername)) {
      return { error: 'user-exists' };
    }

    const user = createUserRecord({
      email: normalizedEmail,
      username: normalizedUsername,
      password,
    });

    saveUser(user);

    return { user: toPublicUser(user) };
  },

  login({ email, password }) {
    const normalizedEmail = normalizeLower(email);

    if (!normalizedEmail || !password) {
      return { error: 'missing-fields' };
    }

    const user = findUserByEmail(normalizedEmail);
    if (!user) {
      return { error: 'not-found' };
    }

    if (!verifyPassword(password, user.password_hash)) {
      return { error: 'invalid-password' };
    }

    return { user: toPublicUser(user) };
  },

  getByUsername(username) {
    const normalizedUsername = normalizeLower(username);

    if (!normalizedUsername) {
      return null;
    }

    return toPublicUser(findUserByUsername(normalizedUsername));
  },
};
