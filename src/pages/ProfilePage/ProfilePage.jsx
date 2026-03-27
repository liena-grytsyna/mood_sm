import { useEffect, useState } from 'react';
import PostCard from '../../components/PostCard/PostCard';
import { api } from '../../lib/api';
import { getAuthorName, getActorId } from '../../lib/user';
import './ProfilePage.scss';

async function fetchProfileData(author) {
  const postsRes = await api.get('/posts', { params: { author } });

  return {
    posts: postsRes.data.posts || [],
  };
}

function ProfilePage() {
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
    } catch (err) {
      setError(err?.response?.data?.error || 'Reaction error');
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
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
  );
}

export default ProfilePage;