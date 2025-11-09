export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar akan ditambahkan nanti */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-2">
            <a href="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-800">Dashboard</a>
            <a href="/orders" className="block py-2 px-4 rounded hover:bg-gray-800">Pesanan</a>
            <a href="/bouquets" className="block py-2 px-4 rounded hover:bg-gray-800">Buket</a>
            <a href="/settings" className="block py-2 px-4 rounded hover:bg-gray-800">Pengaturan</a>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
