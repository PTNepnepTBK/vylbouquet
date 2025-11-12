import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files"); // Ambil semua file dengan key 'files'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files uploaded" },
        { status: 400 }
      );
    }

    // Validasi maksimal 5 file
    if (files.length > 5) {
      return NextResponse.json(
        { success: false, message: "Maximum 5 files allowed" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const uploadedUrls = [];

    // Get upload type dari form (orders atau bouquets)
    const uploadType = formData.get("type") || "orders"; // default: orders

    // Create upload directory
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      uploadType
    );
    await mkdir(uploadDir, { recursive: true });

    // Process each file
    for (const file of files) {
      // Validasi tipe file
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid file type for ${file.name}. Only JPG, PNG, WEBP allowed`,
          },
          { status: 400 }
        );
      }

      // Validasi ukuran file
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            message: `File ${file.name} is too large. Max 2MB per file`,
          },
          { status: 400 }
        );
      }

      // Generate unique filename
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const originalName = file.name.replace(/\s+/g, "-");
      const filename = `${timestamp}-${random}-${originalName}`;

      // Save file
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // Add URL to array
      const url = `/uploads/${uploadType}/${filename}`;
      uploadedUrls.push(url);
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedUrls.length} file(s) uploaded successfully`,
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error("Upload multiple error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
