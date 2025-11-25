"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Auto check session validity setiap 5 menit
  useEffect(() => {
    // Check auth status dari localStorage
    const storedUser = localStorage.getItem("admin_user");
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("token_expiry");
    
    // Check apakah token sudah expired berdasarkan localStorage
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      console.log("Token expired (localStorage check), logging out...");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("token");
      localStorage.removeItem("token_expiry");
      setUser(null);
      setLoading(false);
      return;
    }
    
    // Jika ada user tapi tidak ada token, logout otomatis
    if (storedUser && !token) {
      localStorage.removeItem("admin_user");
      localStorage.removeItem("token_expiry");
      setUser(null);
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Auto-check session validity setiap 5 menit
  useEffect(() => {
    if (!user) return;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        });

        const data = await response.json();

        if (!data.authenticated) {
          console.log("Session expired, logging out...");
          // Session expired, logout otomatis
          setUser(null);
          localStorage.removeItem("admin_user");
          localStorage.removeItem("token");
          localStorage.removeItem("token_expiry");
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    // JANGAN check immediately saat mount - biarkan interval yang handle
    // Mulai check setelah 5 menit pertama
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, router]);

  const login = async (username, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Penting: untuk menerima dan mengirim cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        localStorage.setItem("admin_user", JSON.stringify(data.data));
        
        // Simpan token dan waktu expired (24 jam dari sekarang)
        if (data.token) {
          localStorage.setItem("token", data.token);
          const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 jam
          localStorage.setItem("token_expiry", expiryTime.toString());
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
        credentials: "include", // Penting: untuk mengirim cookies
      });

      setUser(null);
      localStorage.removeItem("admin_user");
      localStorage.removeItem("token");
      localStorage.removeItem("token_expiry");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { user, loading, login, logout };
}
