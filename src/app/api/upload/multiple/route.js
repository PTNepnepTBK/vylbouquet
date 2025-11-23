import { NextResponse } from "next/server";
import { uploadMultipleFiles } from "@/lib/supabaseStorage";

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

    // Validasi maksimal 10 file
    if (files.length > 10) {
      return NextResponse.json(
        { success: false, message: "Maximum 10 files allowed" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB per file

    // Get upload type dari form (orders atau bouquets)
    const uploadType = formData.get("type") || "orders"; // default: orders

    // Validasi semua file
    for (const file of files) {
      // Validasi tipe file gambar
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid file type for ${file.name}. Only images allowed`,
          },
          { status: 400 }
        );
      }

      // Validasi ukuran file
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            message: `File ${file.name} is too large. Max 5MB per file`,
          },
          { status: 400 }
        );
      }
    }

    // Convert files to proper format for upload
    const filesToUpload = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return new File([buffer], file.name, { type: file.type });
      })
    );

    // Upload to Supabase Storage
    const result = await uploadMultipleFiles(filesToUpload, uploadType);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.error || 'Upload failed',
          errors: result.errors 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.urls.length} file(s) uploaded successfully`,
      urls: result.urls,
    });
  } catch (error) {
    console.error("Upload multiple error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
