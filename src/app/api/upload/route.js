import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only JPG, PNG, WEBP allowed",
        },
        { status: 400 }
      );
    }

    // Validasi ukuran file (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "File size too large. Max 2MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, "-");
    const filename = `${timestamp}-${originalName}`;

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "bouquets");
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return URL
    const url = `/uploads/bouquets/${filename}`;

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
