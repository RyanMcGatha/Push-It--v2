"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import CryptoJS from "crypto-js";
import { setAuthCookie } from "@/lib/cookies";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginResult = {
  success: boolean;
  message: string;
  userId?: number;
};

const handleLogin = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  try {
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.errors[0].message,
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Create a session token
    const sessionData = {
      userId: user.id,
      email: user.email,
      timestamp: Date.now(),
    };

    // Encrypt the session data
    const encryptedToken = CryptoJS.AES.encrypt(
      JSON.stringify(sessionData),
      process.env.SESSION_SECRET || "default-secret"
    ).toString();

    // Set the session cookie using utility
    await setAuthCookie(encryptedToken);

    return {
      success: true,
      message: "Login successful",
      userId: user.id,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during login",
    };
  }
};

export default handleLogin;
