import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";

export async function DELETE(
  request: Request,
  { params }: { params: { friendId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const friendId = await params.friendId;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete friendship records in both directions
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: friendId,
            status: "accepted",
          },
          {
            senderId: friendId,
            receiverId: session.user.id,
            status: "accepted",
          },
        ],
      },
    });

    // Trigger real-time update for both users
    await pusher.trigger(`user-${session.user.id}`, "friendship-removed", {
      friendId,
    });
    await pusher.trigger(`user-${friendId}`, "friendship-removed", {
      friendId: session.user.id,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FRIEND_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
