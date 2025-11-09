export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pengaturan Pembayaran & Ketentuan</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Rekening Bank</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BCA</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  defaultValue="4373021906"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SeaBank</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  defaultValue="901081198646"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ShopeePay</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  defaultValue="0882002048431"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Ketentuan</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimal DP (%)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                defaultValue="30"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="bg-primary hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Simpan Pengaturan
          </button>
        </form>
      </div>
    </div>
  )
}
