import { db, sqliteEnabled } from '../db.js';
import { createId, normalizeText, parseStoredJson, sortByNewest } from './storeUtils.js';

// In-memory store for posts (used if SQLite is not enabled)
const posts = [];
const moods = ['happy', 'sad', 'angry', 'calm', 'excited', 'anxious', 'neutral'];
const moodSet = new Set(moods);
const POST_FIELDS = 'id, author, text, mood, intensity, reactions, reacted_users, created_at';

// Helper functions for normalizing and mapping data
function normalizeMood(value) {
  return moodSet.has(value) ? value : 'neutral';
}

// Clamp intensity to [0, 1], treating non-numeric values as 0.5
function normalizeIntensity(value) {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return 0.5;
  }

  return Math.max(0, Math.min(1, numeric));
}

// Map a database row to a post object, with normalization and JSON parsing
function mapRowToPost(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    author: row.author,
    text: row.text,
    mood: normalizeMood(row.mood),
    intensity: normalizeIntensity(row.intensity),
    reactions: parseStoredJson(row.reactions, {}),
    reactedUsers: parseStoredJson(row.reacted_users, []),
    createdAt: row.created_at,
  };
}

//
function createPostRecord({ author, text, mood, intensity }) {
  return {
    id: createId('p'),
    author: normalizeText(author) || 'Anonymous',
    text: normalizeText(text),
    mood: normalizeMood(mood),
    intensity: normalizeIntensity(intensity),
    reactions: {},
    reactedUsers: [],
    createdAt: new Date().toISOString(),
  };
}

function buildPostQuery({ mood, author, newestFirst = false } = {}) {
  const clauses = [];
  const params = [];

  if (mood && mood !== 'all') {
    clauses.push('mood = ?');
    params.push(mood);
  }

  if (author) {
    clauses.push('author = ?');
    params.push(author);
  }

  return {
    params,
    whereClause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    orderClause: newestFirst ? 'ORDER BY created_at DESC' : '',
  };
}

function getPosts(options = {}) {
  if (sqliteEnabled) {
    const { whereClause, orderClause, params } = buildPostQuery(options);
    const rows = db.prepare(`
      SELECT ${POST_FIELDS}
      FROM posts
      ${whereClause}
      ${orderClause}
    `).all(...params);

    return rows.map(mapRowToPost);
  }

  const filtered = posts.filter((post) => {
    const moodMatches = !options.mood || options.mood === 'all' || post.mood === options.mood;
    const authorMatches = !options.author || post.author === options.author;
    return moodMatches && authorMatches;
  });

  return options.newestFirst ? sortByNewest(filtered, 'createdAt') : filtered;
}

function getPostById(postId) {
  if (sqliteEnabled) {
    const row = db.prepare(`
      SELECT ${POST_FIELDS}
      FROM posts
      WHERE id = ?
    `).get(postId);

    return mapRowToPost(row);
  }

  return posts.find((post) => post.id === postId) || null;
}

function savePost(post) {
  if (sqliteEnabled) {
    db.prepare(`
      INSERT INTO posts (id, author, text, mood, intensity, reactions, reacted_users, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      post.id,
      post.author,
      post.text,
      post.mood,
      post.intensity,
      JSON.stringify(post.reactions),
      JSON.stringify(post.reactedUsers),
      post.createdAt,
    );

    return post;
  }

  posts.push(post);
  return post;
}

function savePostReactionState(post) {
  if (!sqliteEnabled) {
    return;
  }

  db.prepare(`
    UPDATE posts
    SET reactions = ?, reacted_users = ?
    WHERE id = ?
  `).run(
    JSON.stringify(post.reactions),
    JSON.stringify(post.reactedUsers),
    post.id,
  );
}

function toggleReaction(post, emoji, actorId) {
  const alreadyReacted = post.reactedUsers.includes(actorId);

  if (alreadyReacted) {
    post.reactedUsers = post.reactedUsers.filter((id) => id !== actorId);
    post.reactions[emoji] = Math.max(0, (post.reactions[emoji] || 0) - 1);
    return false;
  }

  post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
  post.reactedUsers.push(actorId);
  return true;
}

function computeStats(items) {
  if (!items.length) {
    return {
      totalPosts: 0,
      dominantMood: 'neutral',
      averageIntensity: 0,
      distribution: moods.map((mood) => ({ mood, count: 0, percentage: 0 })),
    };
  }

  const counts = Object.fromEntries(moods.map((mood) => [mood, 0]));
  let intensitySum = 0;

  for (const post of items) {
    const mood = normalizeMood(post.mood);
    counts[mood] += 1;
    intensitySum += Number(post.intensity || 0);
  }

  let dominantMood = 'neutral';

  for (const mood of moods) {
    if (counts[mood] > counts[dominantMood]) {
      dominantMood = mood;
    }
  }

  return {
    totalPosts: items.length,
    dominantMood,
    averageIntensity: Number((intensitySum / items.length).toFixed(2)),
    distribution: moods.map((mood) => ({
      mood,
      count: counts[mood],
      percentage: Number(((counts[mood] / items.length) * 100).toFixed(1)),
    })),
  };
}

export const postStore = {
  list(filterMood, filterAuthor) {
    return getPosts({
      mood: filterMood,
      author: filterAuthor,
      newestFirst: true,
    });
  },

  add({ author, text, mood, intensity }) {
    const post = createPostRecord({ author, text, mood, intensity });
    return savePost(post);
  },

  react(postId, emoji, actorId) {
    if (!actorId) {
      return { error: 'actor-required' };
    }

    const post = getPostById(postId);
    if (!post) {
      return { error: 'not-found' };
    }

    const liked = toggleReaction(post, emoji, actorId);
    savePostReactionState(post);

    return { post, liked };
  },

  stats(filterAuthor) {
    return computeStats(getPosts({ author: filterAuthor }));
  },
};
