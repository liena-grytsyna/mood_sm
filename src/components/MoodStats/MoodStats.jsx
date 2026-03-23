import './MoodStats.scss';

function MoodStats({ stats }) {
  if (!stats) return null;

  const averageIntensity = Math.round((stats.averageIntensity || 0) * 100);
  const dominantMood = stats.dominantMood
    ? `${stats.dominantMood.charAt(0).toUpperCase()}${stats.dominantMood.slice(1)}`
    : 'Neutral';

  return (
    <div className="mood-stats">
      <div className="mood-stats__item mood-stats__item--total">
        <p className="mood-stats__label">Total posts</p>
        <p className="mood-stats__value">{stats.totalPosts}</p>
      </div>
      <div className="mood-stats__item mood-stats__item--intensity">
        <p className="mood-stats__label">Average intensity</p>
        <p className="mood-stats__value">{averageIntensity}%</p>
      </div>
      <div className="mood-stats__item mood-stats__item--dominant">
        <p className="mood-stats__label">Dominant mood</p>
        <p className="mood-stats__value">{dominantMood}</p>
      </div>
    </div>
  );
}

export default MoodStats;
