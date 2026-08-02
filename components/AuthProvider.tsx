"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { login as apiLogin, register as apiRegister, getMe, sendHeartbeat } from "@/lib/api";
import type { AuthUser } from "@/types";

const TOKEN_KEY = "rizal_heritage_token";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string, rememberMe: boolean) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((token: string, nextUser: AuthUser, rememberMe = true) => {
    storeToken(token, rememberMe);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      const { token, user: nextUser } = await apiLogin(email, password);
      persistSession(token, nextUser, rememberMe);
    },
    [persistSession],
  );

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone?: string }) => {
      const { token, user: nextUser } = await apiRegister(data);
      persistSession(token, nextUser, true);
    },
    [persistSession],
  );

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    getMe(token)
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  // Lets the admin "User Online Sekarang" count reflect reality — pings
  // every minute while someone is logged in and has the site open.
  useEffect(() => {
    if (!user) return;
    const token = readToken();
    if (!token) return;

    sendHeartbeat(token);
    const interval = setInterval(() => sendHeartbeat(token), 60_000);
    return () => clearInterval(interval);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}