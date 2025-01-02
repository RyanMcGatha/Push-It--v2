import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";

export async function DELETE(
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
    });

    if (!participant) {
      return new NextResponse("Not a participant in this chat", {
        status: 403,
      });
    }

    // Get all participants before deleting the chat
    const participants = await prisma.chatParticipant.findMany({
      where: {
        chatId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Delete the chat and all related data (messages and participants will be cascade deleted)
    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });

    // Notify all participants that the chat has been deleted
    await pusher.trigger("chats", "chat-deleted", {
      chatId,
      deletedBy: {
        userId: session.user.id,
        userName: session.user.name,
      },
      participants: participants.map((p) => ({
        userId: p.user.id,
        userName: p.user.name,
      })),
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHAT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
