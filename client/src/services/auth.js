const TOKEN_KEY = "code_review_access_token";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}
