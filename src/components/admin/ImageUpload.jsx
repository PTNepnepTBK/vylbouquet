'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useToast } from '../../hooks/useToast';
import { compressImageToWebP, isImageFile, formatFileSize } from '../../lib/imageCompression';

export default function ImageUpload({ value, onChange, disabled = false }) {
  const showToast = useToast(); // Toast notifications
  const [preview, setPreview] = useState(value || null);
  const [compressing, setCompressing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file adalah gambar
    if (!isImageFile(file)) {
      showToast.error('Hanya file gambar yang diperbolehkan (JPG, PNG, WebP, dll)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setCompressing(true);
      
      // Kompresi gambar ke WebP max 1MB (1024 KB)
      const compressedFile = await compressImageToWebP(file, 1024);
      
      showToast.success(
        `Gambar berhasil dikompresi dari ${formatFileSize(file.size)} menjadi ${formatFileSize(compressedFile.size)}`
      );
      
      // Preview lokal saja, belum upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);

      // Simpan file untuk diupload nanti saat submit
      setSelectedFile(compressedFile);
      onChange({ file: compressedFile, isNew: true });
      
    } catch (error) {
      console.error('Compress error:', error);
      showToast.error('Gagal memproses gambar: ' + error.message);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setCompressing(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || compressing}
          className="hidden"
          id="image-upload"
        />
        
        <label
          htmlFor="image-upload"
          className={`px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
            disabled || compressing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {compressing ? 'Mengkompresi...' : 'Pilih Gambar'}
        </label>

        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || compressing}
            className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
          >
            Hapus
          </button>
        )}
      </div>

      {preview && (
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
          />
        </div>
      )}

      <p className="text-sm text-gray-500">
        File gambar apapun (JPG, PNG, WebP, dll). Otomatis dikonversi ke WebP dan dikompresi max 1MB. Upload akan dilakukan saat klik tombol Simpan.
      </p>
    </div>
  );
}
