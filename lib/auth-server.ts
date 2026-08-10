import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

/**
 * Call after an authenticated server-side fetch fails. A 401 means the
 * cookie's token is stale/invalid (e.g. the backend's token table got wiped
 * by a fresh migration) — send the user back to sign in rather than crashing
 * the page with an uncaught error. Anything else still throws.
 */
export function assertDashboardFetchOk(res: Response): void {
  if (res.ok) return;
  if (res.status === 401) {
    redirect("/login");
  }
  throw new Error(`Request failed with status ${res.status}`);
}
