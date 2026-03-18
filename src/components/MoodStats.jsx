function MoodStats({ stats }) {
  if (!stats) return null;

  return (
    <div>
      <p>Total posts: {stats.totalPosts}</p>
      <p>Average intensity: {stats.averageIntensity}</p>
      <p>Dominant mood: {stats.dominantMood}</p>
    </div>
  );
}

export default MoodStats;
