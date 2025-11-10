// Middleware untuk cek autentikasi admin

export function getAuthStatus(request) {
  // Cek JWT dari cookie
  const token = request.cookies.get("auth_token");
  // Di sini bisa ditambah verifikasi token jika perlu
  return !!token;
}

export function authMiddleware(handler) {
  return async (request, context) => {
    if (!getAuthStatus(request)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized",
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
