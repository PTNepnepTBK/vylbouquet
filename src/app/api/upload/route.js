import { NextResponse } from "next/server";
import { uploadFile, deleteFile } from "@/lib/supabaseStorage";

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

    // Validasi tipe file gambar
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only images allowed",
        },
        { status: 400 }
      );
    }

    // Validasi ukuran file (max 5MB - karena sudah ada kompresi di client)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "File size too large. Max 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${ext}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a File object for Supabase
    const fileToUpload = new File([buffer], filename, { type: file.type });

    // Upload to Supabase Storage in 'bouquets' folder
    const result = await uploadFile(fileToUpload, 'bouquets', filename);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: result.url,
      path: result.path,
      filename: filename
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Hapus file dari Supabase Storage
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: "No URL provided" },
        { status: 400 }
      );
    }

    // Delete from Supabase Storage
    const result = await deleteFile(url);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
