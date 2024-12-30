import { getAuthCookie } from "./cookies";
import CryptoJS from "crypto-js";

interface SessionData {
  userId: number;
  email: string;
  timestamp: number;
}

export const getSession = async (): Promise<SessionData | null> => {
  try {
    const cookie = await getAuthCookie();
    if (!cookie) return null;

    const bytes = CryptoJS.AES.decrypt(
      cookie.value,
      process.env.SESSION_SECRET || "default-secret"
    );

    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    // Validate session data structure
    if (
      !decryptedData.userId ||
      !decryptedData.email ||
      !decryptedData.timestamp
    ) {
      return null;
    }

    // Check if session is expired (e.g., older than 7 days)
    const sessionAge = Date.now() - decryptedData.timestamp;
    if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
      return null;
    }

    return decryptedData as SessionData;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
};

export const validateSession = async (): Promise<boolean> => {
  const session = await getSession();
  return session !== null;
};
