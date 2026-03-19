import './PostCard.scss';

function PostCard({ post, onReact }) {
  const likesCount = post.reactions?.['👍'] || 0;

  return (
    <div className="post-card">
      <h3>{post.author}</h3>
      <p>{post.text}</p>
      <p>
        <small>Mood: {post.mood} | Intensity: {Math.round(post.intensity * 100)}%</small>
      </p>
      <div className="post-actions">
        <button className="reaction-button" onClick={() => onReact(post.id, '👍')}>
          👍 {likesCount}
        </button>
      </div>
    </div>
  );
}

export default PostCard;
