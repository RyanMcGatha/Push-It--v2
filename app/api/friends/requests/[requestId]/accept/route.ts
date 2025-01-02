import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";

export async function POST(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const friendRequest = await prisma.friendship.findUnique({
      where: {
        id: params.requestId,
      },
    });

    if (!friendRequest) {
      return new NextResponse("Friend request not found", { status: 404 });
    }

    if (friendRequest.receiverId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedRequest = await prisma.friendship.update({
      where: {
        id: params.requestId,
      },
      data: {
        status: "accepted",
      },
      include: {
        sender: {
          include: {
            profile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    // Create notification for the sender
    await prisma.notification.create({
      data: {
        userId: friendRequest.senderId,
        title: "Friend Request Accepted",
        message: `${
          session.user.name || "Someone"
        } accepted your friend request`,
        type: "friend_request_accepted",
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("[FRIEND_REQUEST_ACCEPT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
