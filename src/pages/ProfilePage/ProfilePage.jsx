import { useEffect, useState } from 'react';
import MoodStats from '../../components/MoodStats/MoodStats';
import PostCard from '../../components/PostCard/PostCard';
import { api } from '../../lib/api';
import { getAuthorName, getActorId } from '../../lib/user';
import './ProfilePage.scss';

async function fetchProfileData(author) {
  const postsRes = await api.get('/posts', { params: { author } });
  const statsRes = await api.get('/profile/stats', { params: { author } });

  return {
    posts: postsRes.data.posts || [],
    stats: statsRes.data.stats || null,
  };
}

function ProfilePage() {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const author = getAuthorName();
        const data = await fetchProfileData(author);

        setPosts(data.posts);
        setStats(data.stats);
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function reactToPost(postId, emoji) {
    try {
      setError('');

      const actorId = getActorId();
      await api.post(`/posts/${postId}/reactions`, { emoji, actorId });

      const author = getAuthorName();
      const data = await fetchProfileData(author);

      setPosts(data.posts);
      setStats(data.stats);
    } catch (err) {
      setError(err?.response?.data?.error || 'Reaction error');
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-page">
      <h1>My profile</h1>

      {error && <p>{error}</p>}

      <h2>Statistics</h2>
      {stats ? <MoodStats stats={stats} /> : <p>No data</p>}

      <h2>My posts ({posts.length})</h2>

      {posts.length === 0 ? (
        <p>No posts yet</p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onReact={reactToPost} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;