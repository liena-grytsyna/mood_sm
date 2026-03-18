const moodKeywords = {
  happy: ['happy', 'joy', 'smile', 'great', 'awesome', 'рад', 'счастлив'],
  sad: ['sad', 'cry', 'lonely', 'down', 'hurt', 'груст', 'печаль'],
  angry: ['angry', 'mad', 'hate', 'furious', 'rage', 'зл', 'бесит'],
  calm: ['calm', 'peace', 'relax', 'quiet', 'stable', 'спокойн', 'тихо'],
  excited: ['excited', 'hyped', 'wow', 'thrilled', 'cant wait', 'восторг', 'жду не дождусь'],
  anxious: ['anxious', 'nervous', 'panic', 'worried', 'stress', 'тревог', 'нервничаю'],
};

function clamp01(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return 0.5;
  return Math.max(0, Math.min(1, numberValue));
}

function heuristicAnalyze(text) {
  const lowerText = text.toLowerCase();
  const scores = {
    happy: 0,
    sad: 0,
    angry: 0,
    calm: 0,
    excited: 0,
    anxious: 0,
  };

  for (const mood of Object.keys(scores)) {
    for (const keyword of moodKeywords[mood]) {
      if (lowerText.includes(keyword)) {
        scores[mood] += 1;
      }
    }
  }

  let bestMood = 'neutral';
  let bestScore = 0;

  for (const [mood, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestMood = mood;
      bestScore = score;
    }
  }

  const lengthFactor = Math.min(1, Math.max(0.2, text.length / 220));
  const intensity = bestScore === 0 ? 0.35 : clamp01(0.3 + bestScore * 0.15 + lengthFactor * 0.25);

  return {
    mood: bestMood,
    intensity,
    source: 'heuristic',
  };
}

export async function analyzeMood(text) {
  if (!text || !text.trim()) {
    return {
      mood: 'neutral',
      intensity: 0.2,
      source: 'empty',
    };
  }

  return heuristicAnalyze(text);
}
