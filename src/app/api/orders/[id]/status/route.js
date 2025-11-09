import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // TODO: Update order status

    return NextResponse.json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
