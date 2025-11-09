// Middleware untuk cek autentikasi admin

export function authMiddleware(handler) {
  return async (request, context) => {
    // TODO: Implement authentication check
    // Check JWT token dari cookie atau header
    
    const token = request.cookies.get('auth_token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify token
    // const decoded = verifyToken(token.value);
    
    // if (!decoded) {
    //   return new Response(JSON.stringify({ 
    //     success: false, 
    //     message: 'Invalid token' 
    //   }), {
    //     status: 401,
    //     headers: { 'Content-Type': 'application/json' }
    //   });
    // }
    
    return handler(request, context);
  };
}
