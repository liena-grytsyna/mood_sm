import { randomBytes, scryptSync } from 'node:crypto';
import { db, sqliteEnabled } from '../db.js';
import { createId, normalizeLower } from './storeUtils.js';

// ake a masive for users if sqlite is not available
const users = [];

// pepper for password hashing
const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER || 'dev-pepper';

// create a random salt
function createSalt() {
  return randomBytes(16).toString('hex');
}

// passwors + salt + pepper -> hash :)
function hashPassword(password, salt) {
  return scryptSync(password + PASSWORD_PEPPER, salt, 64).toString('hex');
}

// create a new user object
function createUser(email, username, password) {
  const salt = createSalt();

  return {
    id: createId('u'),
    email,
    username,
    password_hash: hashPassword(password, salt),
    password_salt: salt,
    created_at: new Date().toISOString(),
  };
}

// find a user by username
function findUser(username) {
  if (sqliteEnabled) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) || null;
  }
// if not sqlite search in array
  for (let user of users) {
    if (user.username === username) {
      return user;
    }
  }

  return null;
}

// check if user exist 
function userExists(email, username) {
  if (sqliteEnabled) {
    const row = db
      .prepare('SELECT 1 FROM users WHERE email = ? OR username = ?')
      .get(email, username);
    return !!row;
  }

  return users.some((u) => u.email === email || u.username === username);
}

// save user 
function saveUser(user) {
  //in sqlite 
  if (sqliteEnabled) {
    db.prepare(`
      INSERT INTO users (id, email, username, password_hash, password_salt, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.email,
      user.username,
      user.password_hash,
      user.password_salt,
      user.created_at
    );
  } else { // in memory array
    users.push(user);
  }
}

// check password for user
function checkPassword(password, user) {
  const hash = hashPassword(password, user.password_salt);
  return hash === user.password_hash;
}

// return only public info about user
function publicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    created_at: user.created_at,
  };
}

// export api for user store
export const userStore = {
  // register new user
  register({ email, username, password }) {
    email = normalizeLower(email);
    username = normalizeLower(username);
// check for missing fields
    if (!email || !username || !password) {
      return { error: 'missing-fields' };
    }
// check for password length
    if (userExists(email, username)) {
      return { error: 'user-exists' };
    }
// create and save user
    const user = createUser(email, username, password);
    saveUser(user);
// return public info about user
    return { user: publicUser(user) };
  },
// login user
  login({ username, password }) {
    username = normalizeLower(username);
// check for missing fields
    if (!username || !password) {
      return { error: 'missing-fields' };
    }
// find user and check password
    const user = findUser(username);
// if user not found or password invalid return error
    if (!user) {
      return { error: 'not-found' };
    }
// check password
    if (!checkPassword(password, user)) {
      return { error: 'invalid-password' };
    }
// return public info about user
    return { user: publicUser(user) };
  },

  // get user by username
  getByUsername(username) {
    username = normalizeLower(username);
    if (!username) {
      return null;
    }
// find user and return public info
    return publicUser(findUser(username));
  },
};