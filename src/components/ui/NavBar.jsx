"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ShoppingBagIcon } from "@heroicons/react/24/outline"
import logo from "../../assets/logo.png"

export default function NavBar() {
  const pathname = usePathname() || "/"

  const items = [
    { href: "/", label: "Beranda" },
    { href: "/catalog", label: "Katalog" },
    { href: "/order", label: "Pesan Sekarang" },
  ]

  const isActive = (href) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/30 backdrop-blur-md backdrop-saturate-150 shadow-sm transition-colors">
      <nav className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative flex items-center h-20">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src={logo}
                  alt="Vyl bouquet logo"
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Center: Links (absolutely centered) */}
            <div className="absolute inset-x-0 left-0 right-0 pointer-events-none">
              <div className="flex justify-center">
                <ul className="flex gap-12 pointer-events-auto">
                  {items.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={`px-1 pb-1 ${
                          isActive(it.href)
                            ? "text-pink-500 font-semibold border-b-2 border-pink-300"
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

            {/* Right: Order button */}
            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/order"
                className="inline-flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-semibold px-5 py-2 rounded-2xl shadow-md transition pointer-events-auto"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                Order Bucket
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
