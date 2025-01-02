import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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

    await prisma.notification.delete({
      where: {
        id: params.notificationId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[NOTIFICATION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
