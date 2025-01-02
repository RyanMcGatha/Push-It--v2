import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    // If no query is provided, return an empty array
    if (!query) {
      return NextResponse.json([]);
    }

    const friends = await prisma.user.findMany({
      where: {
        AND: [
          // Search conditions
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
          // Friend conditions
          {
            OR: [
              {
                receivedFriendRequests: {
                  some: {
                    senderId: session.user.id,
                    status: "accepted",
                  },
                },
              },
              {
                sentFriendRequests: {
                  some: {
                    receiverId: session.user.id,
                    status: "accepted",
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

    return NextResponse.json(friends);
  } catch (error) {
    console.error("[FRIENDS_SEARCH_ADDED]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
