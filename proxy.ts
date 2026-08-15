import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE, decodeAuthCookie, canAccessDashboard } from "@/lib/auth-cookie";
import { permissionsForPath } from "@/lib/sidebar-items";

// Gates /dashboard/* to logged-in owner/admin/staff accounts, and — beyond
// that — to the specific permission each route needs (looked up from the
// same `sidebar-items.ts` config the sidebar filters with, so the two can't
// drift). This runs at the edge against the signed cookie, so it can't be
// bypassed by typing a URL directly; the Laravel `permission:` middleware on
// every API call remains the ultimate source of truth regardless.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = decodeAuthCookie(request.cookies.get(AUTH_COOKIE)?.value);

  if (!canAccessDashboard(session?.user)) {
    // Logged in, just not staff — send them to their own account instead of
    // bouncing to a login form they don't need. Fully signed-out visitors
    // still go to /login, with a redirect back to the dashboard URL they
    // wanted (useful if they log in as a staff account instead).
    if (session?.user) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredPermissions = permissionsForPath(pathname);
  // Defensive against a stale cookie written before `permissions` existed
  // on the session — treated as "no permissions" (redirects below) rather
  // than crashing the whole proxy.
  const grantedPermissions = session!.user.permissions ?? [];
  const hasAccess =
    !requiredPermissions ||
    requiredPermissions.some((permission) => grantedPermissions.includes(permission));

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
