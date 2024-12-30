import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  const cookie: ResponseCookie = {
    name: "auth-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  };
  cookieStore.set(cookie);
};

export const getAuthCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token");
};

export const removeAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
};
