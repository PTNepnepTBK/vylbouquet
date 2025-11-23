'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ImageUpload from './ImageUpload';
import { useToast } from '../../hooks/useToast';

export default function BouquetModal({ isOpen, onClose, mode = 'create', bouquet = null, onSuccess }) {
  const showToast = useToast(); // Toast notifications
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image_url: null,
    is_active: true,
  });

  // Format number to Rupiah
  const formatRupiah = (value) => {
    if (!value) return '';
    const number = parseFloat(value);
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Reset form ketika modal dibuka/tutup atau mode berubah
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && bouquet) {
        setFormData({
          name: bouquet.name || '',
          price: bouquet.price || '',
          description: bouquet.description || '',
          image_url: bouquet.image_url || null,
          is_active: bouquet.is_active !== undefined ? bouquet.is_active : true,
        });
      } else {
        setFormData({
          name: '',
          price: '',
          description: '',
          image_url: null,
          is_active: true,
        });
      }
    }
  }, [isOpen, mode, bouquet]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for price: remove non-digit characters
    if (name === 'price') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (url) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi
    if (!formData.name.trim()) {
      showToast.error('Nama buket harus diisi');
      return;
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      showToast.error('Harga harus diisi dengan angka yang valid');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = formData.image_url;
      
      // Upload image jika ada file baru
      if (formData.image_url && typeof formData.image_url === 'object' && formData.image_url.isNew) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.image_url.file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          throw new Error('Gagal mengupload gambar: ' + uploadData.message);
        }

        imageUrl = uploadData.url;
        
        // Delete old image jika mode edit dan ada gambar lama
        if (mode === 'edit' && bouquet?.image_url) {
          try {
            await fetch('/api/upload', {
              method: 'DELETE',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: bouquet.image_url }),
            });
          } catch (err) {
            console.warn('Failed to delete old image:', err);
          }
        }
      }

      const url = mode === 'create' 
        ? '/api/bouquets' 
        : `/api/bouquets/${bouquet.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success(mode === 'create' ? 'Buket berhasil ditambahkan' : 'Buket berhasil diupdate');
        onSuccess?.();
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Tambah Buket Baru' : 'Edit Buket'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Buket
            </label>
            <ImageUpload
              value={formData.image_url}
              onChange={handleImageChange}
              disabled={loading}
            />
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-4">
            {/* Nama Buket */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Buket <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Buket Mawar Merah"
                required
                disabled={loading}
              />
            </div>

            {/* Harga */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Harga <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1">
                <Input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="numeric"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="150000"
                  required
                  disabled={loading}
                />
                {formData.price && (
                  <p className="text-xs text-gray-600">
                    💰 {formatRupiah(formData.price)}
                  </p>
                )}
              </div>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Tampilkan di katalog customer
              </label>
            </div>
          </div>
        </div>

        {/* Deskripsi - Full Width */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi (Opsional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Deskripsi buket..."
            rows={4}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah Buket' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
