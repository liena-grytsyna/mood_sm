import { useEffect, useState } from 'react';
import MoodStats from '../components/MoodStats';
import PostCard from '../components/PostCard';
import { api } from '../lib/api';
import { getActorId, getAuthorName } from '../lib/user';

function ProfilePage() {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const currentUsername = getAuthorName();

        const [postsRes, statsRes] = await Promise.all([
          api.get('/posts', { params: { author: currentUsername } }),
          api.get('/profile/stats'),
        ]);

        setPosts(postsRes.data.posts || []);
        setStats(statsRes.data.stats);
      } catch {
        setError('Failed to load profile');
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
      const currentUsername = getAuthorName();

      await api.post(`/posts/${postId}/reactions`, { emoji, actorId });
      const response = await api.get('/posts', { params: { author: currentUsername } });
      setPosts(response.data.posts || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Reaction error');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Profile</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section style={{ marginBottom: '30px' }}>
        <h2>Statistics</h2>
        {stats ? <MoodStats stats={stats} /> : <p>No data</p>}
      </section>

      <section>
        <h2>My posts ({posts.length})</h2>
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

export default ProfilePage;
