import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const friends = await prisma.user.findMany({
      where: {
        AND: [
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
          {
            OR: [
              {
                name: {
                  contains: query || "",
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query || "",
                  mode: "insensitive",
                },
              },
              {
                profile: {
                  OR: [
                    {
                      displayName: {
                        contains: query || "",
                        mode: "insensitive",
                      },
                    },
                    {
                      bio: {
                        contains: query || "",
                        mode: "insensitive",
                      },
                    },
                    {
                      location: {
                        contains: query || "",
                        mode: "insensitive",
                      },
                    },
                    {
                      company: {
                        contains: query || "",
                        mode: "insensitive",
                      },
                    },
                    {
                      jobTitle: {
                        contains: query || "",
                        mode: "insensitive",
                      },
                    },
                    {
                      customUrl: {
                        contains: query || "",
                        mode: "insensitive",
                      },
                    },
                  ],
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
    });

    return NextResponse.json(friends);
  } catch (error) {
    console.error("[FRIENDS_SEARCH_ADDED]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
