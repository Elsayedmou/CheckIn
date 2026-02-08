import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySession } from "./lib/auth";

const PUBLIC = ["/login", "/api/auth/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/public") || pathname.startsWith("/favicon")) return NextResponse.next();
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    // APIs are protected (except auth)
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const session = verifySession(token);
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  // Admin-only pages
  if (pathname.startsWith("/users") || pathname.startsWith("/api/admin")) {
    if (session.user.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
