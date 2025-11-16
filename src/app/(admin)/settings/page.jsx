'use client';

import { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    payment_bca: '',
    payment_bca_desc: '',
    payment_seabank: '',
    payment_seabank_desc: '',
    payment_shopeepay: '',
    payment_shopeepay_desc: '',
    min_dp_percent: '30',
    whatsapp_number: '',
    instagram_handle: '',
  });

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.success) {
        setSettings({
          payment_bca: data.data.payment_bca || '',
          payment_bca_desc: data.data.payment_bca_desc || '',
          payment_seabank: data.data.payment_seabank || '',
          payment_seabank_desc: data.data.payment_seabank_desc || '',
          payment_shopeepay: data.data.payment_shopeepay || '',
          payment_shopeepay_desc: data.data.payment_shopeepay_desc || '',
          min_dp_percent: data.data.min_dp_percent || '30',
          whatsapp_number: data.data.whatsapp_number || '',
          instagram_handle: data.data.instagram_handle || '',
        });
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      alert('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi
    if (!settings.payment_bca && !settings.payment_seabank && !settings.payment_shopeepay) {
      alert('Minimal satu metode pembayaran harus diisi');
      return;
    }

    if (settings.min_dp_percent && (isNaN(settings.min_dp_percent) || settings.min_dp_percent < 0 || settings.min_dp_percent > 100)) {
      alert('Minimal DP harus antara 0-100%');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        alert('Pengaturan berhasil disimpan');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Gagal menyimpan pengaturan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Pembayaran & Ketentuan</h1>
        <p className="text-gray-600 mt-1 text-sm">Kelola informasi pembayaran dan ketentuan pemesanan</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* DP Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan DP</h2>
          
          <div>
            <Input
              label="Persentase Minimal DP (%)"
              name="min_dp_percent"
              type="number"
              value={settings.min_dp_percent}
              onChange={handleChange}
              placeholder="30"
              min="0"
              max="100"
            />
            <p className="text-sm text-gray-500 mt-1">Minimal persentase DP yang harus dibayar customer</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Metode Pembayaran</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Rekening BCA</h3>
              <Input
                label="Nomor Rekening BCA"
                name="payment_bca"
                value={settings.payment_bca}
                onChange={handleChange}
                placeholder="4370321906 a.n Vina Enjelia"
              />
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan BCA (Opsional)</label>
                <textarea
                  name="payment_bca_desc"
                  value={settings.payment_bca_desc}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  rows="2"
                  placeholder="Contoh: Transfer dari bank lain +Rp 1.000 admin"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Rekening SeaBank</h3>
              <Input
                label="Nomor Rekening SeaBank"
                name="payment_seabank"
                value={settings.payment_seabank}
                onChange={handleChange}
                placeholder="901081198646 a.n Vina Enjelia"
              />
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan SeaBank (Opsional)</label>
                <textarea
                  name="payment_seabank_desc"
                  value={settings.payment_seabank_desc}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  rows="2"
                  placeholder="Contoh: Transfer antar bank gratis"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Nomor ShopeePay</h3>
              <Input
                label="Nomor ShopeePay"
                name="payment_shopeepay"
                value={settings.payment_shopeepay}
                onChange={handleChange}
                placeholder="0882002048431 a.n Vina Enjelia"
              />
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan ShopeePay (Opsional)</label>
                <textarea
                  name="payment_shopeepay_desc"
                  value={settings.payment_shopeepay_desc}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  rows="2"
                  placeholder="Contoh: Transfer dari bank +Rp 1.000 admin"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Jam Operasional</h2>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Jam Pengambilan</h3>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              rows="3"
              placeholder="Senin-Sabtu: 08.00-18.00 WIB | Minggu: 10.00-15.00 WIB"
              defaultValue="Senin-Sabtu: 08.00-18.00 WIB | Minggu: 10.00-15.00 WIB"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed w-full max-w-md flex items-center justify-center gap-2"
          >
            <span>💾</span>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
