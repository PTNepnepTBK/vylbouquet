import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    console.log("Update order status request:", { id, body });

    // Find the order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fetch order error:", fetchError);
      return NextResponse.json(
        { success: false, message: "Order not found", error: fetchError.message },
        { status: 404 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    console.log("Current order:", order);

    const updates = {};
    const oldStatus = order.order_status || order.status;
    const oldPaymentStatus = order.payment_status || order.payment_channel;

    // Update order status if provided
    if (body.status) {
      const validStatuses = [
        "WAITING_CONFIRMATION",
        "PAYMENT_CONFIRMED",
        "IN_PROCESS",
        "READY_FOR_PICKUP",
        "COMPLETED",
        "CANCELLED",
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid status" },
          { status: 400 }
        );
      }
      // Only update the column that exists in database
      if (order.order_status !== undefined) {
        updates.order_status = body.status;
      } else if (order.status !== undefined) {
        updates.status = body.status;
      } else {
        // Fallback: update both
        updates.order_status = body.status;
        updates.status = body.status;
      }
    }

    // Update payment status if provided
    if (body.payment_status) {
      if (!["UNPAID", "PAID"].includes(body.payment_status)) {
        return NextResponse.json(
          { success: false, message: "Invalid payment status" },
          { status: 400 }
        );
      }
      
      // Only update the column that exists in database
      if (order.payment_status !== undefined) {
        updates.payment_status = body.payment_status;
      } else if (order.payment_channel !== undefined) {
        updates.payment_channel = body.payment_status;
      } else {
        // Fallback: update both
        updates.payment_status = body.payment_status;
        updates.payment_channel = body.payment_status;
      }

      // If marking as paid, update total_paid to match bouquet_price
      if (body.payment_status === "PAID") {
        updates.total_paid = order.bouquet_price;
        updates.remaining_amount = 0;
      }
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    console.log("Updates to apply:", updates);

    // Update the order using Supabase
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update status error:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to update order status", error: updateError.message },
        { status: 500 }
      );
    }

    console.log("Updated order:", updatedOrder);

    // Create log entry if status changed
    if (body.status || body.payment_status) {
      const previousStatus = body.status ? oldStatus : oldPaymentStatus;
      const newStatus = body.status ? body.status : body.payment_status;

      const { error: logError } = await supabase
        .from("order_logs")
        .insert({
          order_id: parseInt(id),
          admin_id: null,
          previous_status: previousStatus,
          new_status: newStatus,
          notes: body.notes || `Status changed via admin panel`,
          created_at: new Date().toISOString(),
        });

      if (logError) {
        console.warn("Failed to create order log:", logError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  return PUT(request, { params });
}
