'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' 
        ? '/api/orders' 
        : `/api/orders?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      } else {
        alert('Error fetching orders: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      WAITING_CONFIRMATION: { variant: 'warning', text: 'Menunggu Konfirmasi' },
      PAYMENT_CONFIRMED: { variant: 'info', text: 'Pembayaran Terkonfirmasi' },
      IN_PROCESS: { variant: 'info', text: 'Dalam Proses' },
      READY_FOR_PICKUP: { variant: 'success', text: 'Siap Diambil' },
      COMPLETED: { variant: 'success', text: 'Selesai' },
      CANCELLED: { variant: 'danger', text: 'Dibatalkan' },
    };
    
    const config = statusConfig[status] || { variant: 'default', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPaymentBadge = (status) => {
    return status === 'PAID' 
      ? <Badge variant="success">Lunas</Badge>
      : <Badge variant="warning">Belum Lunas</Badge>;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manajemen Pesanan</h1>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-600"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {['ALL', 'WAITING_CONFIRMATION', 'PAYMENT_CONFIRMED', 'IN_PROCESS', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              filter === status 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'ALL' ? 'Semua' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Memuat pesanan...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Ambil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Bayar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      {order.sender_phone && (
                        <div className="text-xs text-gray-500">📱 {order.sender_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.bouquet?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.pickup_date)}</div>
                      <div className="text-xs text-gray-500">{order.pickup_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatPrice(order.bouquet_price)}</div>
                      {order.payment_type === 'DP' && (
                        <div className="text-xs text-orange-600">DP: {formatPrice(order.dp_amount)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.order_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="text-primary hover:text-pink-600 font-medium"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && orders.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Pesanan</p>
            <p className="text-2xl font-bold text-blue-700">{orders.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Menunggu Konfirmasi</p>
            <p className="text-2xl font-bold text-yellow-700">
              {orders.filter(o => o.order_status === 'WAITING_CONFIRMATION').length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Selesai</p>
            <p className="text-2xl font-bold text-green-700">
              {orders.filter(o => o.order_status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Pendapatan</p>
            <p className="text-2xl font-bold text-purple-700">
              {formatPrice(orders.reduce((sum, o) => sum + parseFloat(o.total_paid || 0), 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
