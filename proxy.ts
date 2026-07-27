import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { pathname } = request.nextUrl;
  const isLoggedIn = !!session?.user;

  // Public paths that don't need auth
  const publicPaths = ["/", "/login", "/register", "/verify-email", "/login-admin", "/admin/register", "/forgot-password"];
  const isPublic = publicPaths.includes(pathname);

  if (isLoggedIn && session.user.role === "admin") {
  // Admin on public pages → admin dashboard
  if (isPublic && pathname !== "/") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  // Admin already on admin pages → allow
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  // Admin anywhere else → admin dashboard
  return NextResponse.redirect(new URL("/admin/dashboard", request.url));
}

  // Not logged in + protected route → login
  if (!isLoggedIn && !isPublic && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in but not onboarded + not on onboarding → onboarding
  if (
    isLoggedIn &&
    !session.user?.onboardingComplete &&
    pathname !== "/role-onboarding" &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/verify-email")
  ) {
    return NextResponse.redirect(new URL("/role-onboarding", request.url));
  }

  // Already onboarded + on onboarding → dashboard
  if (
    isLoggedIn &&
    session.user?.onboardingComplete &&
    pathname === "/role-onboarding"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)",
  ],
};