import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

// Helper function to generate a default custom URL
async function generateDefaultCustomUrl(
  baseUrl: string,
  userId: string
): Promise<string> {
  // Generate a short unique identifier (6 characters)
  const uniqueId = nanoid(6);

  // Clean up the base URL
  const cleanBaseUrl = baseUrl
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Combine base URL with unique identifier
  let customUrl = `${cleanBaseUrl}-${uniqueId}`;

  // In the rare case of a collision, add a timestamp
  const existing = await prisma.profile.findFirst({
    where: {
      customUrl,
      userId: { not: userId },
    },
  });

  if (existing) {
    const timestamp = Date.now().toString(36).slice(-4);
    customUrl = `${cleanBaseUrl}-${uniqueId}-${timestamp}`;
  }

  return customUrl;
}

// Helper function to format custom URL
function formatCustomUrl(url: string): string {
  return url
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const {
      displayName,
      bio,
      location,
      website,
      twitterHandle,
      githubHandle,
      company,
      jobTitle,
      phoneNumber,
      customUrl,
      themeColor,
      bannerImage,
      layout,
      skills,
      achievements,
      theme,
    } = data;

    // Update the user's profile
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Handle custom URL
    let formattedCustomUrl: string;
    if (customUrl) {
      // Format provided custom URL and add unique identifier
      const formatted = formatCustomUrl(customUrl);
      const uniqueId = nanoid(6);
      formattedCustomUrl = `${formatted}-${uniqueId}`;

      // Check if it's already taken
      const existingProfile = await prisma.profile.findFirst({
        where: {
          customUrl: formattedCustomUrl,
          userId: { not: user.id },
        },
      });

      if (existingProfile) {
        return new NextResponse(
          JSON.stringify({ error: "This custom URL is already taken" }),
          { status: 400 }
        );
      }
    } else {
      // Generate default custom URL from display name or email
      const baseUrl = displayName
        ? displayName
        : session.user.email?.split("@")[0] || "";

      formattedCustomUrl = await generateDefaultCustomUrl(baseUrl, user.id);
    }

    // Update or create the user's profile
    const profile = await prisma.profile.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        displayName,
        bio,
        location,
        website,
        twitterHandle,
        githubHandle,
        company,
        jobTitle,
        phoneNumber,
        customUrl: formattedCustomUrl,
        themeColor: theme || themeColor,
        bannerImage,
        layout,
        skills,
        achievements,
        profileComplete: true,
        onboardingComplete: false,
        onboardingStep: "personalization",
      },
      update: {
        displayName,
        bio,
        location,
        website,
        twitterHandle,
        githubHandle,
        company,
        jobTitle,
        phoneNumber,
        customUrl: formattedCustomUrl,
        themeColor: theme || themeColor,
        bannerImage,
        layout,
        skills,
        achievements,
        profileComplete: true,
      },
    });

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Error updating onboarding data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
