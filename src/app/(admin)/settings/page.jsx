'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/useAuth';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const showToast = useToast(); // Toast notifications
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    payment_bca: '',
    payment_bca_desc: '',
    payment_seabank: '',
    payment_seabank_desc: '',
    payment_shopeepay: '',
    payment_shopeepay_desc: '',
    whatsapp_number: '',
    instagram_handle: '',
  });
  const [whatsappError, setWhatsappError] = useState('');

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings', {
        credentials: 'include', // Sertakan cookies untuk autentikasi
      });
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      const data = await response.json();

      if (data.success) {
        // Helper function to extract string value from possible object or string
        const extractValue = (field) => {
          if (!field) return '';
          if (typeof field === 'string') return field;
          if (typeof field === 'object' && field.value) return field.value;
          return '';
        };
        
        setSettings({
          payment_bca: data.data.payment_bca?.value || '',
          payment_bca_desc: data.data.payment_bca?.description || '',
          payment_seabank: data.data.payment_seabank?.value || '',
          payment_seabank_desc: data.data.payment_seabank?.description || '',
          payment_shopeepay: data.data.payment_shopeepay?.value || '',
          payment_shopeepay_desc: data.data.payment_shopeepay?.description || '',
          whatsapp_number: extractValue(data.data.whatsapp_number),
          instagram_handle: extractValue(data.data.instagram_handle),
        });
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      showToast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchSettings();
    }
  }, [user, authLoading, router]);

  // Format WhatsApp number: remove leading 0, format to 62xxxxxxxxx
  const formatWhatsAppNumber = (input) => {
    // Remove all non-digit characters
    let cleaned = input.replace(/\D/g, '');
    
    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If starts with 62, keep it, otherwise add 62
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for WhatsApp number
    if (name === 'whatsapp_number') {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, '');
      
      // Remove leading 0 automatically
      const cleanedNumber = digitsOnly.startsWith('0') ? digitsOnly.substring(1) : digitsOnly;
      
      // Validate length (should be 9-13 digits after +62)
      if (cleanedNumber.length > 0 && (cleanedNumber.length < 9 || cleanedNumber.length > 13)) {
        setWhatsappError('Nomor WhatsApp harus 9-13 digit (contoh: 812345678)');
      } else {
        setWhatsappError('');
      }
      
      setSettings(prev => ({
        ...prev,
        [name]: cleanedNumber,
      }));
      return;
    }
    
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
      showToast.error('Minimal satu metode pembayaran harus diisi');
      return;
    }

    // Validasi WhatsApp number
    if (settings.whatsapp_number) {
      const cleanedNumber = settings.whatsapp_number.replace(/\D/g, '');
      if (cleanedNumber.length < 9 || cleanedNumber.length > 13) {
        showToast.error('Nomor WhatsApp tidak valid (harus 9-13 digit)');
        return;
      }
    }

    try {
      setSaving(true);
      
      // Format WhatsApp number before saving (add 62 prefix if not present)
      const formattedWhatsApp = settings.whatsapp_number 
        ? formatWhatsAppNumber(settings.whatsapp_number)
        : '';
      
      // Prepare data dengan struktur value dan description
      const settingsData = {
        payment_bca: { value: settings.payment_bca, description: settings.payment_bca_desc },
        payment_seabank: { value: settings.payment_seabank, description: settings.payment_seabank_desc },
        payment_shopeepay: { value: settings.payment_shopeepay, description: settings.payment_shopeepay_desc },
        whatsapp_number: formattedWhatsApp,
        instagram_handle: settings.instagram_handle,
      };
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Sertakan cookies untuk autentikasi
        body: JSON.stringify(settingsData),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success('Pengaturan berhasil disimpan');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      showToast.error('Gagal menyimpan pengaturan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pengaturan Pembayaran & Ketentuan</h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Kelola informasi pembayaran dan ketentuan pemesanan</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Metode Pembayaran</h2>
          
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">BCA</h3>
            <div className="mb-3">
              <Input
                label="Nomor Rekening BCA"
                name="payment_bca"
                value={settings.payment_bca}
                onChange={handleChange}
                placeholder="3741159803"
              />
            </div>
            <div>
              <Input
                label="Nama Pemilik Rekening BCA"
                name="payment_bca_desc"
                value={settings.payment_bca_desc}
                onChange={handleChange}
                placeholder="Muhammad Nashirul Haq Resa"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">SeaBank</h3>
            <div className="mb-3">
              <Input
                label="Nomor Rekening SeaBank"
                name="payment_seabank"
                value={settings.payment_seabank}
                onChange={handleChange}
                placeholder="901763996563"
              />
            </div>
            <div>
              <Input
                label="Nama Pemilik Rekening SeaBank"
                name="payment_seabank_desc"
                value={settings.payment_seabank_desc}
                onChange={handleChange}
                placeholder="Muhammad Nashirul Haq Resa"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">ShopeePay</h3>
            <div className="mb-3">
              <Input
                label="Nomor ShopeePay"
                name="payment_shopeepay"
                value={settings.payment_shopeepay}
                onChange={handleChange}
                placeholder="085161553414"
              />
            </div>
            <div>
              <Input
                label="Nama Pemilik ShopeePay"
                name="payment_shopeepay_desc"
                value={settings.payment_shopeepay_desc}
                onChange={handleChange}
                placeholder="Muhammad Nashirul Haq Resa"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-pink-500 font-medium">💡 Catatan: Transfer ShopeePay dari bank dikenakan biaya admin +Rp 1.000</p>
          </div>
        </div>

        {/* WhatsApp Redirect Settings */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Pengaturan Redirect WhatsApp</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp Tujuan Order
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">+62</span>
              </div>
              <input
                type="text"
                name="whatsapp_number"
                value={settings.whatsapp_number || ''}
                onChange={handleChange}
                placeholder="812345678 (tanpa 0 di depan)"
                className={`w-full pl-12 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                  whatsappError ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength="13"
              />
            </div>
            {whatsappError && (
              <p className="mt-1 text-xs text-red-600">{whatsappError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              💡 Format: 812345678 (9-13 digit, tanpa 0 di depan). Otomatis disimpan sebagai: 62{settings.whatsapp_number || 'xxxxxxxxx'}
            </p>
            <p className="mt-1 text-xs text-pink-600 font-medium">
              📱 Nomor ini akan digunakan untuk redirect order ke WhatsApp setelah customer submit pesanan
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-pink-600 active:bg-pink-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed w-full max-w-md flex items-center justify-center gap-2 text-sm sm:text-base touch-target"
          >
            <span>💾</span>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
