import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  try {
    // Verify authentication
    const authResult = verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get order with bouquet details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        bouquets (
          id,
          name,
          price,
          image_url
        )
      `)
      .eq("id", id)
      .single();

    if (orderError || !order) {
      console.error("Get order error:", orderError);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Get order images
    const { data: images } = await supabase
      .from("order_images")
      .select("*")
      .eq("order_id", id)
      .order("display_order", { ascending: true });

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        images: images || [],
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Verify authentication
    const authResult = verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const { data: order, error } = await supabase
      .from("orders")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated",
      data: order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
