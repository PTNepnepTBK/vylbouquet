import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // TODO: Get all orders
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // TODO: Create new order

    return NextResponse.json({
      success: true,
      message: "Order created",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
