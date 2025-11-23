import { NextResponse } from "next/server";
import { Order, Bouquet, OrderImage } from "@/models";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET - Read all orders (Protected dengan JWT)
export async function GET(request) {
  try {
    // Cek JWT token dari cookie
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Token required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get query parameters untuk filter
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("payment_status");
    const pickupDateFrom = searchParams.get("pickup_date_from");
    const pickupDateTo = searchParams.get("pickup_date_to");
    const pickupTimeFrom = searchParams.get("pickup_time_from");
    const pickupTimeTo = searchParams.get("pickup_time_to");
    const searchQuery = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;

    // Build where clause
    const whereClause = {};
    if (status) {
      whereClause.order_status = status;
    }
    if (paymentStatus) {
      whereClause.payment_status = paymentStatus;
    }
    // Note: Range filters for pickup_date/time removed (Supabase Client needs custom query)
    // TODO: Implement range filters if needed

    // Fetch orders dengan relasi
    const orders = await Order.findAll({
      where: whereClause,
      include: [
        { model: 'Bouquet' },
        { model: 'OrderImage' }
      ],
      order: [["created_at", "ASC"]],
    });

    // Apply search filter in memory (simple approach)
    let filteredOrders = orders;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredOrders = orders.filter(order => 
        order.customer_name?.toLowerCase().includes(query) ||
        order.order_number?.toLowerCase().includes(query)
      );
    }

    // Apply pagination in memory
    const total = filteredOrders.length;
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
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

    // Cek bouquet exists
    const bouquet = await Bouquet.findByPk(body.bouquet_id);
    if (!bouquet) {
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
    // Count orders today (simple count without date filter)
    const allOrders = await Order.findAll({});
    const todayOrders = allOrders.filter(o => {
      const orderDate = new Date(o.created_at).toISOString().slice(0, 10);
      return orderDate === now.toISOString().slice(0, 10);
    });
    const count = todayOrders.length;
    const orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, "0")}`;

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

    // Create order
    const order = await Order.create({
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
    });

    // Simpan foto desired bouquet (bisa lebih dari 1)
    if (
      body.desired_bouquet_images &&
      Array.isArray(body.desired_bouquet_images)
    ) {
      for (let i = 0; i < body.desired_bouquet_images.length; i++) {
        await OrderImage.create({
          order_id: order.id,
          image_url: body.desired_bouquet_images[i],
          image_type: "DESIRED_BOUQUET",
          display_order: i + 1,
        });
      }
    }

    // Simpan foto referensi (bisa lebih dari 1)
    if (body.reference_images && Array.isArray(body.reference_images)) {
      for (let i = 0; i < body.reference_images.length; i++) {
        await OrderImage.create({
          order_id: order.id,
          image_url: body.reference_images[i],
          image_type: "REFERENCE",
          display_order: i + 1,
        });
      }
    }

    // Simpan bukti transfer (bisa lebih dari 1)
    if (body.payment_proofs && Array.isArray(body.payment_proofs)) {
      for (let i = 0; i < body.payment_proofs.length; i++) {
        await OrderImage.create({
          order_id: order.id,
          image_url: body.payment_proofs[i],
          image_type: "PAYMENT_PROOF",
          display_order: i + 1,
        });
      }
    }

    // Fetch order lengkap dengan relasi
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        { model: 'Bouquet' },
        { model: 'OrderImage' }
      ],
    });

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
