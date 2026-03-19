// Simple heuristic-based mood analyzer
const moodKeywords = {
  happy: ['happy', 'joy', 'smile', 'great', 'awesome', 'good', 'fantastic', 'love', 'wonderful', 'amazing'],
  sad: ['sad', 'cry', 'lonely', 'down', 'hurt', 'depress', 'unhappy', 'miserable', 'heartbreak', 'sorrow', 'tears', 'gloom'],
  angry: ['angry', 'mad', 'hate', 'furious', 'rage', 'annoy', 'frustrate', 'irritate', 'resent', 'outrage', 'fury', 'aggravate'],
  calm: ['calm', 'peace', 'relax', 'quiet', 'stable', 'serene', 'tranquil', 'composed', 'chill', 'soothe', 'content', 'balanced'],
  excited: ['excited', 'hyped', 'wow', 'thrilled', 'cant wait', 'ecstatic', 'over the moon', 'pumped', 'elated', 'delighted', 'enthusiastic', 'exhilarated'],
  anxious: ['anxious', 'nervous', 'panic', 'worried', 'stress', 'fear', 'uneasy', 'tense', 'apprehensive', 'freak out', 'overthink', 'dread', 'unease'],
};

// Clamp a number between 0 and 1, treating non-numeric values as 0.5
function clamp01(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return 0.5;
  return Math.max(0, Math.min(1, numberValue));
}

// Analyze mood using simple keyword matching and intensity estimation
function heuristicAnalyze(text) {
  const lowerText = text.toLowerCase();
  const scores = {};

  // Count keyword matches for each mood
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    scores[mood] = keywords.filter(keyword => lowerText.includes(keyword)).length;
  }

  // Find dominant mood with tie-breaking for neutral fallback
  const [bestMood, bestScore] = Object.entries(scores).reduce(
    ([mood, score], [currentMood, currentScore]) => 
      currentScore > score ? [currentMood, currentScore] : [mood, score],
    ['neutral', 0]
  );

  // Calculate intensity with better scaling
  // Formula: base (0.3) + keyword density + text length factor
  const keywordDensity = Math.min(0.35, bestScore * 0.1); // Caps at 0.45 total
  const lengthFactor = Math.min(0.2, text.length / 500); // Text length factor (up to 0.2)
  const intensity = bestScore === 0 ? 0.35 : clamp01(0.3 + keywordDensity + lengthFactor);

  return {
    mood: bestMood,
    intensity,
    source: 'heuristic',
  };
}

// Main function to analyze mood, with error handling for empty or invalid input
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
