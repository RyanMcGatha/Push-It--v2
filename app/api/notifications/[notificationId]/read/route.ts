import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: params.notificationId,
      },
      include: {
        user: true,
      },
    });

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    if (notification.user.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: params.notificationId,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("[NOTIFICATION_MARK_READ]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
