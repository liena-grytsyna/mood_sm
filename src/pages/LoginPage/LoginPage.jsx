import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { saveUser } from '../../lib/user';
import './LoginPage.scss';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/login', { email, password });
      saveUser(response.data.user);
      navigate('/profile');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-page__card form-card">
        <span className="form-card__kicker">Welcome Back</span>
        <h1 className="form-card__title">Login</h1>
        <p className="form-card__text">Step back into your space, publish fresh updates, and keep an eye on how your mood shifts over time.</p>

        {error && <p className="form-card__status form-card__status--error">{error}</p>}

        <form className="form-card__form" onSubmit={handleLogin}>
          <div className="form-card__field">
            <label className="form-card__label">Email</label>
            <input
              className="form-card__control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <button type="submit" className="form-card__submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
