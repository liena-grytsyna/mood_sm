import { useEffect, useState } from 'react';
import MoodStats from '../../components/MoodStats/MoodStats';
import PostCard from '../../components/PostCard/PostCard';
import { api } from '../../lib/api';
import { getActorId, getAuthorName } from '../../lib/user';
import './ProfilePage.scss';

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
          api.get('/profile/stats', { params: { author: currentUsername } }),
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
    <div className="profile-page">
      <header className="profile-page__hero hero-card">
        <span className="hero-card__kicker">Personal Pulse</span>
        <h1 className="hero-card__title">My profile</h1>
        <p className="hero-card__text">Track your posting habits, see your dominant mood, and revisit the updates you have shared with everyone else.</p>
      </header>

      {error && <p className="profile-page__feedback status-banner status-banner--error">{error}</p>}

      <section className="profile-page__section panel-card">
        <h2 className="profile-page__title">Statistics</h2>
        {stats ? <MoodStats stats={stats} /> : <p>No data</p>}
      </section>

      <section className="profile-page__section panel-card">
        <h2 className="profile-page__title">My posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="profile-page__empty empty-panel">No posts yet</p>
        ) : (
          <div className="profile-page__posts post-collection">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onReact={reactToPost} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProfilePage;
