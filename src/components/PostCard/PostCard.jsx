import './PostCard.scss';

function PostCard({ post, onReact }) {
  const likes = post.reactions?.['👍'] || 0;

  return (
    <article className="post-card" data-mood={post.mood || 'neutral'}>
      <header className="post-card__header">
        <h3 className="post-card__title">{post.author}</h3>
        <span className="post-card__badge">{likes} likes</span>
      </header>
      <p className="post-card__text">{post.text}</p>
      <div className="post-card__details">
        <span className="post-card__pill post-card__pill--mood">Mood: {post.mood}</span>
      </div>
      <div className="post-card__actions">
        <button type="button" className="post-card__button" onClick={() => onReact(post.id, '👍')}>
          👍 {likes}
        </button>
      </div>
    </article>
  );
}

export default PostCard;
