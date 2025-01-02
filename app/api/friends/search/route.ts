import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    // Find users matching the search query
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                profile: {
                  displayName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
            ],
          },
          {
            // Exclude current user
            NOT: {
              id: session.user.id,
            },
          },
          {
            // Exclude users who are already friends or have pending requests
            AND: [
              {
                NOT: {
                  receivedFriendRequests: {
                    some: {
                      senderId: session.user.id,
                    },
                  },
                },
              },
              {
                NOT: {
                  sentFriendRequests: {
                    some: {
                      receiverId: session.user.id,
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        profile: {
          select: {
            displayName: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[FRIENDS_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
