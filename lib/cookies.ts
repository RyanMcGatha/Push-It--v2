import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const AUTH_COOKIE_NAME = "auth-token";

/**
 * Sets a secure, HTTP-only auth cookie with a 7-day expiration.
 *
 * @param token The token to be stored in the cookie.
 */
export async function setAuthCookie(token: string) {
  // In some Next.js versions, cookies() returns a Promise, so we need `await`.
  const cookieStore = await cookies();

  const cookie: ResponseCookie = {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  };

  cookieStore.set(cookie);
}

/**
 * Retrieves the current auth cookie if it exists.
 *
 * @returns The auth cookie, or undefined if not found.
 */
export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME);
}

/**
 * Removes the auth cookie from the browser.
 */
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
