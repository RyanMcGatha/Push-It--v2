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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
