import Link from 'next/link'
import { ShoppingBagIcon, SparklesIcon, HeartIcon, ArrowDownLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import NavBar from '../components/ui/NavBar'

export default function Home() {
  return (
    <main className="h-screen overflow-hidden relative">
      {/* Background image (full screen) */}
      <div
        className="absolute inset-0 bg-center bg-cover blur-sm brightness-90"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&s=1b5a9f7f5e3a2a4c2d9e4c2a6b7f7b6e')",
        }}
      />
      {/* Subtle overlay to improve text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-transparent to-white/70" />

      {/* Navbar (over content) */}
      <div className="relative z-20">
        <NavBar />
      </div>

      {/* Main Contents */}
        <div className="relative z-10 max-w-8xl px-6 my-8 lg:px-8 h-full flex items-center ml-[65px]">
          <div className="w-full">
            {/* Left: Text */}
          <div className="text-left">
            <span className="inline-block bg-white/80 backdrop-blur rounded-2xl px-4 py-2 text-pink-600 font-regular drop-shadow-md mb-6">Toko Bucket Terpercaya</span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
              Rangkaian Bunga
              <br />
              <span className="text-pink-400">Elegan</span> untuk Momen
              <br />
              Istimewa
            </h1>

            <p className="mt-6 text-lg text-amber-700 max-w-xl">
              Pesan buket bunga segar dengan mudah. Custom design, kualitas premium, dan pelayanan terbaik untuk setiap momen spesial Anda.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/order" className="inline-flex items-center gap-3 bg-pink-400 hover:bg-pink-500 text-white font-semibold px-6 py-3 rounded-2xl shadow-md transition">
                <ShoppingBagIcon className="w-5 h-5" />
                Pesan Sekarang
              </Link>

              <Link href="/catalog" className="inline-flex items-center gap-3 border border-gray-900 text-gray-900 px-6 py-3 rounded-2xl hover:shadow focus:outline-none">
                Lihat Katalog
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-5 h-5 text-pink-400" />
                <span className="text-sm">100+ Pelanggan Puas</span>
              </div>
              <div className="flex items-center gap-3">
                <HeartIcon className="w-5 h-5 text-rose-400" />
                <span className="text-sm">Bunga Segar Premium</span>
              </div>
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="w-5 h-5 text-emerald-500" />
                <span className="text-sm">DP 30% Saja</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
