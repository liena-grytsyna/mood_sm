import './PostCard.scss';

function PostCard({ post, onReact }) {
  const likesCount = post.reactions?.['👍'] || 0;

  return (
    <article className="post-card" data-mood={post.mood || 'neutral'}>
      <header className="post-card__header">
        <h3 className="post-card__title">{post.author}</h3>
        <span className="post-card__badge">{likesCount} likes</span>
      </header>
      <p className="post-card__text">{post.text}</p>
      <div className="post-card__details">
        <span className="post-card__pill post-card__pill--mood">Mood: {post.mood}</span>
        <span className="post-card__pill post-card__pill--intensity">Intensity: {Math.round(post.intensity * 100)}%</span>
      </div>
      <div className="post-card__actions">
        <button type="button" className="post-card__button" onClick={() => onReact(post.id, '👍')}>
          👍 {likesCount}
        </button>
      </div>
    </article>
  );
}

export default PostCard;
