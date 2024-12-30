import { NextResponse } from "next/server";
import { signIn } from "next-auth/react";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const result = await signIn("credentials", {
      email,
      password,
      action: "register",
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (result?.error) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { message: "User registered successfully", url: "/dashboard" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred during sign up" },
      { status: 500 }
    );
  }
}
