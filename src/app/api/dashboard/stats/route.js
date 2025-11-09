import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // TODO: Get dashboard statistics

    const stats = {
      newOrders: 0,
      confirmedOrders: 0,
      inProcessOrders: 0,
      completedOrders: 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
