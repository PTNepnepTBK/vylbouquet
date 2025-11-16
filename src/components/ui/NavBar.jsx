"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ShoppingBagIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import logo from "../../assets/logo.png"

export default function NavBar() {
  const pathname = usePathname() || "/"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const items = [
    { href: "/", label: "Beranda" },
    { href: "/catalog", label: "Katalog" },
    { href: "/order", label: "Pesan Sekarang" },
  ]

  const isActive = (href) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // Tutup menu saat route berubah
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent scroll saat mobile menu terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Header - Navbar Desktop & Mobile */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/30 backdrop-blur-md backdrop-saturate-150 shadow-sm transition-colors font-serif">
        <nav className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative flex items-center justify-between h-16 lg:h-20">
              
              {/* Logo - Kiri */}
              <div className="flex-shrink-0 z-10">
                <Link href="/" className="inline-flex items-center">
                  <Image
                    src={logo}
                    alt="Vyl bouquet logo"
                    className="object-contain h-10 w-auto sm:h-12"
                    priority
                  />
                </Link>
              </div>

              {/* Desktop Menu - Center (Hidden di mobile) */}
              <div className="hidden lg:flex absolute inset-x-0 left-0 right-0 pointer-events-none">
                <div className="flex justify-center w-full">
                  <ul className="flex gap-8 xl:gap-12 pointer-events-auto">
                    {items.map((it) => (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className={`px-1 pb-1 transition-colors ${
                            isActive(it.href)
                              ? "text-pink-500 font-semibold border-b-2 border-pink-400"
                              : "text-gray-900 hover:text-pink-500"
                          }`}
                          aria-current={isActive(it.href) ? "page" : undefined}
                        >
                          {it.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Kanan: Order Button (Desktop) & Hamburger (Mobile) */}
              <div className="flex items-center gap-3 z-10">
                {/* Order Button - Hidden di mobile, tampil di tablet+ */}
                <Link
                  href="/order"
                  className="hidden sm:inline-flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-semibold px-4 lg:px-5 py-2 rounded-2xl shadow-md transition-all hover:shadow-lg touch-target"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span className="hidden md:inline">Order Bucket</span>
                  <span className="md:hidden">Order</span>
                </Link>

                {/* Hamburger Button - Hanya tampil di mobile */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-900 hover:bg-pink-50 hover:text-pink-500 transition-colors touch-target"
                  aria-label="Toggle menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                  ) : (
                    <Bars3Icon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay - Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer - Slide dari kanan */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Mobile Menu */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors touch-target"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors touch-target ${
                      isActive(it.href)
                        ? "bg-pink-50 text-pink-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-pink-500"
                    }`}
                    aria-current={isActive(it.href) ? "page" : undefined}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Mobile Menu - Order Button */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Link
              href="/order"
              className="flex items-center justify-center gap-2 w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-all hover:shadow-lg touch-target"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Order Bucket
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
