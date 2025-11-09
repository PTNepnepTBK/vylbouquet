import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Load Bouquet model
    const Bouquet = (await import("../../../../models/Bouquet")).default;

    // Get all bouquets
    const allBouquets = await Bouquet.findAll();

    // Calculate statistics
    const totalBouquets = allBouquets.length;
    const activeBouquets = allBouquets.filter((b) => b.is_active).length;
    const inactiveBouquets = allBouquets.filter((b) => !b.is_active).length;

    // Calculate average price
    const totalPrice = allBouquets.reduce(
      (sum, bouquet) => sum + parseFloat(bouquet.price || 0),
      0
    );
    const averagePrice = totalBouquets > 0 ? totalPrice / totalBouquets : 0;

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
