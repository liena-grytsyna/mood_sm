import './PostCard.scss';

function PostCard({ post, onReact }) {
  const likesCount = post.reactions?.['👍'] || 0;

  return (
    <article className="post-card"  data-mood={post.mood || 'neutral'}>
      <div className="post-card__header">
        <h3>{post.author}</h3>
        <span className="post-card__meta">{likesCount} likes</span>
      </div>
      <p className="post-card__text">{post.text}</p>
      <div className="post-card__details">
        <span className="post-pill">Mood: {post.mood}</span>
        <span className="post-pill">Intensity: {Math.round(post.intensity * 100)}%</span>
      </div>
      <div className="post-actions">
        <button type="button" className="reaction-button" onClick={() => onReact(post.id, '👍')}>
          👍 {likesCount}
        </button>
      </div>
    </article>
  );
}

export default PostCard;
