"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check auth status dari localStorage
    const storedUser = localStorage.getItem("admin_user");
    const token = localStorage.getItem("token");
    
    // Jika ada user tapi tidak ada token, logout otomatis
    if (storedUser && !token) {
      localStorage.removeItem("admin_user");
      setUser(null);
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        localStorage.setItem("admin_user", JSON.stringify(data.data));
        
        // Simpan token juga ke localStorage untuk API calls
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Terjadi kesalahan saat login" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      localStorage.removeItem("admin_user");
      localStorage.removeItem("token");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { user, loading, login, logout };
}
