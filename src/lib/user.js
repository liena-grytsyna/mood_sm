function buildUsernameFromEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const [raw] = email.split('@');
  return raw?.trim() || '';
}

const USER_STORAGE_KEY = 'user';
const USER_CHANGE_EVENT = 'mood-space-user-change';
const GUEST_ACTOR_KEY = 'guest_actor_id';

function createGuestActorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `guest_${crypto.randomUUID()}`;
  }

  return `guest_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function getGuestActorId() {
  try {
    const storedGuestId = localStorage.getItem(GUEST_ACTOR_KEY);
    if (storedGuestId) return storedGuestId;

    const guestId = createGuestActorId();
    localStorage.setItem(GUEST_ACTOR_KEY, guestId);
    return guestId;
  } catch {
    return createGuestActorId();
  }
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getCurrentUser() {
  const user = getStoredUser();
  return {
    id: user.id || '',
    email: user.email || '',
    username: user.username || buildUsernameFromEmail(user.email) || '',
    createdAt: user.createdAt || user.created_at || '',
  };
}

export function isAuthenticated() {
  const user = getCurrentUser();
  return Boolean(user.id && user.email && user.username);
}

export function getActorId() {
  const user = getCurrentUser();
  if (isAuthenticated()) {
    return user.id || user.email || user.username;
  }

  return getGuestActorId();
}

export function getAuthorName() {
  if (!isAuthenticated()) return 'Anonymous';
  return getCurrentUser().username || 'Anonymous';
}

export function saveUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(USER_CHANGE_EVENT));
}

export function clearUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new Event(USER_CHANGE_EVENT));
}

export function subscribeToUserChanges(callback) {
  const handleChange = () => callback();

  window.addEventListener(USER_CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleChange);

  return () => {
    window.removeEventListener(USER_CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
}
