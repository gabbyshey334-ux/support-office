import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next internal & static asset paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(svg|png|jpg|jpeg|webp|ico|css|js|map|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // /setup is handled inside the page
  if (pathname.startsWith("/setup")) {
    return NextResponse.next();
  }

  const { response, user, profile } = await updateSession(request);

  const isLoggedIn = !!user;
  const isApproved = profile?.account_status === "approved";
  const isAdmin = profile?.role === "admin";

  // /pending is open to anyone
  if (pathname.startsWith("/pending")) {
    return response;
  }

  // /login and /register: redirect logged-in users to their dashboard
  if (pathname === "/login" || pathname === "/register") {
    if (isLoggedIn && profile) {
      if (profile.account_status === "pending") {
        return NextResponse.redirect(new URL("/pending", request.url));
      }
      if (profile.account_status === "approved") {
        return NextResponse.redirect(
          new URL(isAdmin ? "/admin" : "/dashboard", request.url)
        );
      }
    }
    return response;
  }

  // /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!profile) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (profile.account_status === "pending") {
      return NextResponse.redirect(new URL("/pending", request.url));
    }
    if (!isApproved) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  // /admin/*
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any file with an extension
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
