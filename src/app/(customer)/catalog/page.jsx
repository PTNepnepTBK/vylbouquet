'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NavBar from '../../../components/ui/NavBar'

export default function CatalogPage() {
  const [bouquets, setBouquets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

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

  const filtered = useMemo(() => {
    if (!query) return bouquets;
    const q = query.toLowerCase();
    return bouquets.filter(b => (b.name || '').toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q));
  }, [bouquets, query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">Memuat katalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 pt-24 pb-12 px-4">
      <div className="relative z-20">
        <NavBar />
      </div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Katalog Buket</h1>
        <p className="text-center text-amber-700 mb-8">Jelajahi koleksi buket bunga kami yang indah dan elegan untuk setiap momen spesial</p>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM8 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari buket..."
              className="w-full border border-gray-300 rounded-full py-4 pl-14 pr-6 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Belum ada buket tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((bouquet) => (
              <div key={bouquet.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                <div className="relative h-64 bg-gray-200">
                  {bouquet.image_url ? (
                    <Image
                      src={bouquet.image_url}
                      alt={bouquet.name}
                      fill
                      className="object-cover rounded-t-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg md:text-xl font-serif font-bold mb-2">{bouquet.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{bouquet.description || 'Mixed seasonal flowers in warm tones'}</p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl md:text-3xl font-bold text-pink-400">{formatPrice(bouquet.price)}</span>
                    </div>

                    <Link
                      href={`/order?bouquet_id=${bouquet.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7M7 13l-2 5h13" />
                      </svg>
                      Pilih buket ini
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
