import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Maintenance mode — checked before anything else ───
  if (process.env.MAINTENANCE_MODE === "true") {
    const allowedPaths = ["/maintenance"];
    const bypassKey = request.nextUrl.searchParams.get("bypass");
    const hasBypassCookie = request.cookies.get("maintenance_bypass")?.value === process.env.MAINTENANCE_BYPASS_KEY;

    if (!allowedPaths.includes(pathname) && !hasBypassCookie) {
      if (bypassKey && bypassKey === process.env.MAINTENANCE_BYPASS_KEY) {
        const res = NextResponse.next();
        res.cookies.set("maintenance_bypass", bypassKey, {
          httpOnly: true,
          maxAge: 60 * 60 * 24,
        });
        return res;
      }
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLoggedIn = !!session?.user;

  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/verify-email",
    "/login-admin",
    "/admin/register",
    "/forgot-password",
  ];
  const isPublic = publicPaths.includes(pathname);

  if (isLoggedIn && session.user.role === "admin") {
    if (isPublic && pathname !== "/") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (!isLoggedIn && !isPublic && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ─── Payment gate — runs before onboarding, since payment comes first ───
  if (
    isLoggedIn &&
    !(session.user as any).hasPaid &&
    pathname !== "/complete-payments" &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/verify-email")
  ) {
    return NextResponse.redirect(
      new URL(
        `/complete-payments?email=${encodeURIComponent(session.user.email)}&name=${encodeURIComponent(session.user.name)}`,
        request.url,
      ),
    );
  }

  if (
    isLoggedIn &&
    (session.user as any).hasPaid &&
    !session.user?.onboardingComplete &&
    pathname !== "/role-onboarding" &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/verify-email")
  ) {
    return NextResponse.redirect(new URL("/role-onboarding", request.url));
  }

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