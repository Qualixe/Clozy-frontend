import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE, decodeAuthCookie, canAccessDashboard } from "@/lib/auth-cookie";

// Gates /dashboard/* to logged-in admin/editor accounts. This is a UX-level
// gate (avoids flashing dashboard chrome at guests) — the real security
// boundary is the Laravel `role:admin,editor` middleware on every API call.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard/login") {
    return NextResponse.next();
  }

  const session = decodeAuthCookie(request.cookies.get(AUTH_COOKIE)?.value);

  if (!canAccessDashboard(session?.user)) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
