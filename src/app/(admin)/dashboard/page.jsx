'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Selamat datang kembali, {user.full_name}!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary">
          <h3 className="text-gray-500 text-sm font-medium">Pesanan Baru</h3>
          <p className="text-3xl font-bold text-primary mt-2">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Terkonfirmasi</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Dalam Proses</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Selesai</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Pesanan Terbaru</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada pesanan masuk</p>
        </div>
      </div>
    </div>
  );
}
