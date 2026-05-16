import { useState, useEffect } from 'react';
import { orderApi, foodApi, userApi } from '../../api/adminApi';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [foodNames, setFoodNames] = useState({});
  const [userNames, setUserNames] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      fetchFoodAndUserNames();
    }
  }, [orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAll();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodAndUserNames = async () => {
    const foodIds = [...new Set(orders.flatMap(o => o.items?.map(i => i.foodId) || []))];
    const userIds = [...new Set(orders.map(o => o.userId).filter(Boolean))];

    const foodNamesMap = {};
    const userNamesMap = {};

    await Promise.allSettled([
      ...foodIds.map(async (fid) => {
        try {
          const res = await foodApi.getById(fid);
          foodNamesMap[fid] = res.data?.name || `Món #${fid}`;
        } catch { foodNamesMap[fid] = `Món #${fid}`; }
      }),
      ...userIds.map(async (uid) => {
        try {
          const res = await userApi.getById(uid);
          userNamesMap[uid] = res.data?.username || `User #${uid}`;
        } catch { userNamesMap[uid] = `User #${uid}`; }
      }),
    ]);

    setFoodNames(foodNamesMap);
    setUserNames(userNamesMap);
  };

  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    setDetailsLoading(true);
    try {
      const res = await orderApi.getById(order.id);
      setOrderDetails(res.data);
    } catch (err) {
      setOrderDetails(order);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      await orderApi.updateStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        setOrderDetails(orderDetails ? { ...orderDetails, status: newStatus } : null);
      }
    } catch (err) {
      alert('Cập nhật trạng thái thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const statusConfig = {
    PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  };

  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchSearch = searchTerm === '' ||
      `#${order.id}`.includes(searchTerm) ||
      (userNames[order.userId] || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-500 mt-1">Xem và cập nhật trạng thái đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, khách hàng..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', ...ORDER_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold">Mã đơn</th>
                  <th className="px-6 py-4 font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold">Số món</th>
                  <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const cfg = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{userNames[order.userId] || `User #${order.userId}`}</p>
                          <p className="text-xs text-gray-400">ID: {order.userId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{order.items?.length || 0} món</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Khách hàng: <span className="font-medium text-gray-700">{userNames[selectedOrder.userId] || `User #${selectedOrder.userId}`}</span>
                </p>
              </div>
              <button onClick={() => { setSelectedOrder(null); setOrderDetails(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : (
                <>
                  {/* Status update */}
                  <div className="mb-5">
                    <p className="text-sm font-medium text-gray-700 mb-2">Cập nhật trạng thái</p>
                    <div className="flex flex-wrap gap-2">
                      {ORDER_STATUSES.map((status) => {
                        const cfg = statusConfig[status];
                        const isActive = orderDetails?.status === status || selectedOrder.status === status;
                        const isUpdating = updatingStatus === selectedOrder.id;
                        return (
                          <button
                            key={status}
                            onClick={() => !isActive && !isUpdating && handleStatusUpdate(selectedOrder.id, status)}
                            disabled={isActive || isUpdating}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              isActive
                                ? `${cfg.color} cursor-default`
                                : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                            } ${isUpdating ? 'opacity-50' : ''}`}
                          >
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="mb-5">
                    <p className="text-sm font-medium text-gray-700 mb-2">Danh sách món</p>
                    <div className="space-y-2">
                      {(orderDetails?.items || selectedOrder.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs font-bold">
                              x{item.quantity}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{foodNames[item.foodId] || `Món #${item.foodId}`}</p>
                              <p className="text-xs text-gray-400">Mã: {item.foodId}</p>
                            </div>
                          </div>
                          <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                    <span className="font-semibold text-gray-700">Tổng cộng</span>
                    <span className="text-xl font-bold text-orange-600">{formatPrice(orderDetails?.totalAmount || selectedOrder.totalAmount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
