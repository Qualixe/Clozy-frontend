import type { Permission, Role } from "@/lib/permissions";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  roles: Role[];
  permissions: Permission[];
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export const AUTH_COOKIE = "clozy_auth";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function encodeAuthCookie(session: AuthSession): string {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeAuthCookie(raw: string | undefined | null): AuthSession | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as AuthSession;
  } catch {
    return null;
  }
}

/** Client-only: read the auth session from `document.cookie`. */
export function readAuthCookie(): AuthSession | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]*)`));
  return decodeAuthCookie(match?.[1]);
}

/** Client-only: persist the auth session so both the browser and the proxy (dashboard gate) can see it. */
export function writeAuthCookie(session: AuthSession) {
  document.cookie = `${AUTH_COOKIE}=${encodeAuthCookie(session)}; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

/** Client-only: clear the auth session cookie. */
export function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function canAccessDashboard(user: Pick<AuthUser, "role"> | null | undefined): boolean {
  return !!user && (user.role === "owner" || user.role === "admin" || user.role === "staff");
}
