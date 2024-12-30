import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/auth.config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          select: {
            onboardingComplete: true,
            onboardingStep: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.profile) {
      // Create a profile if it doesn't exist
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          onboardingComplete: false,
          onboardingStep: "welcome",
        },
      });
      return NextResponse.json({
        onboardingComplete: profile.onboardingComplete,
        onboardingStep: profile.onboardingStep,
      });
    }

    return NextResponse.json({
      onboardingComplete: user.profile.onboardingComplete,
      onboardingStep: user.profile.onboardingStep,
    });
  } catch (error) {
    console.error("Error in onboarding progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { step } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        onboardingStep: step,
        onboardingComplete: false,
      },
      update: {
        onboardingStep: step,
      },
    });

    return NextResponse.json({
      onboardingComplete: profile.onboardingComplete,
      onboardingStep: profile.onboardingStep,
    });
  } catch (error) {
    console.error("Error updating onboarding progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
