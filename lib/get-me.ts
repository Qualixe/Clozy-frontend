import type { AuthUser } from "@/lib/auth-cookie";

/** The authenticated user plus their current roles/permissions. */
export async function getMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
