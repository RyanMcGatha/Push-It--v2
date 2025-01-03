import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Profile } from "@prisma/client";

type ProfileWithUser = Profile & {
  user: {
    name: string | null;
    image: string | null;
  };
};

const removeSensitiveInfo = ({
  phoneNumber: _,
  ...publicProfile
}: ProfileWithUser) => {
  return publicProfile;
};

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;
    const profileQuery = {
      include: {
        user: {
          select: {
            name: true,
            image: true,
            email: true,
          },
        },
      },
    };

    // First try to find by customUrl
    let profile = await prisma.profile.findFirst({
      where: {
        customUrl: username,
      },
      ...profileQuery,
    });

    // If not found, try to find by username
    if (!profile) {
      profile = await prisma.profile.findFirst({
        where: {
          user: {
            name: username,
          },
        },
        ...profileQuery,
      });
    }

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Remove sensitive information
    return NextResponse.json(removeSensitiveInfo(profile));
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
