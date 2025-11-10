import { NextResponse } from "next/server";
import { authMiddleware, getAuthStatus } from "../../../../middleware/authMiddleware";

export async function GET(request) {
  try {
    const Bouquet = (await import("../../../../models/Bouquet")).default;
    const isAuth = getAuthStatus(request);
    if (!isAuth) {
      // Jika tidak ada JWT, hanya return total buket aktif
      const activeBouquets = await Bouquet.count({ where: { is_active: true } });
      return NextResponse.json({
        success: true,
        data: {
          active: activeBouquets
        }
      });
    }
    // Jika ada JWT, return semua statistik
    const allBouquets = await Bouquet.findAll();
    const totalBouquets = allBouquets.length;
    const activeBouquets = allBouquets.filter((b) => b.is_active).length;
    const inactiveBouquets = allBouquets.filter((b) => !b.is_active).length;
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
