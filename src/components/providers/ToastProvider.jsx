'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Toast Provider - Provider untuk notifikasi toast di seluruh aplikasi
 * Komponen ini harus dibungkus di root layout
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options untuk semua toast
        duration: 2000,
        
        // Style default
        style: {
          background: '#fff',
          color: '#374151',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        
        // Style untuk success toast
        success: {
          duration: 2000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #6ee7b7',
          },
        },
        
        // Style untuk error toast
        error: {
          duration: 3000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
          },
        },
        
        // Style untuk loading toast
        loading: {
          iconTheme: {
            primary: '#ec4899',
            secondary: '#fff',
          },
          style: {
            background: '#fdf4ff',
            color: '#86198f',
            border: '1px solid #f0abfc',
          },
        },
      }}
    />
  );
}
