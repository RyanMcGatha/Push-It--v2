import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateSession } from "@/lib/session";

// Define paths that require authentication
const protectedPaths = ["/dashboard"];
// Define authentication paths
const authPaths = ["/login", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Check if user is authenticated
  const isAuthenticated = await validateSession();

  // If the path is protected and user is not authenticated, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    return response;
  }

  // If trying to access auth paths while authenticated, redirect to dashboard
  if (isAuthPath && isAuthenticated) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    return response;
  }

  return NextResponse.next();
}

// Configure paths that trigger middleware
export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
