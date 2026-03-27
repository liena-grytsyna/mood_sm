import './MoodStats.scss';

//shows total posts and dominant mood in profile page
function MoodStats({ stats }) {
  if (!stats) {
    return null;
  }
  const mood =
    stats.dominantMood
      ? stats.dominantMood[0].toUpperCase() + stats.dominantMood.slice(1)
      : 'Neutral';

  return (
    <div className="mood-stats">
      <div className="mood-stats__item mood-stats__item--total">
        <p className="mood-stats__label">Total posts</p>
        <p className="mood-stats__value">{stats.totalPosts}</p>
      </div>
      <div className="mood-stats__item mood-stats__item--dominant">
        <p className="mood-stats__label">Dominant mood</p>
        <p className="mood-stats__value">{mood}</p>
      </div>
    </div>
  );
}

export default MoodStats;
