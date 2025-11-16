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
            "url('/bg_image.jpg')",
        }}
      />
      {/* Subtle overlay to improve text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-transparent to-white/70" />

      {/* Navbar (over content) */}
      <div className="relative z-20">
        <NavBar />
      </div>

      {/* Main Contents */}
        <div className="relative z-10 max-w-8xl px-6 my-8 lg:px-8 h-full flex items-center ml-[65px] font-serif">
          <div className="w-full">
            {/* Left: Text */}
          <div className="text-left">

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
              Rangkaian Bunga
              <br />
              <span className="text-pink-400">Elegan</span> untuk Momen
              <br />
              Istimewa
            </h1>

            <p className="mt-6 text-lg text-black max-w-xl">
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
