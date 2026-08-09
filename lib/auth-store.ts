import { create } from "zustand";

import type { AuthUser } from "@/lib/auth-cookie";
import type { Permission, Role } from "@/lib/permissions";

type AuthStoreState = {
  user: AuthUser | null;
  roles: Role[];
  permissions: Permission[];
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasRole: (role: Role | Role[]) => boolean;
  setFromUser: (user: AuthUser) => void;
  clear: () => void;
};

/**
 * Holds the richer roles/permissions view of the signed-in user, populated
 * from `GET /me` after login and on session restore. `AuthContext` remains
 * the source of truth for `token`/login/logout — this store layers on top
 * for permission-based UI gating (`<Can>`, the sidebar filter).
 */
export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  roles: [],
  permissions: [],
  hasPermission: (permission) => {
    const required = Array.isArray(permission) ? permission : [permission];
    if (required.length === 0) return true;
    const granted = get().permissions ?? [];
    return required.some((p) => granted.includes(p));
  },
  hasRole: (role) => {
    const required = Array.isArray(role) ? role : [role];
    const granted = get().roles ?? [];
    return required.some((r) => granted.includes(r));
  },
  // Defensive against a stale cookie written before `roles`/`permissions`
  // existed on the session, or any other malformed session data — falls
  // back to "no access" rather than crashing until the mount-time `/me`
  // refresh (see AuthContext) replaces it with fresh data.
  setFromUser: (user) =>
    set({ user, roles: user.roles ?? [], permissions: user.permissions ?? [] }),
  clear: () => set({ user: null, roles: [], permissions: [] }),
}));
