const USER_KEY = 'user';
const GUEST_KEY = 'guest_id';

// create unique guest id
function createGuestId() {
  return 'guest_' + Date.now();
}

// create a new user object
function getGuestId() {
  // check if already exist
  let id = localStorage.getItem(GUEST_KEY);

  if (!id) {
    // create new guest id
    id = createGuestId();
    localStorage.setItem(GUEST_KEY, id);
  }

  return id;
}

// get user from local storage
export function getUser() {
  const data = localStorage.getItem(USER_KEY);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
// get current user or guest info
export function getCurrentUser() {
  const user = getUser();

  if (!user) {
    return {
      id: '',
      username: '',
      email: '',
    };
  }

  return user;
}
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
// logout user by removing from local storage
export function logout() {
  localStorage.removeItem(USER_KEY);
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}
// check if user is authenticated
export function isAuth() {
  const user = getUser();

  if (user && user.id) {
    return true;
  }

  return false;
}

export function getActorId() {
  const user = getUser();

  if (user && user.id) {
    return user.id;
  }

  return getGuestId();
}

export function getAuthorName() {
  const user = getUser();

  if (user && user.username) {
    return user.username;
  }

  return 'Anonymous';
}