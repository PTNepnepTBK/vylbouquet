'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bouquetIdParam = searchParams.get('bouquet_id');

  const [bouquets, setBouquets] = useState([]);
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

  useEffect(() => {
    fetchBouquets();
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
    setFormData({ ...formData, bouquet_id: bouquetId });
    const bouquet = bouquets.find(b => b.id === parseInt(bouquetId));
    setSelectedBouquet(bouquet);
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'reference') {
      setReferenceFiles(files);
    } else {
      setPaymentFiles(files);
    }
  };

  const uploadFiles = async (files, type) => {
    if (files.length === 0) return [];

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('type', 'orders');

    try {
      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        return data.urls;
      }
      throw new Error(data.message);
    } catch (error) {
      alert(`Error uploading ${type} images: ${error.message}`);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload reference images
      const refUrls = await uploadFiles(referenceFiles, 'reference');
      
      // Upload payment proof images
      const payUrls = await uploadFiles(paymentFiles, 'payment');

      // Create order
      const orderData = {
        ...formData,
        reference_images: refUrls,
        payment_proofs: payUrls,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Pesanan berhasil dibuat!\nNomor Order: ${data.data.order_number}`);
        router.push('/order-success');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
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

  const calculatePayment = () => {
    if (!selectedBouquet) return { dp: 0, remaining: 0, total: 0 };
    const total = parseFloat(selectedBouquet.price);
    const dp = formData.payment_type === 'DP' ? total * 0.5 : total;
    const remaining = formData.payment_type === 'DP' ? total - dp : 0;
    return { dp, remaining, total };
  };

  const payment = calculatePayment();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Form Pemesanan</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          {/* Pilih Buket */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Pilih Buket *</label>
            <select
              required
              value={formData.bouquet_id}
              onChange={handleBouquetChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Pilih Buket --</option>
              {bouquets.map(bouquet => (
                <option key={bouquet.id} value={bouquet.id}>
                  {bouquet.name} - {formatPrice(bouquet.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Buket */}
          {selectedBouquet && (
            <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex gap-4">
                {selectedBouquet.image_url && (
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image src={selectedBouquet.image_url} alt={selectedBouquet.name} fill className="object-cover rounded" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{selectedBouquet.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{selectedBouquet.description}</p>
                  <p className="font-bold text-primary text-xl">{formatPrice(selectedBouquet.price)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nama Pembeli */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Nama Pembeli *</label>
            <input
              type="text"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Nama lengkap pembeli"
            />
          </div>

          {/* Tanggal & Jam Ambil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Tanggal Ambil *</label>
              <input
                type="date"
                required
                value={formData.pickup_date}
                onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Jam Ambil *</label>
              <input
                type="time"
                required
                value={formData.pickup_time}
                onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Pesan Kartu Ucapan */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Pesan untuk Kartu Ucapan</label>
            <textarea
              value={formData.card_message}
              onChange={(e) => setFormData({ ...formData, card_message: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="Tulis pesan yang akan ditampilkan di kartu ucapan..."
            />
          </div>

          {/* Permintaan Tambahan */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Permintaan Tambahan</label>
            <textarea
              value={formData.additional_request}
              onChange={(e) => setFormData({ ...formData, additional_request: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="Contoh: Tambahkan bunga mawar merah ekstra, bungkus dengan pita gold..."
            />
          </div>

          {/* Upload Foto Referensi */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Upload Foto Referensi (Max 5 foto)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'reference')}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Upload foto referensi buket yang Anda inginkan (opsional)</p>
            {referenceFiles.length > 0 && (
              <p className="text-sm text-green-600 mt-2">✓ {referenceFiles.length} foto terpilih</p>
            )}
          </div>

          {/* Tipe Pembayaran */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Tipe Pembayaran *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="DP"
                  checked={formData.payment_type === 'DP'}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                  className="mr-2"
                />
                <span>DP 50%</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="FULL"
                  checked={formData.payment_type === 'FULL'}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                  className="mr-2"
                />
                <span>Lunas</span>
              </label>
            </div>
          </div>

          {/* Ringkasan Pembayaran */}
          {selectedBouquet && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold mb-2">Ringkasan Pembayaran:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Harga Buket:</span>
                  <span className="font-semibold">{formatPrice(payment.total)}</span>
                </div>
                {formData.payment_type === 'DP' && (
                  <>
                    <div className="flex justify-between text-green-700">
                      <span>DP (50%):</span>
                      <span className="font-semibold">{formatPrice(payment.dp)}</span>
                    </div>
                    <div className="flex justify-between text-orange-700">
                      <span>Sisa:</span>
                      <span className="font-semibold">{formatPrice(payment.remaining)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Yang Harus Dibayar Sekarang:</span>
                  <span className="text-primary">{formatPrice(formData.payment_type === 'DP' ? payment.dp : payment.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Data Pengirim */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Nama Pengirim Transfer *</label>
            <input
              type="text"
              required
              value={formData.sender_name}
              onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Nama pengirim transfer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Nomor Rekening Pengirim</label>
              <input
                type="text"
                value={formData.sender_account_number}
                onChange={(e) => setFormData({ ...formData, sender_account_number: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">No. WhatsApp</label>
              <input
                type="tel"
                value={formData.sender_phone}
                onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="08123456789"
              />
            </div>
          </div>

          {/* Upload Bukti Transfer */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Upload Bukti Transfer (Max 5 foto)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'payment')}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Upload foto/screenshot bukti transfer pembayaran</p>
            {paymentFiles.length > 0 && (
              <p className="text-sm text-green-600 mt-2">✓ {paymentFiles.length} foto terpilih</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-primary hover:bg-pink-600 text-white font-bold py-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Mengupload gambar...' : loading ? 'Memproses pesanan...' : 'Buat Pesanan'}
          </button>
        </form>
      </div>
    </div>
  );
}
