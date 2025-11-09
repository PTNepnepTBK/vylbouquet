export default function OrderDetailPage({ params }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Detail Pesanan #{params.id}</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Detail pesanan akan ditampilkan di sini</p>
      </div>
    </div>
  )
}
