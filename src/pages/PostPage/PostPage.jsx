import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { getAuthorName } from '../../lib/user';
import './PostPage.scss';

function PostPage() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!text.trim()) {
      setError('Post cannot be empty');
      return;
    }

    if (text.length > 280) {
      setError('Max 280 characters');
      return;
    }

    try {
      setError('');

      await api.post('/posts', {
        author: getAuthorName(),
        text: text,
      });

      setText('');
      navigate('/profile');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to publish post');
    }
  }

  return (
    <div className="post-page">
      <header className="post-page__hero hero-card">
        <h1 className="hero-card__title">New Post</h1>
      </header>

      <section className="post-page__composer form-card form-card--wide">
        {error && <p className="form-card__status form-card__status--error">{error}</p>}

        <form className="form-card__form" onSubmit={handleSubmit}>
          <div className="form-card__field">
            <label className="form-card__label">Write your post</label>

            <textarea
              className="form-card__control form-card__control--textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={280}
              rows={6}
            />

            <p className="form-card__counter">{text.length}/280</p>
          </div>

          <button type="submit" className="form-card__submit">
            Publish
          </button>
        </form>
      </section>
    </div>
  );
}

export default PostPage;