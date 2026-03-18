import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { getAuthorName } from '../lib/user';

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
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px' }}>
      <h1>Create a New Post</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label>What is your vibe right now?</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your mood..."
            maxLength={280}
            rows={6}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              fontFamily: 'Arial',
              fontSize: '14px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              resize: 'vertical',
            }}
          />
          <p style={{ color: '#666', fontSize: '12px' }}>
            {text.length}/280
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}

export default PostPage;
