import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostPage from './pages/PostPage';
import { clearUser, getCurrentUser, subscribeToUserChanges } from './lib/user';
import './styles/navigation.scss';

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
      <nav>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link-active' : undefined)}>
            Home
          </NavLink>
          {authed ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link-active' : undefined)}>
                Profile
              </NavLink>
              <NavLink to="/post" className={({ isActive }) => (isActive ? 'nav-link-active' : undefined)}>
                New Post
              </NavLink>
              <button type="button" className="nav-logout" onClick={clearUser}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link-active' : undefined)}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'nav-link-active' : undefined)}>
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
