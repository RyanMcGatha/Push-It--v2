import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Get users who are not already in the chat
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: session.user.id, // Exclude current user
            },
          },
          {
            NOT: {
              chats: {
                some: {
                  chatId: chatId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching available users:", error);
    return NextResponse.json(
      { error: "Failed to fetch available users" },
      { status: 500 }
    );
  }
}
