import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function GET(
  request: Request,
  context: { params: { chatId: string } }
) {
  const { chatId } = await context.params;

  const session = await getServerSession(authOptions);
  console.log("session", session);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Check if user is a participant in the chat
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId: chatId,
        },
      },
    });

    if (!participant) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: { chatId: string } }
) {
  const { chatId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { content } = await request.json();

    // Check if user is a participant in the chat
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId: chatId,
        },
      },
    });

    if (!participant) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        chatId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Get all participants except the sender to create notifications
    const participants = await prisma.chatParticipant.findMany({
      where: {
        chatId,
        NOT: {
          userId: session.user.id,
        },
        muted: false, // Don't create notifications for muted participants
      },
      include: {
        user: true,
      },
    });

    // Create notifications for each participant
    await Promise.all(
      participants.map(async (participant) => {
        const notification = await prisma.notification.create({
          data: {
            userId: participant.userId,
            title: "New Message",
            message: `${
              session.user.name || "Someone"
            } sent a message: ${content.substring(0, 50)}${
              content.length > 50 ? "..." : ""
            }`,
            type: "message",
          },
        });

        // Trigger notification event for each recipient
        await pusher.trigger(
          `user-${participant.userId}-notifications`,
          "new-notification",
          notification
        );

        return notification;
      })
    );

    // Trigger the new message event on Pusher
    await pusher.trigger(`chat-${chatId}`, "new-message", message);

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
