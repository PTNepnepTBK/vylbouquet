import Link from 'next/link'
import { ShoppingBagIcon, SparklesIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            vyl<span className="text-primary">.bouquet</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Buket Cantik untuk Semua Momen ✨
          </p>
          
          <Link 
            href="/catalog"
            className="inline-flex items-center gap-2 bg-primary hover:bg-pink-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <ShoppingBagIcon className="w-6 h-6" />
            Pesan Sekarang
          </Link>

          {/* Cara Order */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">1. Pilih Buket</h3>
              <p className="text-gray-600">Lihat katalog dan pilih buket favorit Anda</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <HeartIcon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold text-lg mb-2">2. Isi Data Pesanan</h3>
              <p className="text-gray-600">Lengkapi form dengan detail pesanan Anda</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBagIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">3. Lakukan Pembayaran</h3>
              <p className="text-gray-600">Transfer dan upload bukti pembayaran</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
