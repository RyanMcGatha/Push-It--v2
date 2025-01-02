import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const friends = await prisma.user.findMany({
      where: {
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
    console.error("[FRIENDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
