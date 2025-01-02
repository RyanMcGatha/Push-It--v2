import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { chatId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is a participant in the chat
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId,
        },
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

    if (!participant) {
      return new NextResponse("Not a participant in this chat", {
        status: 403,
      });
    }

    // Delete the participant
    await prisma.chatParticipant.delete({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId,
        },
      },
    });

    // Check if this was the last participant
    const remainingParticipants = await prisma.chatParticipant.count({
      where: {
        chatId,
      },
    });

    // If no participants left, delete the chat
    if (remainingParticipants === 0) {
      await prisma.chat.delete({
        where: {
          id: chatId,
        },
      });
      // Notify that the chat has been deleted
      await pusher.trigger("chats", "chat-deleted", {
        chatId,
      });
    } else {
      // Notify remaining participants that someone left
      await pusher.trigger(`chat-${chatId}`, "participant-left", {
        userId: session.user.id,
        userName: session.user.name,
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHAT_LEAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
