import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Ambil bouquet by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get bouquet using Supabase
    const { data: bouquet, error } = await supabase
      .from("bouquets")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !bouquet) {
      return NextResponse.json(
        { success: false, message: "Bouquet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bouquet,
    });
  } catch (error) {
    console.error("Get bouquet error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update bouquet
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
    const { name, price, description, image_url, is_active } = body;

    // Validasi
    if (name && name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Name cannot be empty" },
        { status: 400 }
      );
    }

    if (price !== undefined && (isNaN(price) || price < 0)) {
      return NextResponse.json(
        { success: false, message: "Invalid price" },
        { status: 400 }
      );
    }

    // Check if bouquet exists
    const { data: existingBouquet, error: fetchError } = await supabase
      .from("bouquets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingBouquet) {
      return NextResponse.json(
        { success: false, message: "Bouquet not found" },
        { status: 404 }
      );
    }

    // Build updates object
    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;
    if (image_url !== undefined) updates.image_url = image_url;
    if (is_active !== undefined) updates.is_active = is_active;

    // Update bouquet using Supabase
    const { data: bouquet, error: updateError } = await supabase
      .from("bouquets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update bouquet error:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to update bouquet" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bouquet updated successfully",
      data: bouquet,
    });
  } catch (error) {
    console.error("Update bouquet error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Hapus bouquet
export async function DELETE(request, { params }) {
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

    console.log("Delete bouquet request:", { id });

    if (!supabase) {
      console.error("Supabase client not initialized");
      return NextResponse.json(
        { success: false, message: "Database connection error" },
        { status: 500 }
      );
    }

    // Delete bouquet using Supabase (will cascade delete if configured)
    const { error: deleteError, count } = await supabase
      .from("bouquets")
      .delete({ count: 'exact' })
      .eq("id", id);

    if (deleteError) {
      console.error("Delete bouquet error:", deleteError);
      
      // Check if it's a foreign key constraint error
      if (deleteError.code === '23503') {
        return NextResponse.json(
          { success: false, message: "Tidak dapat menghapus bouquet yang masih memiliki pesanan aktif" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: "Failed to delete bouquet", error: deleteError.message },
        { status: 500 }
      );
    }

    if (count === 0) {
      return NextResponse.json(
        { success: false, message: "Bouquet not found" },
        { status: 404 }
      );
    }

    console.log("Bouquet deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Bouquet deleted successfully",
    });
  } catch (error) {
    console.error("Delete bouquet error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
