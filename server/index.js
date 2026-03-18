import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { analyzeMood } from './services/moodAnalyzer.js';
import { postStore } from './store/postStore.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/posts', (req, res) => {
  const mood = req.query.mood;
  const author = req.query.author;
  const posts = postStore.list(mood, author);
  res.json({ posts });
});

app.get('/api/profile/stats', (_req, res) => {
  const stats = postStore.stats();
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

  if (result.error === 'actor-required') {
    res.status(400).json({ error: 'actorId is required.' });
    return;
  }

  res.json({ post: result.post, liked: result.liked });
});

app.listen(PORT, () => {
  console.log(`Mood API running at http://localhost:${PORT}`);
});
