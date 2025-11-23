import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Read all orders (Protected dengan JWT)
export async function GET(request) {
  try {
    // Verify authentication
    const authResult = verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    // Get query parameters untuk filter
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("payment_status");
    const searchQuery = searchParams.get("q");

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("orders")
      .select(`
        *,
        bouquets (
          id,
          name,
          price,
          image_url
        )
      `, { count: "exact" });

    // Apply filters
    if (status && status !== "ALL") {
      // Try both column names for compatibility
      query = query.or(`order_status.eq.${status},status.eq.${status}`);
    }

    if (paymentStatus && paymentStatus !== "ALL") {
      // Try both column names for compatibility
      query = query.or(`payment_status.eq.${paymentStatus},payment_channel.eq.${paymentStatus}`);
    }

    if (searchQuery) {
      query = query.or(`customer_name.ilike.%${searchQuery}%,order_number.ilike.%${searchQuery}%`);
    }

    // Apply pagination and ordering
    const { data: orders, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get orders error:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data orders", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("GET Orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new order (Public - untuk customer)
export async function POST(request) {
  try {
    const body = await request.json();

    // Validasi input required
    const requiredFields = [
      "customer_name",
      "bouquet_id",
      "pickup_date",
      "pickup_time",
      "payment_type",
      "sender_name",
      "payment_method",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validasi tanggal pickup tidak boleh kemarin
    const pickupDate = new Date(body.pickup_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    pickupDate.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal pengambilan tidak boleh di masa lalu",
        },
        { status: 400 }
      );
    }

    // Validasi waktu pickup (jam operasional 08:00 - 18:00)
    const pickupTime = body.pickup_time;
    const [pickupHour, pickupMinute] = pickupTime.split(":").map(Number);

    if (
      pickupHour < 8 ||
      pickupHour > 18 ||
      (pickupHour === 18 && pickupMinute > 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Jam pengambilan harus antara 08:00 - 18:00 WIB",
        },
        { status: 400 }
      );
    }

    // Validasi jika hari ini, harus minimal 1 jam ke depan
    const isToday = pickupDate.getTime() === today.getTime();
    if (isToday) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Calculate minimum allowed time (current + 1 hour)
      const minHour = currentHour + 1;

      if (minHour >= 18) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Waktu operasional hari ini sudah habis. Silakan pilih tanggal besok.",
          },
          { status: 400 }
        );
      }

      if (
        pickupHour < minHour ||
        (pickupHour === minHour && pickupMinute < currentMinute)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Waktu pengambilan harus minimal 1 jam dari sekarang (minimal ${String(
              minHour
            ).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")})`,
          },
          { status: 400 }
        );
      }
    }

    // Cek bouquet exists using Supabase
    const { data: bouquet, error: bouquetError } = await supabase
      .from("bouquets")
      .select("*")
      .eq("id", body.bouquet_id)
      .single();

    if (bouquetError || !bouquet) {
      console.error("Bouquet fetch error:", bouquetError);
      return NextResponse.json(
        { success: false, message: "Bouquet not found" },
        { status: 404 }
      );
    }

    if (!bouquet.is_active) {
      return NextResponse.json(
        { success: false, message: "Bouquet is not available" },
        { status: 400 }
      );
    }

    // Generate order number (format: ORD-YYYYMMDD-XXXX)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    
    // Count orders today using Supabase
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const { count: todayOrderCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString());

    const orderNumber = `ORD-${dateStr}-${String((todayOrderCount || 0) + 1).padStart(4, "0")}`;

    // Hitung payment
    const bouquetPrice = parseFloat(bouquet.price);
    let dpAmount = 0;
    let remainingAmount = 0;
    let totalPaid = 0;
    let paymentStatus = "UNPAID";

    if (body.payment_type === "DP") {
      // DP 30%
      dpAmount = bouquetPrice * 0.3;
      remainingAmount = bouquetPrice - dpAmount;
      totalPaid = 0; // Belum bayar, menunggu konfirmasi
    } else if (body.payment_type === "FULL") {
      dpAmount = 0;
      remainingAmount = 0;
      totalPaid = 0; // Belum bayar, menunggu konfirmasi
    }

    // Create order using Supabase
    const { data: order, error: createError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        bouquet_id: body.bouquet_id,
        customer_name: body.customer_name,
        sender_name: body.sender_name,
        sender_account_number: body.sender_account_number || null,
        sender_phone: body.sender_phone || null,
        bouquet_price: bouquetPrice,
        payment_type: body.payment_type,
        payment_method: body.payment_method,
        dp_amount: dpAmount,
        remaining_amount: remainingAmount,
        total_paid: totalPaid,
        pickup_date: body.pickup_date,
        pickup_time: body.pickup_time,
        additional_request: body.additional_request || null,
        card_message: body.card_message || null,
        order_status: "WAITING_CONFIRMATION",
        payment_status: paymentStatus,
        whatsapp_sent: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Create order error:", createError);
      return NextResponse.json(
        { success: false, message: "Failed to create order", error: createError.message },
        { status: 500 }
      );
    }

    // Simpan foto desired bouquet (bisa lebih dari 1)
    if (
      body.desired_bouquet_images &&
      Array.isArray(body.desired_bouquet_images) &&
      body.desired_bouquet_images.length > 0
    ) {
      const imagesToInsert = body.desired_bouquet_images.map((imageUrl, index) => ({
        order_id: order.id,
        image_url: imageUrl,
        image_type: "DESIRED_BOUQUET",
        display_order: index + 1,
      }));

      const { error: imageError } = await supabase
        .from("order_images")
        .insert(imagesToInsert);

      if (imageError) {
        console.warn("Failed to insert desired bouquet images:", imageError);
      }
    }

    // Simpan foto referensi (bisa lebih dari 1)
    if (body.reference_images && Array.isArray(body.reference_images) && body.reference_images.length > 0) {
      const imagesToInsert = body.reference_images.map((imageUrl, index) => ({
        order_id: order.id,
        image_url: imageUrl,
        image_type: "REFERENCE",
        display_order: index + 1,
      }));

      const { error: imageError } = await supabase
        .from("order_images")
        .insert(imagesToInsert);

      if (imageError) {
        console.warn("Failed to insert reference images:", imageError);
      }
    }

    // Simpan bukti transfer (bisa lebih dari 1)
    if (body.payment_proofs && Array.isArray(body.payment_proofs) && body.payment_proofs.length > 0) {
      const imagesToInsert = body.payment_proofs.map((imageUrl, index) => ({
        order_id: order.id,
        image_url: imageUrl,
        image_type: "PAYMENT_PROOF",
        display_order: index + 1,
      }));

      const { error: imageError } = await supabase
        .from("order_images")
        .insert(imagesToInsert);

      if (imageError) {
        console.warn("Failed to insert payment proof images:", imageError);
      }
    }

    // Fetch order lengkap dengan relasi
    const { data: createdOrder, error: fetchError } = await supabase
      .from("orders")
      .select(`
        *,
        bouquets (
          id,
          name,
          price,
          image_url
        ),
        order_images:order_images (
          id,
          image_url,
          image_type,
          display_order
        )
      `)
      .eq("id", order.id)
      .single();

    if (fetchError) {
      console.warn("Failed to fetch created order with relations:", fetchError);
      // Still return success since order was created
      return NextResponse.json(
        {
          success: true,
          message: "Order created successfully",
          data: order,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
