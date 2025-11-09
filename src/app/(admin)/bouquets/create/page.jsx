export default function CreateBouquetPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tambah Buket Baru</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Buket</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Masukkan nama buket"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Harga</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Masukkan harga"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows="4"
              placeholder="Masukkan deskripsi"
            ></textarea>
          </div>
          
          <div className="flex gap-4">
            <button 
              type="submit"
              className="bg-primary hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Simpan
            </button>
            <a 
              href="/bouquets"
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold"
            >
              Batal
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
