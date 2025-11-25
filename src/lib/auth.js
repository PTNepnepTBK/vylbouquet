import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Generate JWT token
export function generateToken(payload) {
  try {
    // Session expire dalam 24 jam (1 hari) untuk keamanan admin
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

// Hash password dengan bcrypt
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error("Error hashing password:", error);
    return null;
  }
}

// Compare password dengan hash
export async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
}

// Verify authentication from request (for API routes)
export function verifyAuth(request) {
  try {
    // Get token from cookie header
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return { valid: false, message: "Token tidak ditemukan" };
    }

    // Parse cookie to get auth_token
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

    const token = cookies["auth_token"];
    if (!token) {
      return { valid: false, message: "Token tidak ditemukan" };
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return { valid: false, message: "Token tidak valid" };
    }

    return { valid: true, user: decoded };
  } catch (error) {
    console.error("Error verifying auth:", error);
    return { valid: false, message: "Error verifying authentication" };
  }
}
