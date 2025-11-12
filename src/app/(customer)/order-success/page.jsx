import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Pesanan Berhasil!</h1>
          <p className="text-gray-600 mb-6">
            Terima kasih telah memesan di vyl.bouquet! Pesanan Anda telah kami terima dan sedang menunggu konfirmasi admin.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Langkah Selanjutnya:</strong>
            </p>
            <ol className="text-sm text-left text-gray-600 space-y-2">
              <li>1. Admin akan mengecek pembayaran Anda</li>
              <li>2. Anda akan dihubungi melalui WhatsApp untuk konfirmasi</li>
              <li>3. Buket akan diproses sesuai jadwal pengambilan</li>
            </ol>
          </div>

          <div className="flex gap-4">
            <Link 
              href="/catalog"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Lihat Katalog
            </Link>
            <Link 
              href="/"
              className="flex-1 bg-primary hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
