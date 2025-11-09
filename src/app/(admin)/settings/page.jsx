'use client';

import { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    bank_bca: '',
    bank_bca_name: '',
    bank_seabank: '',
    bank_seabank_name: '',
    ewallet_shopeepay: '',
    ewallet_shopeepay_name: '',
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
          bank_bca: data.data.bank_bca || '',
          bank_bca_name: data.data.bank_bca_name || '',
          bank_seabank: data.data.bank_seabank || '',
          bank_seabank_name: data.data.bank_seabank_name || '',
          ewallet_shopeepay: data.data.ewallet_shopeepay || '',
          ewallet_shopeepay_name: data.data.ewallet_shopeepay_name || '',
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
    if (!settings.bank_bca && !settings.bank_seabank && !settings.ewallet_shopeepay) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Pembayaran</h1>
        <p className="text-gray-600 mt-1">Kelola informasi pembayaran dan ketentuan toko</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rekening Bank */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Rekening Bank
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nomor Rekening BCA"
                  name="bank_bca"
                  value={settings.bank_bca}
                  onChange={handleChange}
                  placeholder="Contoh: 4373021906"
                />
                <Input
                  label="Atas Nama (BCA)"
                  name="bank_bca_name"
                  value={settings.bank_bca_name}
                  onChange={handleChange}
                  placeholder="Contoh: Vyl Buket"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nomor Rekening SeaBank"
                  name="bank_seabank"
                  value={settings.bank_seabank}
                  onChange={handleChange}
                  placeholder="Contoh: 901081198646"
                />
                <Input
                  label="Atas Nama (SeaBank)"
                  name="bank_seabank_name"
                  value={settings.bank_seabank_name}
                  onChange={handleChange}
                  placeholder="Contoh: Vyl Buket"
                />
              </div>
            </div>
          </div>

          {/* E-Wallet */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              E-Wallet
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nomor ShopeePay"
                name="ewallet_shopeepay"
                value={settings.ewallet_shopeepay}
                onChange={handleChange}
                placeholder="Contoh: 0882002048431"
              />
              <Input
                label="Atas Nama (ShopeePay)"
                name="ewallet_shopeepay_name"
                value={settings.ewallet_shopeepay_name}
                onChange={handleChange}
                placeholder="Contoh: Vyl Buket"
              />
            </div>
          </div>
          
          {/* Ketentuan */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ketentuan Pembayaran
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimal DP (%)"
                type="number"
                name="min_dp_percent"
                value={settings.min_dp_percent}
                onChange={handleChange}
                placeholder="30"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Informasi Kontak
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nomor WhatsApp"
                name="whatsapp_number"
                value={settings.whatsapp_number}
                onChange={handleChange}
                placeholder="Contoh: 6282134567890"
              />
              <Input
                label="Instagram Handle"
                name="instagram_handle"
                value={settings.instagram_handle}
                onChange={handleChange}
                placeholder="Contoh: @vylbuket"
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={fetchSettings}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Pengaturan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
