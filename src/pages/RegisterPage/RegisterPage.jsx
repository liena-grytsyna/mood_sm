import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { saveUser } from '../../lib/user';
import './RegisterPage.scss';

function RegisterPage({ onAuth }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      setError('Fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');

      const res = await api.post('/register', {
        username: username,
        email: email,
        password: password,
      });

      const nextUser = res.data.user;
      saveUser(nextUser);
      onAuth?.(nextUser);
      navigate('/profile');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <div className="register-page">
      <section className="register-page__card form-card">
        <h1 className="form-card__title">Create account</h1>

        {error && <p className="form-card__status form-card__status--error">{error}</p>}

        <form className="form-card__form" onSubmit={handleRegister}>
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

          <div className="form-card__field">
            <label className="form-card__label">Confirm Password</label>
            <input
              className="form-card__control"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="form-card__submit">
            Create Account
          </button>
        </form>
      </section>
    </div>
  );
}

export default RegisterPage;
