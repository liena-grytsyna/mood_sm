function buildUsernameFromEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const [raw] = email.split('@');
  return raw?.trim() || '';
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

export function getCurrentUser() {
  const user = getStoredUser();
  return {
    email: user.email || '',
    username: user.username || buildUsernameFromEmail(user.email) || 'Anonymous',
  };
}

export function getActorId() {
  const user = getCurrentUser();
  return user.email || user.username || 'anonymous';
}

export function getAuthorName() {
  return getCurrentUser().username;
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}
