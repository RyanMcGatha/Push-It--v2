import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const { name, theme, preferences } = data;

    // Update the user's name
    const user = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        name,
      },
    });

    // Update or create the user's profile
    const profile = await prisma.profile.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        displayName: name,
        profileComplete: true,
      },
      update: {
        displayName: name,
        profileComplete: true,
      },
    });

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Error updating onboarding data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
