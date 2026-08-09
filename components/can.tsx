"use client";

import type { ReactNode } from "react";

import { useAuthStore } from "@/lib/auth-store";
import type { Permission, Role } from "@/lib/permissions";

/**
 * Gates rendering of its children behind a permission and/or role check —
 * for buttons/sections that a page's own route permission doesn't already
 * cover (e.g. a "view"-permission page that also has a "manage"-only
 * action button). Either prop accepts a single value or an array (OR
 * semantics — any match is enough).
 */
export function Can({
  permission,
  role,
  fallback = null,
  children,
}: {
  permission?: Permission | Permission[];
  role?: Role | Role[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const hasRole = useAuthStore((s) => s.hasRole);

  const permissionOk = !permission || hasPermission(permission);
  const roleOk = !role || hasRole(role);

  return permissionOk && roleOk ? <>{children}</> : <>{fallback}</>;
}

export default Can;
