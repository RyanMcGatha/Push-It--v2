import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { receiverId } = await req.json();

    if (!receiverId) {
      return new NextResponse("Receiver ID is required", { status: 400 });
    }

    // Check if a friend request already exists
    const existingRequest = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: session.user.id,
          },
        ],
      },
    });

    if (existingRequest) {
      return new NextResponse("Friend request already exists", { status: 400 });
    }

    // Create friend request
    const friendRequest = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId: receiverId,
        status: "pending",
      },
      include: {
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

    // Create notification for the receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: "New Friend Request",
        message: `You have a new friend request from ${
          session.user.name || "someone"
        }`,
        type: "friend_request",
      },
    });

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error("[FRIEND_REQUEST_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const requests = await prisma.friendship.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            status: "pending",
          },
          {
            receiverId: session.user.id,
            status: "pending",
          },
        ],
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

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[FRIEND_REQUESTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
