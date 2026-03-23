import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import PostPage from './pages/PostPage/PostPage';
import { clearUser, getCurrentUser, subscribeToUserChanges } from './lib/user';

function ProtectedRoute({ children, authed }) {
  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function GuestRoute({ children, authed }) {
  if (authed) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  useEffect(() => subscribeToUserChanges(() => setCurrentUser(getCurrentUser())), []);

  const authed = Boolean(currentUser.id && currentUser.email && currentUser.username);

  return (
    <Router>
      <nav className="site-nav">
        <NavLink to="/" className="site-nav__brand">
          Mood Space
        </NavLink>
        <div className="site-nav__links">
          <NavLink
            to="/"
            className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
          >
            Home
          </NavLink>
          {authed ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
              >
                Profile
              </NavLink>
              <NavLink
                to="/post"
                className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
              >
                New Post
              </NavLink>
              <button type="button" className="site-nav__logout" onClick={clearUser}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
              >
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
          element={(
            <ProtectedRoute authed={authed}>
              <ProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/login"
          element={(
            <GuestRoute authed={authed}>
              <LoginPage />
            </GuestRoute>
          )}
        />
        <Route
          path="/register"
          element={(
            <GuestRoute authed={authed}>
              <RegisterPage />
            </GuestRoute>
          )}
        />
        <Route
          path="/post"
          element={(
            <ProtectedRoute authed={authed}>
              <PostPage />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
