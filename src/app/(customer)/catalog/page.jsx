'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CatalogPage() {
  const [bouquets, setBouquets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBouquets();
  }, []);

  const fetchBouquets = async () => {
    try {
      const response = await fetch('/api/bouquets');
      const data = await response.json();
      if (data.success) {
        setBouquets(data.data.filter(b => b.is_active));
      }
    } catch (error) {
      console.error('Error fetching bouquets:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">Memuat katalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Katalog Buket</h1>
        
        {bouquets.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Belum ada buket tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bouquets.map((bouquet) => (
              <div key={bouquet.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64 bg-gray-200">
                  {bouquet.image_url ? (
                    <Image
                      src={bouquet.image_url}
                      alt={bouquet.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{bouquet.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{bouquet.description || 'Buket cantik dan elegan'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(bouquet.price)}
                    </span>
                    <Link 
                      href={`/order?bouquet_id=${bouquet.id}`}
                      className="bg-primary hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Pesan
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
