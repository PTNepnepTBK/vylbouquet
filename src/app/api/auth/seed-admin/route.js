import { NextResponse } from "next/server";
import { hashPassword } from "../../../../lib/auth";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Cek apakah admin sudah ada using Supabase
    const { data: existingAdmin, error: checkError } = await supabase
      .from("admins")
      .select("*")
      .eq("username", "admin")
      .single();

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin sudah ada",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword("asdasdasd");

    // Buat admin baru using Supabase
    const { data: admin, error: createError } = await supabase
      .from("admins")
      .insert({
        username: "asdasdasdt",
        password: hashedPassword,
        full_name: "asdasd",
        email: "asdasd@gmail.com",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Create admin error:", createError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create admin",
          error: createError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin berhasil dibuat",
      data: {
        username: admin.username,
        full_name: admin.full_name,
        note: "Password default: admin123",
      },
    });
  } catch (error) {
    console.error("Seed admin error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
