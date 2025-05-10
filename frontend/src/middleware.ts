// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;
  exp: number;
}

interface UserData {
  id: string;
  email: string;
  is_admin: boolean;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Allow public access to landing page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // No token, redirect to login
  if (!token) {
    if (pathname === "/login") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Decode token
    const decoded = jwtDecode<DecodedToken>(token);

    // Parse sub
    let userData: UserData;
    try {
      userData = JSON.parse(decoded.sub);
    } catch (e) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const isAdmin = userData.is_admin;

    // Redirect logged-in user from login page
    if (pathname === "/login") {
      const redirectUrl = isAdmin ? "/admin/dashboard" : "/user/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Restrict access based on role
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }

    if (pathname.startsWith("/user") && isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/user/:path*"],
};
