import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";
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
        receiver: {
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
        status: "rejected",
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
        receiver: {
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
    const notification = await prisma.notification.create({
      data: {
        userId: friendRequest.senderId,
        title: "Friend Request Rejected",
        message: `${
          session.user.name || "Someone"
        } rejected your friend request`,
        type: "friend_request_rejected",
      },
    });

    // Trigger real-time updates for both users
    await pusher.trigger(
      `user-${friendRequest.senderId}`,
      "friendship-updated",
      updatedRequest
    );
    await pusher.trigger(
      `user-${friendRequest.receiverId}`,
      "friendship-updated",
      updatedRequest
    );

    // Trigger real-time notification
    await pusher.trigger(
      `user-${friendRequest.senderId}-notifications`,
      "new-notification",
      notification
    );

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("[FRIEND_REQUEST_REJECT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
