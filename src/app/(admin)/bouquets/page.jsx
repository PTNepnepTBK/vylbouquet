export default function BouquetsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Katalog Buket</h1>
        <a 
          href="/bouquets/create"
          className="bg-primary hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          + Tambah Buket
        </a>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">Belum ada buket</p>
        </div>
      </div>
    </div>
  )
}
