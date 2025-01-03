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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid user IDs provided" },
        { status: 400 }
      );
    }

    // Verify the chat exists and the current user has permission
    const chat = await prisma.chat.findFirst({
      where: {
        id: params.chatId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    // Add new participants
    const newParticipants = await Promise.all(
      userIds.map(async (userId: string) => {
        return prisma.chatParticipant.create({
          data: {
            chatId: params.chatId,
            userId,
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
      })
    );

    // Notify existing participants about new members
    await pusher.trigger(`chat-${params.chatId}`, "participants-added", {
      addedBy: {
        userId: session.user.id,
        userName: session.user.name,
      },
      newParticipants: newParticipants.map((p) => ({
        userId: p.user.id,
        userName: p.user.name,
      })),
    });

    return NextResponse.json({
      message: "Participants added successfully",
      participants: newParticipants,
    });
  } catch (error) {
    console.error("Error adding participants:", error);
    return NextResponse.json(
      { error: "Failed to add participants" },
      { status: 500 }
    );
  }
}
