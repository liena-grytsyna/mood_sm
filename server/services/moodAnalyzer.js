// mood keywords
const moodKeywords = {
  happy: ['happy', 'joy', 'smile', 'great', 'awesome', 'good', 'fantastic', 'love', 'wonderful', 'amazing'],
  sad: ['sad', 'cry', 'lonely', 'down', 'hurt', 'depress', 'unhappy', 'miserable', 'heartbreak', 'sorrow', 'tears', 'gloom'],
  angry: ['angry', 'mad', 'hate', 'furious', 'rage', 'annoy', 'frustrate', 'irritate', 'resent', 'outrage', 'fury', 'aggravate'],
  calm: ['calm', 'peace', 'relax', 'quiet', 'stable', 'serene', 'tranquil', 'composed', 'chill', 'soothe', 'content', 'balanced'],
  excited: ['excited', 'hyped', 'wow', 'thrilled', 'cant wait', 'ecstatic', 'over the moon', 'pumped', 'elated', 'delighted', 'enthusiastic', 'exhilarated'],
  anxious: ['anxious', 'nervous', 'panic', 'worried', 'stress', 'fear', 'uneasy', 'tense', 'apprehensive', 'freak out', 'overthink', 'dread', 'unease'],
};

// check text for mood keywords
function heuristicAnalyze(text) {
  const lowerText = text.toLowerCase();
  const scores = {};
// count keywords for each mood
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    scores[mood] = keywords.filter(keyword => lowerText.includes(keyword)).length;
  }
// find mood with highest score
  const [bestMood, bestScore] = Object.entries(scores).reduce(
    ([mood, score], [currentMood, currentScore]) => 
      currentScore > score ? [currentMood, currentScore] : [mood, score],
    ['neutral', 0]
  );
// if no keywords found, return neutral
  return {
    mood: bestScore === 0 ? 'neutral' : bestMood,
    source: 'heuristic',
  };
}
// if no text provided, return neutral mood
export async function analyzeMood(text) {
  if (!text || !text.trim()) {
    return {
      mood: 'neutral',
      source: 'empty',
    };
  }

  return heuristicAnalyze(text);
}
