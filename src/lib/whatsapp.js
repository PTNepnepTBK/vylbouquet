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

export function formatOrderWhatsAppMessage(order, settings = {}) {
  if (!order) {
    console.error('❌ Order is null or undefined');
    return '';
  }

  // Format tanggal ringkas
  const pickupDate = new Date(order.pickup_date);
  const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const formattedDate = pickupDate.toLocaleDateString('id-ID', dateOptions);
  
  // Format harga
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // Build payment methods from settings
  const bcaNumber = settings?.bank_bca?.value || '4373021906';
  const seabankNumber = settings?.bank_seabank?.value || '901081198646';
  const shopeepayNumber = settings?.ewallet_shopeepay?.value || '0882002048431';

  // Get bouquet name
  const bouquetName = order.bouquets?.name || order.bouquet?.name || 'Custom';

  // VERSI RINGKAS - Fokus ke informasi penting saja
  let message = `*INVOICE VYL.BOUQUET*\n\n`;
  message += `No: ${order.order_number}\n`;
  message += `Nama: ${order.customer_name}\n`;
  message += `Buket: ${bouquetName}\n`;
  message += `Harga: Rp ${formatPrice(order.bouquet_price)}\n\n`;

  if (order.card_message) {
    message += `Kartu: "${order.card_message}"\n\n`;
  }

  message += `*AMBIL:*\n`;
  message += `${formattedDate}, ${order.pickup_time}\n\n`;

  message += `*BAYAR:* ${order.payment_type === 'DP' ? `DP Rp ${formatPrice(order.dp_amount)}` : `Lunas Rp ${formatPrice(order.bouquet_price)}`}\n`;
  message += `Via ${order.payment_method}\n\n`;

  message += `*REKENING:*\n`;
  message += `BCA: ${bcaNumber}\n`;
  message += `SeaBank: ${seabankNumber}\n`;
  message += `ShopeePay: ${shopeepayNumber}\n`;
  message += `_(TF ShopeePay dari bank +1k)_\n\n`;

  message += `*CATATAN:*\n`;
  message += `- DP 30% dulu\n`;
  message += `- Keep stlh DP masuk\n`;
  message += `- Sen-Sab 08-18, Minggu 10-15\n\n`;

  message += `_Kirim bukti TF untuk konfirmasi_\n`;
  message += `Terima kasih! 🌸`;

  console.log('✅ WhatsApp message formatted successfully');
  return message;
}
