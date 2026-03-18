const posts = [];

function computeStats(items) {
  const total = items.length;
  const buckets = {
    happy: 0,
    sad: 0,
    angry: 0,
    calm: 0,
    excited: 0,
    anxious: 0,
    neutral: 0,
  };

  let intensitySum = 0;

  for (const post of items) {
    if (buckets[post.mood] === undefined) {
      buckets.neutral += 1;
    } else {
      buckets[post.mood] += 1;
    }
    intensitySum += Number(post.intensity || 0);
  }

  let dominantMood = 'neutral';
  let dominantValue = -1;

  for (const [mood, count] of Object.entries(buckets)) {
    if (count > dominantValue) {
      dominantMood = mood;
      dominantValue = count;
    }
  }

  const distribution = Object.entries(buckets).map(([mood, count]) => ({
    mood,
    count,
    percentage: total ? Number(((count / total) * 100).toFixed(1)) : 0,
  }));

  return {
    totalPosts: total,
    dominantMood,
    averageIntensity: total ? Number((intensitySum / total).toFixed(2)) : 0,
    distribution,
  };
}

export const postStore = {
  list(filterMood, filterAuthor) {
    const sorted = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sorted.filter((post) => {
      const moodMatches = !filterMood || filterMood === 'all' || post.mood === filterMood;
      const authorMatches = !filterAuthor || post.author === filterAuthor;
      return moodMatches && authorMatches;
    });
  },

  add({ author, text, mood, intensity }) {
    const post = {
      id: `p${Date.now().toString(36)}`,
      author: author?.trim() || 'Anonymous',
      text: text.trim(),
      mood: mood || 'neutral',
      intensity: intensity || 0.5,
      reactions: {},
      reactedUsers: [],
      createdAt: new Date().toISOString(),
    };

    posts.push(post);
    return post;
  },

  react(postId, emoji, actorId) {
    const post = posts.find((item) => item.id === postId);
    if (!post) return { error: 'not-found' };

    if (!actorId) {
      return { error: 'actor-required' };
    }

    const alreadyReacted = post.reactedUsers.includes(actorId);

    if (alreadyReacted) {
      post.reactedUsers = post.reactedUsers.filter((id) => id !== actorId);
      post.reactions[emoji] = Math.max((post.reactions[emoji] || 1) - 1, 0);
      return { post, liked: false };
    }

    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
    post.reactedUsers.push(actorId);

    return { post, liked: true };
  },

  stats() {
    return computeStats(posts);
  },
};
