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
    return required.some((p) => get().permissions.includes(p));
  },
  hasRole: (role) => {
    const required = Array.isArray(role) ? role : [role];
    return required.some((r) => get().roles.includes(r));
  },
  setFromUser: (user) => set({ user, roles: user.roles, permissions: user.permissions }),
  clear: () => set({ user: null, roles: [], permissions: [] }),
}));
