export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type StoredSession = {
  token: string;
  user: AuthUser;
};

const SESSION_STORAGE_KEY = "rizal-auth-session";
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";

function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token, user }));
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getSession(): StoredSession | null {
  return getStoredSession();
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getSession();
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { error?: string }).error || "Request failed");
  }

  return data as T;
}

export async function loginUser(payload: { email: string; password: string }) {
  const data = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveSession(data.token, data.user);
  return data;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const data = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveSession(data.token, data.user);
  return data;
}

export async function getCurrentUser() {
  const session = getSession();
  if (!session) {
    return null;
  }

  try {
    const user = await request<AuthUser>("/api/auth/me");
    return user;
  } catch {
    clearSession();
    return null;
  }
}
