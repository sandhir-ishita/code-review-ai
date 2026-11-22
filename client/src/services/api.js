import {
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
  clearAuthSession,
} from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const payload = await res.json().catch(() => null);
        const tokens = payload?.data || payload;
        if (tokens?.accessToken) {
          saveAuthSession({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken || refreshToken,
          });
          return tokens.accessToken;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function formatApiError(data, status) {
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.message).join(" • ");
  }
  if (data?.message) return data.message;
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "Server error. Please try again shortly.";
  return `Request failed (${status})`;
}

export async function apiRequest(endpoint, options = {}, retry = true) {
  const token = getAccessToken();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your internet connection.");
  }

  const data = await response.json().catch(() => null);

  if (response.status === 401 && token && retry && endpoint !== "/auth/refresh") {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return apiRequest(endpoint, options, false);
    }

    clearAuthSession();
    window.location.href = "/login";
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(formatApiError(data, response.status));
  }

  return data;
}

export async function logoutApi() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // Ignore network errors on logout
  } finally {
    clearAuthSession();
  }
}
