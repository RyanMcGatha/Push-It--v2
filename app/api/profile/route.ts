import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();

    // Format and validate customUrl
    if (data.customUrl) {
      // Remove spaces and special characters, convert to lowercase
      data.customUrl = data.customUrl
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-") // Replace multiple consecutive dashes with single dash
        .replace(/^-|-$/g, ""); // Remove leading and trailing dashes

      // Check if customUrl is already taken by another user
      const existingProfile = await prisma.profile.findFirst({
        where: {
          customUrl: data.customUrl,
          userId: { not: session.user.id }, // Exclude current user
        },
      });

      if (existingProfile) {
        return new NextResponse(
          JSON.stringify({ error: "This custom URL is already taken" }),
          { status: 400 }
        );
      }
    }

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        bio: data.bio,
        location: data.location,
        website: data.website,
        twitterHandle: data.twitterHandle,
        githubHandle: data.githubHandle,
        company: data.company,
        jobTitle: data.jobTitle,
        phoneNumber: data.phoneNumber,
        customUrl: data.customUrl,
        themeColor: data.themeColor,
        bannerImage: data.bannerImage,
        layout: data.layout,
        skills: data.skills || [],
        achievements: data.achievements || [],
        customSections: data.customSections || [],
        profileComplete: true,
      },
      create: {
        userId: session.user.id,
        bio: data.bio,
        location: data.location,
        website: data.website,
        twitterHandle: data.twitterHandle,
        githubHandle: data.githubHandle,
        company: data.company,
        jobTitle: data.jobTitle,
        phoneNumber: data.phoneNumber,
        customUrl: data.customUrl,
        themeColor: data.themeColor,
        bannerImage: data.bannerImage,
        layout: data.layout,
        skills: data.skills || [],
        achievements: data.achievements || [],
        customSections: data.customSections || [],
        profileComplete: true,
      },
    });

    // Update user name if changed
    if (data.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: data.name },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!profile) {
      // Return a default profile structure if none exists
      return NextResponse.json({
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
        bio: "",
        location: "",
        website: "",
        twitterHandle: "",
        githubHandle: "",
        company: "",
        jobTitle: "",
        phoneNumber: "",
        customUrl: "",
        themeColor: "#6366f1",
        bannerImage: "",
        layout: "modern",
        skills: [],
        achievements: [],
        customSections: [],
        profileComplete: false,
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
