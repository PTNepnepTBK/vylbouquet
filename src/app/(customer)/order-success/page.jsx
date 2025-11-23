"use client";

import Link from 'next/link';
import NavBar from '../../../components/ui/NavBar';
import Footer from '../../../components/ui/Footer';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('order_id');
  const orderNumberParam = searchParams.get('order_number');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('62882002048431'); // Default fallback
  const [settings, setSettings] = useState(null); // Store full settings object

  // Fetch WhatsApp number and settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        console.log('Settings API response:', data);
        
        if (data.success && data.data) {
          setSettings(data.data); // Store full settings
          
          // Extract WhatsApp number
          const waNumber = data.data?.whatsapp_number?.value || '62882002048431';
          const cleanNumber = waNumber.replace(/\D/g, '');
          
          console.log('WhatsApp number from settings:', waNumber);
          console.log('Cleaned WhatsApp number:', cleanNumber);
          
          setWhatsappNumber(cleanNumber);
        }
      } catch (error) {
        console.error('Failed to fetch WhatsApp settings:', error);
        console.warn('Using fallback WhatsApp number');
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      setUsedFallback(false);

      // Determine identifier preference: order_number (query) -> order_id (query) -> lastOrderId -> lastOrder.order_number
      let identifier = orderNumberParam || orderIdParam || null;

      try {
        if (!identifier) {
          try {
            const savedId = localStorage.getItem('lastOrderId');
            if (savedId) identifier = savedId;
          } catch (err) {
            console.warn('Could not read lastOrderId', err);
          }
        }

        if (!identifier) {
          try {
            const raw = localStorage.getItem('lastOrder');
            if (raw) {
              const local = JSON.parse(raw);
              if (local?.order_number) identifier = local.order_number;
            }
          } catch (err) {
            console.warn('Could not read lastOrder', err);
          }
        }

        if (!identifier) {
          setError('Nomor order tidak ditemukan.');
          setLoading(false);
          return;
        }

        // Build API URL
        let url = '';
        if (/^\d+$/.test(identifier)) {
          url = `/api/orders/${identifier}`;
        } else {
          url = `/api/orders?order_number=${encodeURIComponent(identifier)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
          let result = data.data || data;
          if (Array.isArray(result) && result.length > 0) result = result[0];
          if (result && Object.keys(result).length > 0) {
            setOrder(result);
            // Clear local temporary storage to avoid reuse
            try { localStorage.removeItem('lastOrder'); localStorage.removeItem('lastOrderId'); } catch (e) {}
            setLoading(false);
            return;
          }
        }

        // Fallback: try lastOrder object
        try {
          const raw = localStorage.getItem('lastOrder');
          if (raw) {
            const local = JSON.parse(raw);
            setOrder(local);
            setUsedFallback(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Local fallback read failed', err);
        }

        throw new Error(data?.message || 'Gagal mengambil data pesanan');
      } catch (err) {
        console.error(err);
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderIdParam, orderNumberParam]);

  const formatPrice = (price) => {
    if (price == null) return 'Rp ...';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  // API returns: bouquet_price, total_paid, remaining_amount, dp_amount, payment_type
  const total = order?.bouquet_price || order?.total_price || order?.bouquets?.price || 0;
  const paid = order?.total_paid || 0;
  const remaining = order?.remaining_amount || 0;
  
  // Untuk pesanan baru yang belum dikonfirmasi (paid = 0):
  // - Jika DP: tampilkan jumlah DP yang harus dibayar
  // - Jika FULL: tampilkan total harga
  let amountToPay = paid; // Default gunakan total_paid dari database
  
  if (paid === 0) {
    // Pesanan baru, belum bayar
    if (order?.payment_type === 'DP') {
      amountToPay = order?.dp_amount || (total * 0.3); // DP 30%
    } else if (order?.payment_type === 'FULL') {
      amountToPay = total; // Lunas penuh
    }
  }

  // Debug logging
  useEffect(() => {
    if (order) {
      console.log('Order data:', order);
      console.log('Payment Type:', order?.payment_type);
      console.log('DP Amount:', order?.dp_amount);
      console.log('Total:', total, 'Paid:', paid, 'Amount to Pay:', amountToPay, 'Remaining:', remaining);
    }
    if (settings) {
      console.log('Settings:', settings);
      console.log('WhatsApp Number:', whatsappNumber);
    }
  }, [order, settings, total, paid, remaining, whatsappNumber, amountToPay]);

  let whatsappUrl = '';
  
  if (order && settings) {
    try {
      const { formatOrderWhatsAppMessage } = require('../../../lib/whatsapp');
      
      console.log('=== Generating WhatsApp URL ===');
      console.log('Order data:', order);
      console.log('Settings data:', settings);
      console.log('WhatsApp Number:', whatsappNumber);
      
      // Pass both order AND settings to format the complete message
      const whatsappMessage = formatOrderWhatsAppMessage(order, settings);
      
      console.log('Message generated:');
      console.log('- Length:', whatsappMessage.length);
      console.log('- First 300 chars:', whatsappMessage.substring(0, 300));
      console.log('- Full message:', whatsappMessage);
      
      // Build URL
      whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      
      console.log('WhatsApp URL:');
      console.log('- Full URL length:', whatsappUrl.length);
      console.log('- First 200 chars:', whatsappUrl.substring(0, 200));
      
      // Verify URL is valid
      if (whatsappUrl.includes('undefined') || whatsappUrl.includes('null')) {
        console.error('⚠️ URL contains undefined/null values!');
      } else {
        console.log('✅ WhatsApp URL generated successfully');
      }
    } catch (error) {
      console.error('❌ Error generating WhatsApp message:', error);
    }
  } else {
    console.warn('⚠️ Cannot generate WhatsApp URL:', { hasOrder: !!order, hasSettings: !!settings });
  }

  return (
    <div className="min-h-screen pb-12 my-12 font-serif">
      <div className="relative z-20">
        <NavBar />
      </div>

      <main className="max-w-3xl mx-auto px-6 pt-20">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Pesanan Berhasil!</h1>
          <p className="text-amber-700 mb-6">Pesanan Anda telah kami terima dan sedang diproses</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Memuat detail pesanan...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <section className="bg-white rounded-xl shadow p-6 border border-pink-50 mb-6">
              <h2 className="font-semibold mb-4">Detail Pesanan</h2>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">ID Pesanan</div>
                  <div className="font-medium">{order?.order_number || order?.id || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Tanggal Order</div>
                  <div className="font-medium">{order?.created_at ? new Date(order.created_at).toLocaleDateString() : (order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-')}</div>
                </div>

                <div className="col-span-2 border-t pt-4">
                  <div className="text-xs text-gray-500">Nama Pembeli</div>
                  <div className="font-medium">{order?.customer_name || order?.name || '-'}</div>
                </div>

                <div className="col-span-2 mt-3">
                  <div className="text-xs text-gray-500">Buket yang Dipesan</div>
                  <div className="font-semibold">{order?.bouquets?.name || order?.bouquet?.name || order?.bouquet_name || '-'}</div>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-gray-500">Tanggal Ambil</div>
                  <div className="font-medium">{order?.pickup_date || order?.pickupDate || '-'}</div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-500">Jam Ambil</div>
                  <div className="font-medium">{order?.pickup_time || order?.pickupTime || '-'}</div>
                </div>

                <div className="col-span-2 mt-3">
                  <div className="text-xs text-gray-500">Pesan Kartu Ucapan</div>
                  <div className="italic text-gray-600">{order?.card_message || order?.message || '-'}</div>
                </div>
              </div>

              <div className="mt-4 bg-pink-50 border-t border-pink-100 rounded-b-md p-4">
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span>Total Harga:</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 mb-1">
                  <span>{paid === 0 ? 'Yang Harus Dibayar:' : 'Dibayar:'}</span>
                  <span className="font-semibold">{formatPrice(amountToPay)}</span>
                </div>
                <div className="flex justify-between text-sm text-rose-500">
                  <span>Sisa:</span>
                  <span className="font-semibold">{formatPrice(remaining)}</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow p-6 border border-pink-50 mb-6">
              <h3 className="font-semibold mb-3">Langkah Selanjutnya</h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 font-semibold">1</div>
                  <div>Admin akan memeriksa bukti transfer Anda</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 font-semibold">2</div>
                  <div>Anda akan menerima konfirmasi melalui WhatsApp</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 font-semibold">3</div>
                  <div>Buket akan diproses sesuai jadwal pengambilan</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 font-semibold">4</div>
                  <div>Ambil buket sesuai tanggal dan waktu yang dipilih</div>
                </li>
              </ol>
            </section>

            <div className="flex gap-4">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noreferrer" 
                onClick={(e) => {
                  console.log('🔍 WhatsApp button clicked!');
                  console.log('WhatsApp URL:', whatsappUrl);
                  console.log('URL length:', whatsappUrl.length);
                  
                  if (!whatsappUrl || whatsappUrl === '' || whatsappUrl === '#') {
                    e.preventDefault();
                    alert('⚠️ WhatsApp URL belum siap. Silakan tunggu sebentar dan coba lagi.');
                    return;
                  }
                  
                  console.log('✅ Opening WhatsApp...');
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.478A11.916 11.916 0 0012 .5C5.649.5.999 5.149.999 11.5c0 2.026.546 3.91 1.583 5.568L.5 23.5l6.662-1.74A11.937 11.937 0 0012 23.5c6.351 0 11.001-4.649 11.001-11.001 0-3.087-1.205-5.91-2.481-7.021z"/></svg>
                Hubungi via WhatsApp
              </a>

              <Link href="/" className="flex-1 inline-flex items-center justify-center gap-2 border border-pink-300 text-pink-500 font-semibold py-3 rounded-lg">
                Kembali ke Beranda
              </Link>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">♡ Terima kasih telah mempercayai vyl.bouquet</p>
          </>
        )}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
