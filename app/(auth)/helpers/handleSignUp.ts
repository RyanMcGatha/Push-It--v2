"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type SignUpResult = {
  success: boolean;
  message: string;
  userId?: number;
};

const handleSignUp = async (
  email: string,
  password: string
): Promise<SignUpResult> => {
  try {
    const validationResult = signUpSchema.safeParse({ email, password });
    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.errors[0].message,
      };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with email and hashed password
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "User created successfully",
      userId: user.id,
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during sign up",
    };
  }
};

export default handleSignUp;
