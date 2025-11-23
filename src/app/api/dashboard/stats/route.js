import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // Get statistics for each status using Supabase
    const [waitingResult, confirmedResult, inProcessResult, readyResult, completedResult] = await Promise.all(
      [
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "WAITING_CONFIRMATION"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "PAYMENT_CONFIRMED"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "IN_PROCESS"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "READY_FOR_PICKUP"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "COMPLETED"),
      ]
    );

    // Get recent orders (last 10)
    const { data: recentOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, customer_name, pickup_date, order_status, payment_status")
      .order("created_at", { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error("Get recent orders error:", ordersError);
    }

    const stats = {
      waiting: waitingResult.count || 0,
      confirmed: confirmedResult.count || 0,
      inProcess: inProcessResult.count || 0,
      ready: readyResult.count || 0,
      completed: completedResult.count || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentOrders: recentOrders || [],
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
