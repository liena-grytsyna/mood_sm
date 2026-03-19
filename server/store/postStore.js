const posts = [];

function computeStats(items) {
  if (!items.length) {
    return {
      totalPosts: 0,
      dominantMood: 'neutral',
      averageIntensity: 0,
      distribution: [
        { mood: 'happy', count: 0, percentage: 0 },
        { mood: 'sad', count: 0, percentage: 0 },
        { mood: 'angry', count: 0, percentage: 0 },
        { mood: 'calm', count: 0, percentage: 0 },
        { mood: 'excited', count: 0, percentage: 0 },
        { mood: 'anxious', count: 0, percentage: 0 },
        { mood: 'neutral', count: 0, percentage: 0 },
      ],
    };
  }

  const buckets = {};
  let intensitySum = 0;

  // Single pass through items
  for (const post of items) {
    const mood = post.mood || 'neutral';
    buckets[mood] = (buckets[mood] || 0) + 1;
    intensitySum += Number(post.intensity || 0);
  }

  // Ensure all moods exist in buckets
  const moodList = ['happy', 'sad', 'angry', 'calm', 'excited', 'anxious', 'neutral'];
  moodList.forEach(mood => {
    if (!(mood in buckets)) buckets[mood] = 0;
  });

  // Find dominant mood
  const [dominantMood] = Object.entries(buckets).reduce(
    ([mood, count], [currentMood, currentCount]) => 
      currentCount > count ? [currentMood, currentCount] : [mood, count],
    ['neutral', 0]
  );

  const distribution = moodList.map(mood => ({
    mood,
    count: buckets[mood],
    percentage: Number(((buckets[mood] / items.length) * 100).toFixed(1)),
  }));

  return {
    totalPosts: items.length,
    dominantMood,
    averageIntensity: Number((intensitySum / items.length).toFixed(2)),
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
    if (!actorId) return { error: 'actor-required' };

    const alreadyReacted = post.reactedUsers.includes(actorId);

    if (alreadyReacted) {
      // Remove reaction: filter user out and decrement count (min 0)
      post.reactedUsers = post.reactedUsers.filter((id) => id !== actorId);
      post.reactions[emoji] = Math.max(0, (post.reactions[emoji] || 0) - 1);
      return { post, liked: false };
    }

    // Add reaction: increment count and add user
    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
    post.reactedUsers.push(actorId);
    return { post, liked: true };
  },

  stats() {
    return computeStats(posts);
  },
};
