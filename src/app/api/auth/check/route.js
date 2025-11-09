import { NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";

export async function GET(request) {
  try {
    const token = request.cookies.get("auth_token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token.value);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: decoded,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
