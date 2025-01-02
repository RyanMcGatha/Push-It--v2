import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { friendId } = await request.json();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const friendship = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId: friendId,
        status: "PENDING",
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Trigger real-time updates for both users
    await pusher.trigger(
      `user-${session.user.id}`,
      "friend-request-sent",
      friendship
    );
    await pusher.trigger(
      `user-${friendId}`,
      "friend-request-received",
      friendship
    );

    return NextResponse.json(friendship);
  } catch (error) {
    console.error("[FRIENDS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { friendshipId, status } = await request.json();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const friendship = await prisma.friendship.update({
      where: {
        id: friendshipId,
      },
      data: {
        status,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Trigger real-time updates for both users
    await pusher.trigger(
      `user-${friendship.senderId}`,
      "friendship-updated",
      friendship
    );
    await pusher.trigger(
      `user-${friendship.receiverId}`,
      "friendship-updated",
      friendship
    );

    return NextResponse.json(friendship);
  } catch (error) {
    console.error("[FRIENDS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
