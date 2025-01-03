import { getAuthCookie } from "./cookies";
import CryptoJS from "crypto-js";

export interface SessionData {
  userId: number;
  email: string;
  timestamp: number;
}

function isSessionData(value: unknown): value is SessionData {
  if (typeof value !== "object" || value === null) return false;

  const data = value as SessionData;
  return (
    typeof data.userId === "number" &&
    typeof data.email === "string" &&
    typeof data.timestamp === "number"
  );
}

const SESSION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Decrypts and returns the session data from the auth cookie, or null if invalid/expired.
 */
export const getSession = async (): Promise<SessionData | null> => {
  try {
    const cookie = await getAuthCookie();
    if (!cookie) {
      // No cookie found, session not available
      return null;
    }

    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      console.error(
        "No SESSION_SECRET found in environment variables. Cannot decrypt cookie."
      );
      return null;
    }

    // Decrypt the cookie value
    const bytes = CryptoJS.AES.decrypt(cookie.value, sessionSecret);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      // Decryption returned an empty string, likely invalid or tampered data
      console.error(
        "Failed to decrypt the session cookie or cookie is invalid."
      );
      return null;
    }

    // Safely parse the decrypted JSON
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(decryptedString);
    } catch (parseError) {
      console.error("Invalid JSON in session cookie:", parseError);
      return null;
    }

    if (!isSessionData(parsedData)) {
      console.error(
        "Decrypted cookie does not match expected SessionData format."
      );
      return null;
    }

    // Check if the session is expired
    const sessionAge = Date.now() - parsedData.timestamp;
    if (sessionAge > SESSION_EXPIRATION_MS) {
      console.error("Session has expired.");
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
};

/**
 * returns true if there's a valid session, otherwise false.
 */
export const validateSession = async (): Promise<boolean> => {
  const session = await getSession();
  return session !== null;
};
