import { useEffect, useState } from 'react';
import PostCard from '../../components/PostCard/PostCard';
import { api } from '../../lib/api';
import { getActorId } from '../../lib/user';
import './HomePage.scss';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await api.get('/posts');
        setPosts(res.data.posts || []);
      } catch {
        setError('Failed to load posts');
      }
    }

    loadPosts();
  }, []);

  async function reactToPost(postId, emoji) {
    try {
      const actorId = getActorId();

      const res = await api.post(`/posts/${postId}/reactions`, {
        emoji,
        actorId,
      });

      setPosts((posts) =>
        posts.map((p) => (p.id === postId ? res.data.post : p))
      );
    } catch (err) {
      setError(err?.response?.data?.error || 'Reaction error');
    }
  }

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
