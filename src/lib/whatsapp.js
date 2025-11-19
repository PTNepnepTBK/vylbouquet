// WhatsApp API integration

export async function sendWhatsAppMessage(phoneNumber, message) {
  // TODO: Implement WhatsApp API integration
  // Bisa pakai WhatsApp Business API atau service seperti Fonnte, Wablas, dll

  console.log("Sending WhatsApp to:", phoneNumber);
  console.log("Message:", message);

  return {
    success: true,
    message: "WhatsApp sent",
  };
}

export function formatOrderWhatsAppMessage(order) {
  const total = parseFloat(order.bouquet_price || order.total_price || 0);

  let message = `🌸 *PESANAN BARU* 🌸\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `📋 *DETAIL PESANAN*\n`;
  message += `🔖 *No. Order:* ${order.order_number}\n`;
  message += `👤 *Nama:* ${order.customer_name}\n`;
  message += `💐 *Buket:* ${order.bouquet_name}\n`;
  message += `💰 *Harga:* Rp ${total.toLocaleString("id-ID")}\n`;
  message += `💳 *Jenis Pembayaran:* ${
    order.payment_type === "DP" ? "DP 30%" : "Lunas"
  }\n\n`;

  message += `📅 *JADWAL PENGAMBILAN*\n`;
  message += `📆 *Tanggal Ambil:* ${order.pickup_date}\n`;
  message += `🕐 *Jam Ambil:* ${order.pickup_time}\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🙏 _Terima kasih telah memesan di vyl.bouquet!_\n`;
  message += `_Kami akan segera memproses pesanan Anda_ 💐✨`;

  return message;
}

export function generateWhatsAppUrl(phoneNumber, order) {
  const message = formatOrderWhatsAppMessage(order);
  // Remove leading zeros or + from phone number and ensure it starts with country code
  let cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.substring(1);
  } else if (!cleanNumber.startsWith("62")) {
    cleanNumber = "62" + cleanNumber;
  }

  // Use encodeURIComponent for proper WhatsApp encoding
  // WhatsApp akan otomatis decode emoji dengan benar
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
