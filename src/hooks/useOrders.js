"use client";

import { useState, useEffect } from "react";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders", {
        credentials: "include", // Penting: sertakan cookies untuk autentikasi
      });
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    setLoading(true);
    fetchOrders();
  };

  return { orders, loading, refreshOrders };
}
