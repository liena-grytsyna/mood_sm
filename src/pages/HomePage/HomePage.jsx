import { useEffect, useState } from 'react';
import PostCard from '../../components/PostCard/PostCard';
import { api } from '../../lib/api';
import { getActorId } from '../../lib/user';
import './HomePage.scss';

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

      const response = await api.post(`/posts/${postId}/reactions`, { emoji, actorId });
      // Optimized: Update local state instead of refetching all posts
      setPosts((currentPosts) => currentPosts.map(
        (post) => (post.id === postId ? response.data.post : post),
      ));
    } catch (err) {
      setError(err?.response?.data?.error || 'Reaction error');
    }
  };

  if (loading) return <p>Loading feed...</p>;

  return (
    <div className="home-page">
      <header className="home-page__hero hero-card">
        <span className="hero-card__kicker">Live Feed</span>
        <h1 className="hero-card__title">Community mood board</h1>
        <p className="hero-card__text">Follow the emotional weather of the room, discover how people are feeling, and react to the posts shaping today&apos;s vibe.</p>
      </header>

      {error && <p className="home-page__feedback status-banner status-banner--error">{error}</p>}

      <section className="home-page__panel panel-card">
        <h2 className="home-page__title">All posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="home-page__empty empty-panel">No posts yet</p>
        ) : (
          <div className="home-page__posts post-collection">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onReact={reactToPost} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
