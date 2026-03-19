import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { getAuthorName } from '../../lib/user';
import './PostPage.scss';

function PostPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Post cannot be empty');
      return;
    }

    if (text.length > 280) {
      setError('Post is too long (max 280 characters)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const author = getAuthorName();

      await api.post('/posts', { author, text });

      setSuccess('Post published!');
      setText('');

      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-page">
      <header className="page-hero">
        <h1>Write into the feed</h1>
        <p>Share a short mood update with the community. Keep it honest, quick, and under 280 characters.</p>
      </header>

      <section className="post-composer">
        {error && <p className="post-error">{error}</p>}
        {success && <p className="post-success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>What is your vibe right now?</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your mood..."
              maxLength={280}
              rows={6}
            />
            <p className="character-count">
              {text.length}/280
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="form-button"
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default PostPage;
