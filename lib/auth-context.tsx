"use client";

import * as React from "react";

import {
  clearAuthCookie,
  readAuthCookie,
  writeAuthCookie,
  type AuthUser,
} from "@/lib/auth-cookie";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  /** True once the cookie has been read on the client (avoids a logged-out flash). */
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function parseJsonError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data?.errors) {
      const first = Object.values(data.errors as Record<string, string[]>)[0];
      if (first?.[0]) return first[0];
    }
    return data?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const session = readAuthCookie();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setReady(true);
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await parseJsonError(res, "Login failed."));
    const data = await res.json();
    writeAuthCookie({ token: data.token, user: data.user });
    setUser(data.user);
    setToken(data.token);
  }, []);

  const register = React.useCallback(
    async (
      name: string,
      email: string,
      password: string,
      passwordConfirmation: string
    ) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      if (!res.ok) throw new Error(await parseJsonError(res, "Registration failed."));
      const data = await res.json();
      writeAuthCookie({ token: data.token, user: data.user });
      setUser(data.user);
      setToken(data.token);
    },
    []
  );

  const logout = React.useCallback(async () => {
    const currentToken = token;
    clearAuthCookie();
    setUser(null);
    setToken(null);
    if (currentToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}`, Accept: "application/json" },
        });
      } catch {
        // Token is already cleared client-side; a failed revoke call isn't fatal.
      }
    }
  }, [token]);

  const value = React.useMemo(
    () => ({ user, token, ready, login, register, logout }),
    [user, token, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider />");
  }
  return context;
}
