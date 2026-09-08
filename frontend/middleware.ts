import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/messages"];
const AUTH_ROUTES = ["/sign-in", "/get-started"];

function needsAuthCheck(pathname: string) {
  return (
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    AUTH_ROUTES.some((r) => pathname.startsWith(r))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always let NextAuth and static assets through
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Skip the expensive auth() call for routes that don't need it
  if (!needsAuthCheck(pathname)) return NextResponse.next();

  const session = await auth();

  // Signed-in users visiting sign-in → send to their dashboard
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && session?.user) {
    const role = (session.user as { role?: string }).role ?? "TENANT";
    const dest =
      role === "ADMIN"                              ? "/dashboard/admin" :
      role === "OWNER"                              ? "/dashboard/owner" :
      role === "AGENT" || role === "commissioner"   ? "/dashboard/commissioner" :
                                                      "/dashboard/tenant";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Unauthenticated users visiting protected routes → send to sign-in
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !session?.user) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
