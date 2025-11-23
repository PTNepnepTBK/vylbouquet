import { NextResponse } from "next/server";
import { verifyAuth } from "../../../../lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // Check if authenticated
    const authResult = verifyAuth(request);
    
    if (!authResult.valid) {
      // Jika tidak ada JWT, hanya return total buket aktif
      const { count: activeBouquets } = await supabase
        .from("bouquets")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      return NextResponse.json({
        success: true,
        data: {
          active: activeBouquets || 0,
        },
      });
    }
    
    // Jika ada JWT, return semua statistik
    const { data: allBouquets, error } = await supabase
      .from("bouquets")
      .select("*");

    if (error) {
      console.error("Get bouquets error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch bouquets" },
        { status: 500 }
      );
    }

    const totalBouquets = allBouquets?.length || 0;
    const activeBouquets = allBouquets?.filter((b) => b.is_active).length || 0;
    const inactiveBouquets = allBouquets?.filter((b) => !b.is_active).length || 0;

    // Hitung rata-rata hanya dari bouquet yang aktif
    const activeBouquetList = allBouquets?.filter((b) => b.is_active) || [];
    const totalPrice = activeBouquetList.reduce(
      (sum, bouquet) => sum + parseFloat(bouquet.price || 0),
      0
    );
    const averagePrice = activeBouquets > 0 ? totalPrice / activeBouquets : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        total: totalBouquets,
        active: activeBouquets,
        inactive: inactiveBouquets,
        averagePrice: Math.round(averagePrice),
      },
    });
  } catch (error) {
    console.error("Get bouquets stats error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
