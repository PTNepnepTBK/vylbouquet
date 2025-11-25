import { NextResponse } from "next/server";
import { comparePassword, generateToken } from "../../../../lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    // Find admin using Supabase
    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (error || !admin) {
      console.error("Admin fetch error:", error);
      return NextResponse.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      full_name: admin.full_name,
    });

    // Create response dengan cookie dan token
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      token: token, // Kirim token juga di response body
      data: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        email: admin.email,
      },
    });

    // Set cookie untuk token
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours (1 hari)
      path: "/",
    });

    return response;
  } catch (error) {
    if (error?.message === "MODEL_LOAD_FAILED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Model tidak dapat dimuat. Pastikan server telah restart setelah perubahan.",
        },
        { status: 500 }
      );
    }
    console.error("Login error:", error?.message, error?.stack);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
