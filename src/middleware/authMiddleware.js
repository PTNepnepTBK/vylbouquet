// Middleware untuk cek autentikasi admin
import { cookies } from "next/headers";
import { verifyToken } from "../lib/auth";

export async function getAuthStatus() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) {
      return false;
    }

    // Verify token
    const decoded = verifyToken(token);
    return !!decoded;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}

export function authMiddleware(handler) {
  return async (request, context) => {
    const isAuthenticated = await getAuthStatus();
    
    if (!isAuthenticated) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized - Token tidak valid atau tidak ditemukan",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return handler(request, context);
  };
}
