import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow delivery/register without delivery role
    if (pathname === "/delivery/register") {
      return NextResponse.next();
    }

    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/delivery") && token?.role !== "delivery") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow unauthenticated access to delivery/register
        if (pathname === "/delivery/register") {
          return true;
        }

        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/delivery") ||
          pathname.startsWith("/orders") ||
          pathname.startsWith("/checkout") ||
          pathname.startsWith("/profile")
        ) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/delivery/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/profile/:path*",
  ],
};
