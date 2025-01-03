import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";
import { headers } from "next/headers";

export const runtime = "nodejs"; // Use Node.js runtime for bcrypt compatibility

export async function GET(request: Request) {
  try {
    const headersList = headers();
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

    // Add cache control headers
    return new NextResponse(JSON.stringify(notifications), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch notifications" }),
      { status: 500 }
    );
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
        `user-${user.id}-notifications`,
        "notification-updated",
        updatedNotification
      );

      return NextResponse.json(updatedNotification);
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title,
        message,
        count: 1,
      },
    });

    // Trigger real-time notification
    console.log(
      "Triggering new-notification event for user:",
      user.id,
      notification
    );
    await pusher.trigger(
      `user-${user.id}-notifications`,
      "new-notification",
      notification
    );

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
