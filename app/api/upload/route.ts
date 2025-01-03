import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Different validation rules based on type
    if (type === "image" || type === "banner" || type === "avatar") {
      // Validate image file type
      const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validImageTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPEG, PNG and WebP are allowed" },
          { status: 400 }
        );
      }
      // Max 5MB for images
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size too large. Maximum size is 5MB" },
          { status: 400 }
        );
      }
    } else if (type === "attachment") {
      // For general attachments, allow more file types but still validate
      const validAttachmentTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!validAttachmentTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Please upload a supported file type" },
          { status: 400 }
        );
      }
      // Max 10MB for attachments
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size too large. Maximum size is 10MB" },
          { status: 400 }
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.type.split("/")[1];
    const filename = `${uuidv4()}.${ext}`;

    // Save to appropriate directory based on type
    let directory;
    switch (type) {
      case "banner":
        directory = "banners";
        break;
      case "avatar":
        directory = "avatars";
        break;
      case "attachment":
        directory = "attachments";
        break;
      default:
        directory = "uploads";
    }

    const path = join(process.cwd(), "public", "uploads", directory);
    const filepath = join(path, filename);

    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${directory}/${filename}`;

    // Update the database based on the type of upload
    if (type === "banner") {
      await prisma.profile.upsert({
        where: { userId: session.user.id },
        update: { bannerImage: fileUrl },
        create: {
          userId: session.user.id,
          bannerImage: fileUrl,
        },
      });
    } else if (type === "avatar") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: fileUrl },
      });
    } else if (type === "attachment") {
      // For attachments, we might want to store metadata in the database
      await prisma.attachment.create({
        data: {
          userId: session.user.id,
          url: fileUrl,
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
      });
    }

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
