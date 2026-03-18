import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { api } from '../lib/api';
import { getActorId } from '../lib/user';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const postsRes = await api.get('/posts');
        setPosts(postsRes.data.posts || []);
      } catch {
        setError('Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const reactToPost = async (postId, emoji) => {
    try {
      setError('');
      const actorId = getActorId();

      await api.post(`/posts/${postId}/reactions`, { emoji, actorId });
      const response = await api.get('/posts');
      setPosts(response.data.posts || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Reaction error');
    }
  };

  if (loading) return <p>Loading feed...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Feed - All Posts</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section>
        <h2>All posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p>No posts yet</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onReact={reactToPost} />
          ))
        )}
      </section>
    </div>
  );
}

export default HomePage;
