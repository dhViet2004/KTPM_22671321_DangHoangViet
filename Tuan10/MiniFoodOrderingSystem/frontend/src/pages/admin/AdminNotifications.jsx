import { useState, useEffect } from 'react';
import { notificationApi, userApi, orderApi } from '../../api/adminApi';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({ userId: '', orderId: '', message: '' });
  const [sending, setSending] = useState(false);
  const [userNames, setUserNames] = useState({});
  const [orderInfo, setOrderInfo] = useState({});
  const [stats, setStats] = useState({ total: 0, sent: 0, today: 0 });

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      const userIds = [...new Set(notifications.map(n => n.userId).filter(Boolean))];
      const orderIds = [...new Set(notifications.map(n => n.orderId).filter(Boolean))];

      userIds.forEach(async (uid) => {
        if (!userNames[uid]) {
          try {
            const res = await userApi.getById(uid);
            setUserNames(prev => ({ ...prev, [uid]: res.data?.username || `User #${uid}` }));
          } catch { /* ignore */ }
        }
      });

      orderIds.forEach(async (oid) => {
        if (!orderInfo[oid]) {
          try {
            const res = await orderApi.getById(oid);
            setOrderInfo(prev => ({ ...prev, [oid]: res.data }));
          } catch { /* ignore */ }
        }
      });
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getAll();
      const data = res.data || [];
      setNotifications(data);

      const today = new Date().toDateString();
      const sentCount = data.filter(n => n.sent).length;
      const todayCount = data.filter(n => n.createdAt && new Date(n.createdAt).toDateString() === today && n.sent).length;
      setStats({ total: data.length, sent: sentCount, today: todayCount });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await notificationApi.send({
        userId: parseInt(sendForm.userId),
        orderId: parseInt(sendForm.orderId),
        message: sendForm.message,
      });
      setShowSendModal(false);
      setSendForm({ userId: '', orderId: '', message: '' });
      fetchNotifications();
    } catch (err) {
      alert('Gửi thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thông báo</h1>
          <p className="text-gray-500 mt-1">Lịch sử gửi thông báo và gửi thông báo mới</p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Gửi thông báo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Tổng thông báo</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Đã gửi thành công</p>
          <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Hôm nay</p>
          <p className="text-2xl font-bold text-orange-600">{stats.today}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">Chưa có thông báo nào</p>
            <button onClick={() => setShowSendModal(true)} className="text-orange-500 hover:text-orange-600 font-medium">
              Gửi thông báo đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold">Đơn hàng</th>
                  <th className="px-6 py-4 font-semibold">Nội dung</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-400">#{notif.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">
                          {userNames[notif.userId]?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {userNames[notif.userId] || `User #${notif.userId}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">#{notif.orderId}</span>
                      {orderInfo[notif.orderId] && (
                        <span className="ml-2 text-xs text-gray-400">
                          ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderInfo[notif.orderId].totalAmount)})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 max-w-xs truncate">{notif.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      {notif.sent ? (
                        <span className="badge bg-green-100 text-green-700">Đã gửi</span>
                      ) : (
                        <span className="badge bg-red-100 text-red-700">Thất bại</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{formatDate(notif.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Gửi thông báo mới</h2>
              <button onClick={() => setShowSendModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSend} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">User ID <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min={1}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={sendForm.userId}
                  onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
                  placeholder="VD: 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Order ID <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min={1}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={sendForm.orderId}
                  onChange={(e) => setSendForm({ ...sendForm, orderId: e.target.value })}
                  placeholder="VD: 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung thông báo <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                  placeholder="Nhập nội dung thông báo..."
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Đang gửi...' : 'Gửi thông báo'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
