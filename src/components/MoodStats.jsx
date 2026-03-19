import './MoodStats.scss';

function MoodStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="mood-stats">
      <div className="mood-stat">
        <p className="mood-stat__label">Total posts</p>
        <p className="mood-stat__value">{stats.totalPosts}</p>
      </div>
      <div className="mood-stat">
        <p className="mood-stat__label">Average intensity</p>
        <p className="mood-stat__value">{stats.averageIntensity}</p>
      </div>
      <div className="mood-stat">
        <p className="mood-stat__label">Dominant mood</p>
        <p className="mood-stat__value">{stats.dominantMood}</p>
      </div>
    </div>
  );
}

export default MoodStats;
