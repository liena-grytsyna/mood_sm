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
      <header className="page-hero">
        <h1>Community mood board</h1>
      </header>

      {error && <p className="feed-error">{error}</p>}

      <section className="posts-section">
        <h2>All posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet</p>
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
