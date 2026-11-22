const TOKEN_KEY = "code_review_access_token";
const REFRESH_TOKEN_KEY = "code_review_refresh_token";
const USER_KEY = "code_review_user";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function saveAuthSession({ accessToken, refreshToken, user }) {
  if (accessToken) saveAccessToken(accessToken);
  if (refreshToken) saveRefreshToken(refreshToken);
  if (user) saveStoredUser(user);
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Backward-compatible alias
export const clearAccessToken = clearAuthSession;