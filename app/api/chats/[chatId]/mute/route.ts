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
    const { muted } = await request.json();

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

    // Update the mute status
    const updatedParticipant = await prisma.chatParticipant.update({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId,
        },
      },
      data: {
        muted,
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

    // Trigger a real-time update
    await pusher.trigger(`chat-${chatId}`, "chat-muted", {
      userId: session.user.id,
      muted,
      userName: session.user.name,
    });

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error("[CHAT_MUTE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
