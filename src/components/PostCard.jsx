function PostCard({ post, onReact }) {
  const likesCount = post.reactions?.['👍'] || 0;

  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
      <h3>{post.author}</h3>
      <p>{post.text}</p>
      <p>
        <small>Mood: {post.mood} | Intensity: {Math.round(post.intensity * 100)}%</small>
      </p>
      <div>
        <button onClick={() => onReact(post.id, '👍')} style={{ marginRight: '5px' }}>
          👍 {likesCount}
        </button>
      </div>
    </div>
  );
}

export default PostCard;
