import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchQuery = request.nextUrl.searchParams.get("q");
    if (!searchQuery) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search through chats and messages
    const results = await prisma.$transaction(async (tx) => {
      // Find chats where the user is a participant
      const chats = await tx.chat.findMany({
        where: {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
          name: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });

      // Find messages in chats where the user is a participant
      const messages = await tx.message.findMany({
        where: {
          chat: {
            participants: {
              some: {
                userId: session.user.id,
              },
            },
          },
          content: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          chat: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 20,
      });

      return [
        ...chats.map((chat) => ({
          id: chat.id,
          title: chat.name || "Untitled Chat",
          description: `Created ${new Date(
            chat.createdAt
          ).toLocaleDateString()}`,
          type: "chat",
          url: `/dashboard/chat/${chat.id}`,
        })),
        ...messages.map((message) => ({
          id: message.id,
          title: message.chat.name || "Message in Chat",
          description: message.content,
          type: "message",
          url: `/dashboard/chat/${message.chat.id}`,
        })),
      ];
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
