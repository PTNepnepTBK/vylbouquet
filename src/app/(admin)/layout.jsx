'use client';

// Gunakan path relatif untuk menghindari masalah alias pada beberapa environment
import { useAuth } from '../../hooks/useAuth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  CubeIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Jangan tampilkan layout di halaman login
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Pesanan', href: '/orders', icon: ShoppingBagIcon },
    { name: 'Buket', href: '/bouquets', icon: CubeIcon },
    { name: 'Pengaturan', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen fixed">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold">
              vyl<span className="text-primary">.bouquet</span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          {user && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
              <div className="flex items-center gap-3 mb-3 p-3 bg-gray-700 rounded-lg">
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.username}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="font-medium">Keluar</span>
              </button>
            </div>
          )}
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 ml-64">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
