import { NextResponse } from "next/server";
import { hashPassword } from "../../../../lib/auth";

export async function POST(request) {
  try {
    // Sync database terlebih dahulu
    const modelsModule = await import("../../../../models/index");
    const syncDatabase =
      modelsModule.syncDatabase ?? modelsModule.default?.syncDatabase;
    if (typeof syncDatabase === "function") {
      await syncDatabase();
    }

    // Cek apakah admin sudah ada
    const Admin = (await import("../../../../models/Admin")).default;
    const existingAdmin = await Admin.findOne({ where: { username: "admin" } });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin sudah ada",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword("vyl812@bouquet");

    // Buat admin baru
    const admin = await Admin.create({
      username: "vylbouquet",
      password: hashedPassword,
      full_name: "VYL_Administrator",
      email: "vylbouquet@gmail.com",
      is_active: true,
    });

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
