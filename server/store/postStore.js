import { db, sqliteEnabled } from '../db.js';
import { createId, normalizeLower, normalizeText, parseStoredJson, sortByNewest } from './storeUtils.js';

// storage for posts if sqlite is not avaible.
const posts = []; 

// posible moods for posts
const moods = ['happy', 'sad', 'angry', 'calm', 'excited', 'anxious', 'neutral'];

//normalize mood value.
function normalizeMood(mood) {
  if (moods.includes(mood)) {
    return mood;
  }
  return 'neutral';
}

// create a new post object
function createPost(author, text, mood) {
  return {
    id: createId('p'),
    author: normalizeText(author) || 'Anonymous',
    text: normalizeText(text),
    mood: normalizeMood(mood),
    reactions: {},
    reactedUsers: [],
    createdAt: new Date().toISOString(),
  };
}

//form a post object from a database row
function mapRowToPost(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    author: row.author,
    text: row.text,
    mood: normalizeMood(row.mood),
    reactions: parseStoredJson(row.reactions, {}),
    reactedUsers: parseStoredJson(row.reacted_users, []),
    createdAt: row.created_at,
  };
}

//get all posts
function getAllPosts(filterMood, filterAuthor) {
  let items = [];

  if (sqliteEnabled) {
    const rows = db
      .prepare('SELECT * FROM posts ORDER BY created_at DESC')
      .all();
    items = rows.map(mapRowToPost);
  } else {
    items = sortByNewest([...posts], 'createdAt');
  }

  const mood = normalizeLower(filterMood);
  const author = normalizeLower(filterAuthor);

  return items.filter((post) => {
    if (mood && normalizeLower(post.mood) !== mood) {
      return false;
    }

    if (author && normalizeLower(post.author) !== author) {
      return false;
    }

    return true;
  });
}

// get a single post by id
function getPostById(postId) {
  if (sqliteEnabled) {
    const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    return mapRowToPost(row);
  }

  for (let post of posts) {
    if (post.id === postId) {
      return post;
    }
  }

  return null;
}

// add post
function addPost(post) {
  if (sqliteEnabled) {
    db.prepare(`
      INSERT INTO posts (id, author, text, mood, reactions, reacted_users, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      post.id,
      post.author,
      post.text,
      post.mood,
      JSON.stringify(post.reactions),
      JSON.stringify(post.reactedUsers),
      post.createdAt
    );
  } else {
    posts.push(post);
  }

  return post;
}

// update reactions for post
function updateReaction(post) {
  if (sqliteEnabled) {
    db.prepare(`
      UPDATE posts
      SET reactions = ?, reacted_users = ?
      WHERE id = ?
    `).run(
      JSON.stringify(post.reactions),
      JSON.stringify(post.reactedUsers),
      post.id
    );
  }
}

// reaction logic for posts
function reactToPost(post, emoji, actorId) {
  // if user reacted -> remove reaction, else add reaction
  if (post.reactedUsers.includes(actorId)) {
    post.reactedUsers = post.reactedUsers.filter((id) => id !== actorId);
    post.reactions[emoji] = Math.max(0, (post.reactions[emoji] || 0) - 1);
    return false;
  } else {
    post.reactedUsers.push(actorId);
    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
    return true;
  }
}

// get staistics for posts
function getStats(filterAuthor) {
  const items = getAllPosts(null, filterAuthor);
// count moods
  const counts = {
    happy: 0,
    sad: 0,
    angry: 0,
    calm: 0,
    excited: 0,
    anxious: 0,
    neutral: 0,
  };
// count every mood in posts
  for (let post of items) {
    const mood = normalizeMood(post.mood);
    counts[mood]++;
  }
// find dominant mood
  let dominantMood = 'neutral';

  for (let mood of moods) {
    if (counts[mood] > counts[dominantMood]) {
      dominantMood = mood;
    }
  }
// create distribution array for response
  const distribution = moods.map((mood) => {
    let percentage = 0;

    if (items.length > 0) {
      percentage = Number(((counts[mood] / items.length) * 100).toFixed(1));
    }

    return {
      mood,
      count: counts[mood],
      percentage,
    };
  });

  return {
    totalPosts: items.length,
    dominantMood,
    distribution,
  };
}

// export posts
export const postStore = {
  list(mood, author) {
    return getAllPosts(mood, author);
  },
// add new post
  add({ author, text, mood }) {
    const post = createPost(author, text, mood);
    return addPost(post);
  },
// add or remove reaction for post
  react(postId, emoji, actorId) {
    if (!actorId) {
      return { error: 'actor-required' };
    }

    const post = getPostById(postId);

    if (!post) {
      return { error: 'not-found' };
    }

    const liked = reactToPost(post, emoji, actorId);
    updateReaction(post);

    return { post, liked };
  },
  stats(author) {
    return getStats(author);
  },
};