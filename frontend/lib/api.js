const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const STORAGE_KEY = 'dprd.session';

const isBrowser = () => typeof window !== 'undefined';

export { API_URL };

export const getSession = () => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (session) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
};

const refreshSession = async (session) => {
  if (!session?.refreshToken) return null;
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  if (!response.ok) {
    clearSession();
    return null;
  }
  const data = await response.json();
  const next = { ...session, token: data.token, refreshToken: data.refreshToken };
  setSession(next);
  return next;
};

export const apiFetch = async (path, options = {}) => {
  let session = getSession();
  const send = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers,
      },
    });

  let response = await send();
  if (response.status === 401 && session?.refreshToken) {
    session = await refreshSession(session);
    if (session) response = await send();
  }
  return response;
};

export const readError = async (response, fallback = 'Permintaan gagal') => {
  try {
    const body = await response.json();
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
};
