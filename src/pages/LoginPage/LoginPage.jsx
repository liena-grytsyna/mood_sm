import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { saveUser } from '../../lib/user';
import './LoginPage.scss';

function LoginPage({ onAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');

      const res = await api.post('/login', { username, password });
      const nextUser = res.data.user;
      saveUser(nextUser);
      onAuth?.(nextUser);
      navigate('/profile');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="login-page">
      <section className="login-page__card form-card">
        <h1 className="form-card__title">Login</h1>

        {error && <p className="form-card__status form-card__status--error">{error}</p>}

        <form className="form-card__form" onSubmit={handleLogin}>
          <div className="form-card__field">
            <label className="form-card__label">Username</label>
            <input
              className="form-card__control"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-card__field">
            <label className="form-card__label">Password</label>
            <input
              className="form-card__control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="form-card__submit">
            Sign in
          </button>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
