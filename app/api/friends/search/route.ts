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

    console.log("[FRIENDS_SEARCH] Query:", query);

    if (!query) {
      // Return all accepted friends when no query is provided
      const friends = await prisma.user.findMany({
        where: {
          OR: [
            {
              // Users who have accepted our friend request
              receivedFriendRequests: {
                some: {
                  senderId: session.user.id,
                  status: "accepted",
                },
              },
            },
            {
              // Users who we've accepted as friends
              sentFriendRequests: {
                some: {
                  receiverId: session.user.id,
                  status: "accepted",
                },
              },
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
    }

    // Find users matching the search query
    const users = await prisma.user.findMany({
      where: {
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
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log("[FRIENDS_SEARCH] Raw search results:", users);

    // Now perform the full search with all filters
    const filteredUsers = await prisma.user.findMany({
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
                email: {
                  startsWith: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: "@" + query,
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
              {
                profile: {
                  bio: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
              {
                profile: {
                  location: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
              {
                profile: {
                  company: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
              {
                profile: {
                  jobTitle: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
              {
                profile: {
                  customUrl: {
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
                  OR: [
                    {
                      // Exclude accepted friends
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
                    {
                      // Exclude pending requests
                      receivedFriendRequests: {
                        some: {
                          senderId: session.user.id,
                          status: "pending",
                        },
                      },
                    },
                    {
                      sentFriendRequests: {
                        some: {
                          receiverId: session.user.id,
                          status: "pending",
                        },
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
      take: 10,
    });

    console.log(
      "[FRIENDS_SEARCH] After filtering:",
      filteredUsers.map((u) => ({ id: u.id, email: u.email, name: u.name }))
    );
    console.log("[FRIENDS_SEARCH] Current user ID:", session.user.id);

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("[FRIENDS_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
