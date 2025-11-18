'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '@/components/ui/SearchBar';
import FilterSelect from '@/components/ui/FilterSelect';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
// jsPDF and jspdf-autotable are loaded dynamically inside `exportToPDF`
// to avoid build-time resolution errors and SSR issues.

export default function OrdersPage() {
  const { user } = useAuth();
  const showToast = useToast(); // Toast notifications
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getPaymentStatusLabel = (status, remaining) => {
    if (status === 'PAID' || remaining <= 0) return 'Lunas';
    return 'Belum Lunas';
  };

  const exportToPDF = async () => {
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text('Laporan Pesanan Vyl Buket', 14, 15);
      
      // Add date
      doc.setFontSize(10);
      const timestamp = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Tanggal Cetak: ${timestamp}`, 14, 22);

      // Prepare table data
      const tableData = filteredOrders.map(order => {
        const totalPrice = parseFloat(order.bouquet_price || 0);
        const remaining = parseFloat(order.remaining_amount || 0);
        const dpAmount = parseFloat(order.dp_amount || 0);

        return [
          `#${order.id}`,
          order.customer_name || '',
          order.sender_phone || '',
          order.bouquet?.name || 'Custom',
          formatPrice(totalPrice),
          order.payment_type === 'DP' ? 'DP' : 'Lunas',
          formatPrice(dpAmount),
          formatPrice(remaining),
          getStatusLabel(order.order_status),
          formatDate(order.pickup_date)
        ];
      });

      // Add table
      autoTable(doc, {
        startY: 28,
        head: [[
          'ID',
          'Pembeli',
          'WhatsApp',
          'Buket',
          'Harga',
          'Tipe',
          'DP',
          'Sisa',
          'Status',
          'Ambil'
        ]],
        body: tableData,
        theme: 'striped',
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [139, 92, 246],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 15 },
          6: { cellWidth: 18 },
          7: { cellWidth: 18 },
          8: { cellWidth: 22 },
          9: { cellWidth: 18 }
        }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const timestamp2 = new Date().toISOString().split('T')[0];
      doc.save(`laporan-pesanan-${timestamp2}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast.error('Gagal mengekspor PDF. Pastikan dependency "jspdf" dan "jspdf-autotable" sudah terpasang.');
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
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
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
          <div className="table-responsive">
            <table className="w-full table-fixed table-fixed-md table-compact">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600 w-16 sm:w-20">
                    <div className="truncate">ID</div>
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600 w-40 sm:w-48">
                    <div className="truncate">Nama Pembeli</div>
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600 w-36 sm:w-44">
                    <div className="truncate">Buket</div>
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600 w-28 sm:w-32">
                    <div className="truncate">Harga Total</div>
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600 w-32 sm:w-36">
                    <div className="truncate">Jenis Pembayaran</div>
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600 w-24 sm:w-28">
                    <div className="truncate">Sisa</div>
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600 w-36 sm:w-40">
                    <div className="truncate">Status Pesanan</div>
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600 w-32 sm:w-36">
                    <div className="truncate">Status Pembayaran</div>
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-600 w-24 sm:w-28">
                    <div className="truncate">Aksi</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedOrders.map((order) => {
                  const totalPrice = parseFloat(order.bouquet_price || 0);
                  const remaining = parseFloat(order.remaining_amount || 0);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{order.order_number}</div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate" title={order.customer_name}>{order.customer_name}</div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3">
                        <div className="text-xs sm:text-sm text-gray-700 truncate" title={order.bouquet?.name}>{order.bouquet?.name || 'Custom'}</div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-semibold text-gray-900">{formatPrice(totalPrice)}</div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-700">
                          <span className="font-medium">{order.payment_type === 'DP' ? 'DP' : 'Lunas'}</span>
                          <span className="hidden sm:inline text-gray-500 ml-1">
                            {order.payment_type === 'DP' && `(${formatPrice(order.dp_amount)})`}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                        <div className={`text-xs sm:text-sm font-semibold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>{remaining > 0 ? formatPrice(remaining) : '-'}</div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                        {getStatusBadge(order.order_status)}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                        {getPaymentBadge(order.payment_status, remaining)}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                        <Link href={`/orders/${order.id}`} className="text-primary hover:text-pink-600 font-semibold transition-colors inline-flex items-center gap-1 touch-target">
                          <span className="hidden sm:inline">Detail</span>
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
    </div>
  );
}
