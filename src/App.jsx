import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage/HomePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import PostPage from './pages/PostPage/PostPage';

import { clearUser, getCurrentUser } from './lib/user';

function getNavLinkClass({ isActive }) {
  if (isActive) {
    return 'site-nav__link site-nav__link--active';
  }

  return 'site-nav__link';
}

function App() {
  const [user, setUser] = useState(getCurrentUser());
  const authed = user && user.id;

  function handleAuth(nextUser) {
    setUser(nextUser);
  }

  function logout() {
    clearUser();
    setUser(null);
  }

  return (
    <Router>
      <nav className="site-nav">
        <NavLink to="/" className="site-nav__brand">
          Mood Space
        </NavLink>

        <div className="site-nav__links">
          <NavLink to="/" className={getNavLinkClass}>
            Home
          </NavLink>

          {authed ? (
            <>
              <NavLink to="/profile" className={getNavLinkClass}>
                Profile
              </NavLink>

              <NavLink to="/post" className={getNavLinkClass}>
                New Post
              </NavLink>

              <button type="button" className="site-nav__logout" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getNavLinkClass}>
                Login
              </NavLink>

              <NavLink to="/register" className={getNavLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/profile"
          element={authed ? <ProfilePage /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/post"
          element={authed ? <PostPage /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={!authed ? <LoginPage onAuth={handleAuth} /> : <Navigate to="/profile" replace />}
        />

        <Route
          path="/register"
          element={
            !authed ? <RegisterPage onAuth={handleAuth} /> : <Navigate to="/profile" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
