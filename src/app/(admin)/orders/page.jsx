'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/ui/SearchBar';
import FilterSelect from '@/components/ui/FilterSelect';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import Modal from '@/components/ui/Modal';
// jsPDF and jspdf-autotable are loaded dynamically inside `exportToPDF`
// to avoid build-time resolution errors and SSR issues.

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const showToast = useToast(); // Toast notifications
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // Temporary modal-local state to avoid updating global filters while user is interacting
  const [tempDateFrom, setTempDateFrom] = useState('');
  const [tempDateTo, setTempDateTo] = useState('');
  const [tempTimeFrom, setTempTimeFrom] = useState('');
  const [tempTimeTo, setTempTimeTo] = useState('');
  const [page, setPage] = useState(1);

  // JWT Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // fetch orders with optional filters
  const fetchOrders = async (opts = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('payment_status', paymentFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (timeFrom) params.append('time_from', timeFrom);
      if (timeTo) params.append('time_to', timeTo);
      if (opts.page) params.append('page', String(opts.page));

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();
      setOrders(json.data || []);
    } catch (err) {
      console.error('fetchOrders', err);
    } finally {
      setLoading(false);
    }
  };

  // call when relevant filters change (debounce as needed)
  useEffect(() => {
    fetchOrders({ page });
  }, [searchQuery, statusFilter, paymentFilter, dateFrom, dateTo, timeFrom, timeTo, page]);

  const getStatusBadge = (status) => {
    const config = {
      WAITING_CONFIRMATION: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu', fullLabel: 'Menunggu Konfirmasi' },
      PAYMENT_CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Konfirmasi', fullLabel: 'Terkonfirmasi' },
      IN_PROCESS: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Proses', fullLabel: 'Dalam Proses' },
      READY_FOR_PICKUP: { bg: 'bg-green-100', text: 'text-green-800', label: 'Siap', fullLabel: 'Siap Diambil' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Selesai', fullLabel: 'Selesai' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Batal', fullLabel: 'Dibatalkan' },
    };
    const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status, fullLabel: status };
    return (
      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${c.bg} ${c.text} whitespace-nowrap`}>
        <span className="sm:hidden">{c.label}</span>
        <span className="hidden sm:inline">{c.fullLabel}</span>
      </span>
    );
  };

  const getPaymentBadge = (status, remaining) => {
    if (status === 'PAID' || remaining <= 0) {
      return (
        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
          Lunas
        </span>
      );
    }
    return (
      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
        <span className="sm:hidden">Belum</span>
        <span className="hidden sm:inline">Belum Lunas</span>
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      WAITING_CONFIRMATION: 'Menunggu Konfirmasi',
      PAYMENT_CONFIRMED: 'Terkonfirmasi',
      IN_PROCESS: 'Dalam Proses',
      READY_FOR_PICKUP: 'Siap Diambil',
      COMPLETED: 'Selesai',
      CANCELLED: 'Dibatalkan'
    };
    return labels[status] || status;
  };

  // Export visible orders to PDF (runtime dynamic import to avoid SSR issues)
  const exportToPDF = async () => {
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Laporan Pesanan', 14, 15);
      doc.setFontSize(10);
      const ts = new Date().toLocaleString('id-ID');
      doc.text(`Tanggal Cetak: ${ts}`, 14, 22);

      const tableData = (filteredOrders || []).map((order) => {
        const total = parseFloat(order.bouquet_price || 0);
        const dp = parseFloat(order.dp_amount || 0);
        const remaining = parseFloat(order.remaining_amount || 0);
        return [
          order.order_number || (`#${order.id}`),
          order.customer_name || '',
          order.sender_phone || '',
          order.bouquet?.name || 'Custom',
          formatPrice(total),
          order.payment_type === 'DP' ? 'DP' : 'Lunas',
          order.payment_type === 'DP' ? formatPrice(dp) : '-',
          remaining > 0 ? formatPrice(remaining) : '-',
          getStatusLabel(order.order_status),
          order.pickup_date ? formatDate(order.pickup_date) : '-'
        ];
      });

      autoTable(doc, {
        startY: 28,
        head: [[
          'ID', 'Pembeli', 'WA', 'Buket', 'Harga', 'Tipe', 'DP', 'Sisa', 'Status', 'Ambil'
        ]],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      const fileName = `laporan-pesanan-${new Date().toISOString().slice(0,10)}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('exportToPDF error', err);
      showToast.error('Gagal mengekspor PDF. Pastikan dependency "jspdf" dan "jspdf-autotable" terpasang.');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchSearch = !searchQuery || 
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = !statusFilter || order.order_status === statusFilter;
    const matchPayment = !paymentFilter || order.payment_status === paymentFilter;
    
    return matchSearch && matchStatus && matchPayment;
  });

  // Pagination
  const {
    paginatedData: paginatedOrders,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    perPage,
    goToPage,
    changePerPage,
  } = usePagination(filteredOrders, 10); // 10 orders per page

  const statusOptions = [
    { value: '', label: 'Semua Status Pesanan' },
    { value: 'WAITING_CONFIRMATION', label: 'Menunggu Konfirmasi' },
    { value: 'PAYMENT_CONFIRMED', label: 'Terkonfirmasi' },
    { value: 'IN_PROCESS', label: 'Dalam Proses' },
    { value: 'READY_FOR_PICKUP', label: 'Siap Diambil' },
    { value: 'COMPLETED', label: 'Selesai' },
    { value: 'CANCELLED', label: 'Dibatalkan' },
  ];

  const paymentOptions = [
    { value: '', label: 'Semua Status Pembayaran' },
    { value: 'UNPAID', label: 'Belum Lunas' },
    { value: 'PAID', label: 'Lunas' },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manajemen Pesanan</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm">Kelola semua pesanan buket</p>
          </div>
          <button
            onClick={exportToPDF}
            disabled={filteredOrders.length === 0}
            className="flex-shrink-0 px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap touch-target"
          >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Ekspor PDF
        </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 items-start">
        <div className="flex-1">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama pembeli..."
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
        <FilterSelect
          value={paymentFilter}
          onChange={setPaymentFilter}
          options={paymentOptions}
        />

        {/* Open modal for Date & Time filters */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => {
              // initialize modal-local temps from current filters
              setTempDateFrom(dateFrom);
              setTempDateTo(dateTo);
              setTempTimeFrom(timeFrom);
              setTempTimeTo(timeTo);
              setIsFilterModalOpen(true);
            }}
            className="px-3 py-1 border rounded text-sm flex items-center gap-2 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Filter Tanggal & Jam</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4 text-xs sm:text-sm">Memuat pesanan...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">Tidak ada pesanan ditemukan</p>
          </div>
        ) : (
          <div>
          {/* Scroll hint untuk mobile */}
          <div className="sm:hidden px-4 py-2 bg-blue-50 border-b border-blue-100">
            <p className="text-xs text-blue-700 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Geser ke kanan untuk melihat semua kolom
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[150px]">
                    Nama Pembeli
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[120px]">
                    Buket
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[110px]">
                    Harga Total
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[140px]">
                    Jenis Pembayaran
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[100px]">
                    Sisa
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[150px]">
                    Status Pesanan
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap min-w-[130px]">
                    Status Pembayaran
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedOrders.map((order) => {
                  const totalPrice = parseFloat(order.bouquet_price || 0);
                  const remaining = parseFloat(order.remaining_amount || 0);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{order.order_number}</div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{order.bouquet?.name || 'Custom'}</div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatPrice(totalPrice)}</div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{order.payment_type === 'DP' ? 'DP' : 'Lunas'}</span>
                          <span className="text-gray-500 ml-1">
                            {order.payment_type === 'DP' && `(${formatPrice(order.dp_amount)})`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {remaining > 0 ? formatPrice(remaining) : '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(order.order_status)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        {getPaymentBadge(order.payment_status, remaining)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                        <Link href={`/orders/${order.id}`} className="text-primary hover:text-pink-600 font-semibold transition-colors inline-flex items-center gap-1">
                          <span>Detail</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            perPage={perPage}
            onPerPageChange={changePerPage}
          />
        )}
      </div>

      {/* Date & Time Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Tanggal & Jam" size="md">
        <div className="space-y-6">
          <p className="text-sm text-gray-600">Pilih rentang tanggal dan jam untuk memfilter daftar pesanan. Kosongkan untuk menampilkan semua.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dari Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  value={tempDateFrom}
                  onChange={(e) => setTempDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sampai Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  value={tempDateTo}
                  onChange={(e) => setTempDateTo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dari Jam</label>
              <div className="relative">
                <input
                  type="time"
                  value={tempTimeFrom}
                  onChange={(e) => setTempTimeFrom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sampai Jam</label>
              <div className="relative">
                <input
                  type="time"
                  value={tempTimeTo}
                  onChange={(e) => setTempTimeTo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              {dateFrom || dateTo || timeFrom || timeTo ? (
                <span>Aktif: {dateFrom || '-'} {dateFrom && dateTo ? `— ${dateTo}` : ''} {timeFrom || timeTo ? ` • ${timeFrom || '--:--'}—${timeTo || '--:--'}` : ''}</span>
              ) : (
                <span>Tidak ada filter aktif</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  // reset both modal temps and global filters
                  setTempDateFrom(''); setTempDateTo(''); setTempTimeFrom(''); setTempTimeTo('');
                  setDateFrom(''); setDateTo(''); setTimeFrom(''); setTimeTo('');
                  setPage(1); fetchOrders({ page: 1 });
                  setIsFilterModalOpen(false);
                }}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  // apply modal temps to global filters
                  setDateFrom(tempDateFrom);
                  setDateTo(tempDateTo);
                  setTimeFrom(tempTimeFrom);
                  setTimeTo(tempTimeTo);
                  setPage(1); fetchOrders({ page: 1 });
                  setIsFilterModalOpen(false);
                }}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md text-sm shadow"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
