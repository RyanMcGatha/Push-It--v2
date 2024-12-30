"use server";

import { removeAuthCookie } from "@/lib/cookies";

type LogoutResult = {
  success: boolean;
  message: string;
};

const handleLogout = async (): Promise<LogoutResult> => {
  try {
    await removeAuthCookie();
    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during logout",
    };
  }
};

export default handleLogout;
