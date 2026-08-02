import { cookies } from "next/headers";

import { AUTH_COOKIE, decodeAuthCookie, type AuthSession } from "@/lib/auth-cookie";

/** Server-only: read the auth session from the request cookies (Server Components/Route Handlers). */
export async function getServerAuth(): Promise<AuthSession | null> {
  const store = await cookies();
  return decodeAuthCookie(store.get(AUTH_COOKIE)?.value);
}

/** Server-only: convenience helper for attaching a Bearer token to a fetch. */
export async function getServerAuthHeaders(): Promise<Record<string, string>> {
  const session = await getServerAuth();
  return session ? { Authorization: `Bearer ${session.token}` } : {};
}
