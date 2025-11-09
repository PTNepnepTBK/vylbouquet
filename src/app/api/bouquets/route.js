import { NextResponse } from "next/server";
import { Op } from "sequelize";

// GET - Ambil semua bouquets
export async function GET(request) {
  try {
    // Load Bouquet model
    const Bouquet = (await import("../../../models/Bouquet")).default;

    // Get query params untuk filter
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("is_active");
    const q = searchParams.get("q");

    const where = {};

    // Add active status filter
    if (isActive !== null) {
      where.is_active = isActive === "true";
    }

    // Add search filter
    if (q && q.trim() !== "") {
      const searchTerm = `%${q.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { description: { [Op.like]: searchTerm } },
      ];
    }

    const bouquets = await Bouquet.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    return NextResponse.json({
      success: true,
      data: bouquets,
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

    // Load Bouquet model
    const Bouquet = (await import("../../../models/Bouquet")).default;

    const bouquet = await Bouquet.create({
      name,
      price,
      description: description || null,
      image_url: image_url || null,
      is_active: is_active !== undefined ? is_active : true,
    });

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
