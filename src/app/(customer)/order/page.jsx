"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import NavBar from '../../../components/ui/NavBar';

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bouquetIdParam = searchParams.get('bouquet_id');

  const [bouquets, setBouquets] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedBouquet, setSelectedBouquet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    bouquet_id: bouquetIdParam || '',
    pickup_date: '',
    pickup_time: '',
    card_message: '',
    additional_request: '',
    payment_type: 'DP',
    sender_name: '',
    sender_account_number: '',
    sender_phone: '',
  });

  const [referenceFiles, setReferenceFiles] = useState([]);
  const [paymentFiles, setPaymentFiles] = useState([]);
  const [desiredBouquetFiles, setDesiredBouquetFiles] = useState([]);

  useEffect(() => {
    // Load bouquets and settings in parallel for faster startup
    const loadInitial = async () => {
      try {
        const [bouqRes, setRes] = await Promise.all([fetch('/api/bouquets'), fetch('/api/settings')]);
        const bouqJson = await bouqRes.json().catch(() => null);
        const setJson = await setRes.json().catch(() => null);

        if (bouqJson && bouqJson.success) setBouquets(bouqJson.data.filter(b => b.is_active));
        if (setJson && setJson.success) setSettings(setJson.data || {});
      } catch (err) {
        console.warn('Initial load failed', err);
      }
    };

    loadInitial();
  }, []);

  useEffect(() => {
    if (bouquetIdParam && bouquets.length > 0) {
      const bouquet = bouquets.find(b => b.id === parseInt(bouquetIdParam));
      if (bouquet) {
        setSelectedBouquet(bouquet);
        setFormData(prev => ({ ...prev, bouquet_id: bouquetIdParam }));
      }
    }
  }, [bouquetIdParam, bouquets]);

  const fetchBouquets = async () => {
    try {
      const response = await fetch('/api/bouquets');
      const data = await response.json();
      if (data.success) {
        setBouquets(data.data.filter(b => b.is_active));
      }
    } catch (error) {
      console.error('Error fetching bouquets:', error);
    }
  };

  const handleBouquetChange = (e) => {
    const bouquetId = e.target.value;
    setFormData(prev => ({ ...prev, bouquet_id: bouquetId }));
    const bouquet = bouquets.find(b => b.id === parseInt(bouquetId));
    setSelectedBouquet(bouquet);
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files || []);
    if (type === 'reference') setReferenceFiles(files);
    else if (type === 'payment') setPaymentFiles(files);
    else if (type === 'desired') setDesiredBouquetFiles(files);
  };

  const uploadFiles = async (files, type) => {
    if (!files || files.length === 0) return [];

    setUploading(true);
    const fd = new FormData();
    files.forEach(file => fd.append('files', file));
    fd.append('type', 'orders');

    try {
      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: fd,
      });
      const data = await response.json().catch(() => null);
      if (data && data.success) return data.urls || [];
      throw new Error((data && data.message) || 'Upload failed');
    } catch (error) {
      alert(`Error uploading ${type} images: ${error?.message || error}`);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentFiles || paymentFiles.length === 0) {
      alert('Harap upload bukti transfer/DP terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      // Run uploads in parallel
      const [desiredUrls, refUrls, payUrls] = await Promise.all([
        uploadFiles(desiredBouquetFiles, 'desired'),
        uploadFiles(referenceFiles, 'reference'),
        uploadFiles(paymentFiles, 'payment'),
      ]);

      const orderData = {
        ...formData,
        desired_bouquet_images: desiredUrls,
        reference_images: refUrls,
        payment_proofs: payUrls,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json().catch(() => null);
      if (!data) throw new Error('Response tidak valid');
      if (!data.success) throw new Error(data.message || 'Gagal membuat pesanan');

      const saved = data.data || data;
      try {
        localStorage.setItem('lastOrder', JSON.stringify(saved));
        const idKey = saved?.order_number || saved?.id || saved?.order_id || '';
        if (idKey) localStorage.setItem('lastOrderId', String(idKey));
      } catch (err) {
        console.warn('Could not save lastOrder', err);
      }

      alert(`Pesanan berhasil dibuat!\nNomor Order: ${saved.order_number || saved.id || ''}`);
      router.push('/order-success');
    } catch (error) {
      alert(`Error: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const payment = useMemo(() => {
    if (!selectedBouquet) return { dp: 0, remaining: 0, total: 0 };
    const total = parseFloat(selectedBouquet.price) || 0;
    const dp = formData.payment_type === 'DP' ? total * 0.3 : total;
    const remaining = formData.payment_type === 'DP' ? total - dp : 0;
    return { dp, remaining, total };
  }, [selectedBouquet, formData.payment_type]);

  return (
    <div className="min-h-screen py-12 px-4 font-serif">
      <div className="relative z-20">
        <NavBar />
      </div>

      <div className="max-w-6xl mx-auto pt-14">
        <h1 className="text-4xl font-serif font-bold text-center mb-2">Form Pemesanan</h1>
        <p className="text-center text-amber-700 mb-8">Lengkapi data pesanan Anda</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form (span 2 columns on large) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 lg:p-8 border border-pink-100">
              <div className="text-lg font-semibold mb-4">Detail Pesanan</div>

              {/* Pilih Buket */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama Pembeli *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload Foto Buket yang Diinginkan</label>
                <p className="text-xs text-gray-500 mb-2">Upload foto contoh buket yang Anda inginkan (opsional)</p>
                <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'desired')} className="w-full px-3 py-2 border border-dashed border-pink-200 rounded-md" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Pilih Buket *</label>
                <select
                  required
                  value={formData.bouquet_id}
                  onChange={handleBouquetChange}
                  className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200"
                >
                  <option value="">Pilih buket yang Anda inginkan</option>
                  {bouquets.map(bouquet => (
                    <option key={bouquet.id} value={bouquet.id}>{bouquet.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tanggal Ambil *</label>
                  <input type="date" required value={formData.pickup_date} onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Jam Ambil *</label>
                  <input type="time" required value={formData.pickup_time} onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Pesan Untuk Kartu Ucapan</label>
                <textarea value={formData.card_message} onChange={(e) => setFormData({ ...formData, card_message: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" rows={3} placeholder="Tulis pesan untuk kartu ucapan" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Foto Request Tambahan (Opsional)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'reference')} className="w-full px-3 py-2 border border-dashed border-pink-200 rounded-md" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Request Tambahan (Opsional)</label>
                <input type="text" value={formData.additional_request} onChange={(e) => setFormData({ ...formData, additional_request: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" placeholder="Jelaskan request khusus untuk buket Anda" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tipe Pembayaran *</label>
                <select value={formData.payment_type} onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200">
                  <option value="DP">Bayar DP 30%</option>
                  <option value="FULL">Lunas</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama Pengirim / No Rekening *</label>
                <input type="text" required value={formData.sender_name} onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" placeholder="Nama pengirim" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nomor WhatsApp *</label>
                <input type="tel" required value={formData.sender_phone} onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" placeholder="08xxxxxxxxxx" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload Bukti Transfer / DP *</label>
                <input type="file" accept="image/*" multiple required onChange={(e) => handleFileChange(e, 'payment')} className="w-full px-3 py-2 border border-dashed border-pink-200 rounded-md" />
              </div>

              <button type="submit" disabled={loading || uploading} className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 rounded-md mt-4">
                {uploading ? 'Mengupload gambar...' : loading ? 'Memproses pesanan...' : 'Kirim Pesanan Anda'}
              </button>
            </form>
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-6">
            <div className="p-4 bg-pink-100 rounded-lg border border-pink-200">
              <h3 className="font-semibold mb-2">Ringkasan Pembayaran</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span>Harga Buket</span><span>{selectedBouquet ? formatPrice(payment.total) : 'Rp ...'}</span></div>
                {formData.payment_type === 'DP' && (
                  <>
                    <div className="flex justify-between text-sm"><span>DP (30%)</span><span>{selectedBouquet ? formatPrice(payment.dp) : 'Rp ...'}</span></div>
                    <div className="flex justify-between text-sm"><span>Sisa</span><span>{selectedBouquet ? formatPrice(payment.remaining) : 'Rp ...'}</span></div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-pink-200">
              <h3 className="font-semibold mb-2">Metode Pembayaran</h3>
              <div className="text-sm space-y-2">
                <div>
                  <strong>BCA:</strong> {settings?.bank_bca || '—'}{settings?.bank_bca_name ? ` a.n ${settings.bank_bca_name}` : ''}
                </div>
                <div>
                  <strong>SeaBank:</strong> {settings?.bank_seabank || '—'}{settings?.bank_seabank_name ? ` a.n ${settings.bank_seabank_name}` : ''}
                </div>
                <div>
                  <strong>ShopePay:</strong> {settings?.ewallet_shopeepay || '—'}{settings?.ewallet_shopeepay_name ? ` a.n ${settings.ewallet_shopeepay_name}` : ''}
                </div>
                <p className="text-xs text-pink-400 mt-2">Transfer dari bank dikenakan biaya admin +Rp 1.000</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-pink-200">
              <h3 className="font-semibold mb-2">Ketentuan Pemesanan</h3>
              <ul className="text-sm list-disc pl-5 space-y-2 text-gray-600">
                <li>DP minimal 30% dari total harga untuk mengunci pesanan</li>
                <li>Pesanan dianggap diterima setelah DP dikonfirmasi</li>
                <li>Pelunasan bisa dilakukan saat ambil atau H-1</li>
                <li>Jika diambil orang lain, wajib tunjukkan form order dan foto buket</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
