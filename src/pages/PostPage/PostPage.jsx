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
      <header className="post-page__hero hero-card">
        <span className="hero-card__kicker">New Entry</span>
        <h1 className="hero-card__title">Write into the feed</h1>
        <p className="hero-card__text">Share a short mood update with the community. Keep it honest, quick, and under 280 characters.</p>
      </header>

      <section className="post-page__composer form-card form-card--wide">
        {error && <p className="form-card__status form-card__status--error">{error}</p>}
        {success && <p className="form-card__status form-card__status--success">{success}</p>}

        <form className="form-card__form" onSubmit={handleSubmit}>
          <div className="form-card__field">
            <label className="form-card__label">What is your vibe right now?</label>
            <textarea
              className="form-card__control form-card__control--textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your mood..."
              maxLength={280}
              rows={6}
            />
            <p className="form-card__counter">
              {text.length}/280
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="form-card__submit"
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default PostPage;
