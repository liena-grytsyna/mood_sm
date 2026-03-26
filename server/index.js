import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { dbPath, sqliteEnabled } from './db.js';
import { analyzeMood } from './services/moodAnalyzer.js';
import { postStore } from './store/postStore.js';
import { userStore } from './store/userStore.js';

// create express app and set port
const app = express();
const PORT = process.env.PORT || 4000;

// setup middleware
app.use(cors());
app.use(express.json());

// log database status on startup
console.log(`Database path: ${dbPath}`);
console.log(`SQLite enabled: ${sqliteEnabled}`);

app.post('/api/register', (req, res) => {
  const email = req.body.email; // get email 
  const username = req.body.username; // get username 
  const password = req.body.password; // get password

  // validate input
  if (!email || !username || !password) {
    return res.status(400).json({
      error: 'Email, username, and password are required.'
    });
  }
  // check password length to short
  if (password.length < 8) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters.'
    });
  }
  // check password length to long
  if (password.length > 64) {
    return res.status(400).json({
      error: 'Password must be less than 64 characters.'
    });
  }
  // check password or email or username for spaces
  if (username.includes(' ') || email.includes(' ') || password.includes(' ')) {
    return res.status(400).json({
      error: 'Password must not contain spaces.'
    });
  }
  // check username length to short
  if (username.length < 1) {
    return res.status(400).json({
      error: 'Username must be at least 1 character.'
    });
  }
  // check username length to long
  if (username.length > 32) {
    return res.status(400).json({
      error: 'Username must be less than 32 characters.'
    });
  }
  // chech for script tags in username email or password
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(username) || 
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(email) || 
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(password)) {
    return res.status(400).json({
      error: 'Username, email, or password must not contain script tags.'
    });
  }
  
// register user
  const result = userStore.register({ email, username, password });
// ERROR HANDLING
// user exists error
  if (result.error === 'user-exists') {
    return res.status(409).json({
      error: 'User with this email or username already exists.'
    });
  }
// missing fields error
  if (result.error === 'missing-fields') {
    return res.status(400).json({
      error: 'Missing required fields.'
    });
  }
// return created user
  res.status(201).json({
    user: result.user
  });
});

// login endpoint
app.post('/api/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
// validate input
  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password are required.'
    });
  }
// login user
  const result = userStore.login({ username, password });
// ERROR HANDLING
// user not found error
  if (result.error === 'not-found') {
    return res.status(401).json({
      error: 'User not found.'
    });
  }
// invalid password error
  if (result.error === 'invalid-password') {
    return res.status(401).json({
      error: 'Invalid password.'
    });
  }
// missing fields error
  if (result.error === 'missing-fields') {
    return res.status(400).json({
      error: 'Missing required fields.'
    });
  }
// return logged in user
  res.json({
    user: result.user
  });
});

app.get('/api/posts', (req, res) => {
  const mood = req.query.mood; 
  const author = req.query.author;
  const posts = postStore.list(mood, author);
  res.json({
    posts: posts
  });
});

// profile stats endpoint
app.get('/api/profile/stats', (req, res) => {
  const author = req.query.author;
  const stats = postStore.stats(author);

  res.json({
    stats: stats
  });
});

// create new post endpoint
app.post('/api/posts', async (req, res) => {
  const author = req.body.author;
  const text = req.body.text;
// VALIDATE
// check for missing fields
  if (!text || !text.trim()) {
    return res.status(400).json({
      error: 'Post text is required.'
    });
  }
// check for text length
  if (text.length < 1 || text.length > 280) {
    return res.status(400).json({
      error: 'Post text must be between 1 and 280 characters.'
    });
  }

  const result = await analyzeMood(text);

  const post = postStore.add({
    author: author,
    text: text,
    mood: result.mood
  });

  res.status(201).json({
    post: post,
    analysis: {
      source: result.source
    }
  });
});
// react to post endpoint
app.post('/api/posts/:postId/reactions', (req, res) => {
  const postId = req.params.postId;
  const emoji = req.body.emoji;
  const actorId = req.body.actorId;
  if (!actorId) {
    return res.status(400).json({
      error: 'actorId is required.'
    });
  }

  const result = postStore.react(postId, emoji, actorId);

  if (result.error === 'not-found') {
    return res.status(404).json({
      error: 'Post not found.'
    });
  }

  res.json({
    post: result.post,
    liked: result.liked
  });
});

// start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server started on port ' + PORT);

  if (sqliteEnabled) {
    console.log('Database is working: ' + dbPath);
  } else {
    console.log('Database is not working, using memory');
  }
});