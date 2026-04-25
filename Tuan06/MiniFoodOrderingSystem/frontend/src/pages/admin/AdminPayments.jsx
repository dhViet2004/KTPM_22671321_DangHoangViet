import { useState, useEffect } from 'react';
import { paymentApi, orderApi } from '../../api/adminApi';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [orderDetails, setOrderDetails] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      const orderIds = [...new Set(payments.map(p => p.orderId).filter(Boolean))];
      orderIds.forEach(async (oid) => {
        if (!orderDetails[oid]) {
          try {
            const res = await orderApi.getById(oid);
            setOrderDetails(prev => ({ ...prev, [oid]: res.data }));
          } catch { /* ignore */ }
        }
      });
    }
  }, [payments]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getAll();
      setPayments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const statusConfig = {
    true: { label: 'Thành công', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    false: { label: 'Thất bại', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  };

  const methodConfig = {
    COD: { label: 'COD', color: 'bg-yellow-100 text-yellow-700' },
    BANKING: { label: 'Chuyển khoản', color: 'bg-blue-100 text-blue-700' },
  };

  const filteredPayments = payments.filter(p => {
    const matchStatus = filterStatus === 'ALL' || String(p.success) === filterStatus;
    const matchMethod = filterMethod === 'ALL' || p.paymentMethod === filterMethod;
    return matchStatus && matchMethod;
  });

  const totalRevenue = payments.filter(p => p.success).reduce((sum, p) => {
    const order = orderDetails[p.orderId];
    return sum + (order?.totalAmount || 0);
  }, 0);

  const successfulCount = payments.filter(p => p.success).length;
  const failedCount = payments.filter(p => !p.success).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý thanh toán</h1>
        <p className="text-gray-500 mt-1">Theo dõi lịch sử thanh toán trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Thành công</p>
          <p className="text-2xl font-bold text-green-600">{successfulCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Thất bại</p>
          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Tổng doanh thu</p>
          <p className="text-xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-sm text-gray-500 flex items-center">Trạng thái:</span>
        {['ALL', 'true', 'false'].map((status) => {
          const cfg = statusConfig[status] || {};
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : cfg.label || status}
            </button>
          );
        })}
        <span className="text-sm text-gray-500 flex items-center ml-4">Phương thức:</span>
        {['ALL', 'COD', 'BANKING'].map((method) => {
          const cfg = methodConfig[method] || {};
          return (
            <button
              key={method}
              onClick={() => setFilterMethod(method)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterMethod === method
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {method === 'ALL' ? 'Tất cả' : cfg.label || method}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-gray-500">Không có giao dịch nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold">Mã GD</th>
                  <th className="px-6 py-4 font-semibold">Mã đơn</th>
                  <th className="px-6 py-4 font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold">Số tiền</th>
                  <th className="px-6 py-4 font-semibold">Phương thức</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map((payment) => {
                  const statusCfg = statusConfig[String(payment.success)] || { label: payment.success, color: 'bg-gray-100 text-gray-700' };
                  const methodCfg = methodConfig[payment.paymentMethod] || { label: payment.paymentMethod, color: 'bg-gray-100 text-gray-700' };
                  const order = orderDetails[payment.orderId];
                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-500">#{payment.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">#{payment.orderId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">User #{payment.userId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{formatPrice(order?.totalAmount || 0)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${methodCfg.color}`}>{methodCfg.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${statusCfg.color}`}>{statusCfg.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{formatDate(payment.createdAt)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết giao dịch</h2>
              <button onClick={() => setSelectedPayment(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mã giao dịch</p>
                  <p className="font-semibold text-gray-900">#{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                  <p className="font-semibold text-gray-900">#{selectedPayment.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Khách hàng</p>
                  <p className="font-semibold text-gray-900">User #{selectedPayment.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phương thức</p>
                  <span className={`badge ${methodConfig[selectedPayment.paymentMethod]?.color || 'bg-gray-100 text-gray-700'}`}>
                    {methodConfig[selectedPayment.paymentMethod]?.label || selectedPayment.paymentMethod}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Số tiền</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(orderDetails[selectedPayment.orderId]?.totalAmount || 0)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                  <span className={`badge ${statusConfig[String(selectedPayment.success)]?.color || 'bg-gray-100 text-gray-700'}`}>
                    {statusConfig[String(selectedPayment.success)]?.label || selectedPayment.success}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Thời gian</p>
                  <p className="font-medium text-gray-700">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                {selectedPayment.message && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Ghi chú</p>
                    <p className="text-sm text-gray-700">{selectedPayment.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
