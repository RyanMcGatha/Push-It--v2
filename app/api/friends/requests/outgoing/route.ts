import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const outgoingRequests = await prisma.friendship.findMany({
      where: {
        senderId: session.user.id,
        status: "pending",
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        receiver: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(outgoingRequests);
  } catch (error) {
    console.error("[FRIENDS_OUTGOING_REQUESTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}