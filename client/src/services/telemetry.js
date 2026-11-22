const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export function trackEvent(event, meta = {}) {
  try {
    fetch(`${API_BASE_URL}/telemetry/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, page: window.location.pathname, meta }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore telemetry failure */ }
}

export function trackError(error, extra = {}) {
  try {
    fetch(`${API_BASE_URL}/telemetry/error`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error?.message || String(error),
        stack: error?.stack || null,
        page: window.location.pathname,
        ...extra,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore telemetry failure */ }
}
