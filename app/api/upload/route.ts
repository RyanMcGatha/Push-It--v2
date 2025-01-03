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

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG and WebP are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.type.split("/")[1];
    const filename = `${uuidv4()}.${ext}`;

    // Save to appropriate directory based on type
    const directory = type === "banner" ? "banners" : "avatars";
    const path = join(process.cwd(), "public", "uploads", directory);
    const filepath = join(path, filename);

    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${directory}/${filename}`;

    // Update the database based on the type of upload
    if (type === "banner") {
      await prisma.profile.upsert({
        where: { userId: session.user.id },
        update: { bannerImage: imageUrl },
        create: {
          userId: session.user.id,
          bannerImage: imageUrl,
        },
      });
    } else {
      // Update both user image and profile
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: imageUrl },
      });
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
