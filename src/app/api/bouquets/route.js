import { NextResponse } from "next/server";
import { verifyAuth } from "../../../lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Ambil semua bouquets
export async function GET(request) {
  try {
    // Get query params untuk filter dan pagination
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("is_active");
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 9;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from("bouquets").select("*", { count: "exact" });

    // Add active status filter
    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true");
    }

    // Add search filter
    if (q && q.trim() !== "") {
      const searchTerm = `%${q.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    // Apply pagination and ordering
    const { data: bouquets, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get bouquets error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch bouquets" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: bouquets || [],
      total: count || 0,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Get bouquets error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Tambah bouquet baru
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, price, description, image_url, is_active } = body;

    // Validasi
    if (!name || !price) {
      return NextResponse.json(
        { success: false, message: "Name and price are required" },
        { status: 400 }
      );
    }

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid price" },
        { status: 400 }
      );
    }

    // Create bouquet using Supabase
    const { data: bouquet, error: createError } = await supabase
      .from("bouquets")
      .insert({
        name,
        price,
        description: description || null,
        image_url: image_url || null,
        is_active: is_active !== undefined ? is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Create bouquet error:", createError);
      return NextResponse.json(
        { success: false, message: "Failed to create bouquet" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bouquet created successfully",
      data: bouquet,
    });
  } catch (error) {
    console.error("Create bouquet error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
