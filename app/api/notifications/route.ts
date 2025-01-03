import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session state:", {
      exists: !!session,
      user: session?.user,
      id: session?.user?.id,
    });

    if (!session?.user?.id) {
      console.log("Auth failed - no session or user ID");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { title, message, type } = await req.json();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check for similar notifications in the last minute to prevent spam
    const recentSimilarNotification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: type,
        title: title,
        createdAt: {
          gte: new Date(Date.now() - 60000), // Last minute
        },
      },
    });

    if (recentSimilarNotification) {
      // Update existing notification instead of creating a new one
      const updatedNotification = await prisma.notification.update({
        where: {
          id: recentSimilarNotification.id,
        },
        data: {
          count: {
            increment: 1,
          },
          message:
            type === "message" ? `You have multiple new messages` : message,
          updatedAt: new Date(),
        },
      });

      // Trigger real-time notification update
      console.log(
        "Triggering notification-updated event for user:",
        user.id,
        updatedNotification
      );
      await pusher.trigger(
        `user-${user.id}`,
        "notification-updated",
        updatedNotification
      );

      return NextResponse.json(updatedNotification);
    }

    // Create new notification if no recent similar ones exist
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: user.id,
        count: 1,
      },
    });

    // Trigger real-time notification update
    console.log(
      "Triggering new-notification event for user:",
      user.id,
      notification
    );
    await pusher.trigger(`user-${user.id}`, "new-notification", notification);

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
