// Simple Express server for the Mood API
import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { dbPath, sqliteDriver, sqliteEnabled, sqliteUnavailableReason } from './db.js';
import { analyzeMood } from './services/moodAnalyzer.js';
import { postStore } from './store/postStore.js';
import { userStore } from './store/userStore.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.post('/api/register', (req, res) => {
  const { email, username, password } = req.body || {};

  if (!email || !username || !password) {
    res.status(400).json({ error: 'Email, username, and password are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const result = userStore.register({ email, username, password });

  if (result.error === 'user-exists') {
    res.status(409).json({ error: 'User with this email or username already exists.' });
    return;
  }

  if (result.error === 'missing-fields') {
    res.status(400).json({ error: 'Missing required fields.' });
    return;
  }

  res.status(201).json({ user: result.user });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const result = userStore.login({ email, password });

  if (result.error === 'not-found') {
    res.status(401).json({ error: 'User not found.' });
    return;
  }

  if (result.error === 'invalid-password') {
    res.status(401).json({ error: 'Invalid password.' });
    return;
  }

  if (result.error === 'missing-fields') {
    res.status(400).json({ error: 'Missing required fields.' });
    return;
  }

  res.status(200).json({ user: result.user });
});

app.get('/api/posts', (req, res) => {
  const mood = req.query.mood;
  const author = req.query.author;
  const posts = postStore.list(mood, author);
  res.json({ posts });
});

app.get('/api/profile/stats', (req, res) => {
  const author = req.query.author;
  const stats = postStore.stats(author);
  res.json({ stats });
});

app.post('/api/posts', async (req, res) => {
  const { author, text } = req.body || {};

  if (!text || !text.trim()) {
    res.status(400).json({ error: 'Post text is required.' });
    return;
  }

  const analysis = await analyzeMood(text);

  const post = postStore.add({
    author,
    text,
    mood: analysis.mood,
    intensity: analysis.intensity,
  });

  res.status(201).json({ post, analysis: { source: analysis.source } });
});

app.post('/api/posts/:postId/reactions', (req, res) => {
  const { postId } = req.params;
  const { emoji, actorId } = req.body || {};

  if (!emoji || typeof emoji !== 'string') {
    res.status(400).json({ error: 'Emoji is required.' });
    return;
  }

  if (emoji !== '👍') {
    res.status(400).json({ error: 'Only like reaction is supported.' });
    return;
  }

  if (!actorId || typeof actorId !== 'string') {
    res.status(400).json({ error: 'actorId is required.' });
    return;
  }

  const result = postStore.react(postId, emoji, actorId);

  if (result.error === 'not-found') {
    res.status(404).json({ error: 'Post not found.' });
    return;
  }

  res.json({ post: result.post, liked: result.liked });
});

app.listen(PORT, () => {
  console.log(`Mood API running at http://localhost:${PORT}`);
  if (sqliteEnabled) {
    console.log(`SQLite storage enabled at ${dbPath} (driver: ${sqliteDriver})`);
  } else {
    console.warn(`SQLite is not active. Falling back to in-memory storage. Reason: ${sqliteUnavailableReason}`);
  }
});
