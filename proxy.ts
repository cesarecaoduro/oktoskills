import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // With cross-domain Better Auth, session lives in localStorage (not cookies).
  // Route protection is handled client-side via the AuthGuard component.
  // Proxy only handles static rewrites if needed.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
