import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { foodApi, orderApi, userApi, paymentApi } from '../../api/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalFoods: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [foodsRes, ordersRes, usersRes, paymentsRes] = await Promise.allSettled([
        foodApi.getAll(),
        orderApi.getAll(),
        userApi.getAll(),
        paymentApi.getAll(),
      ]);

      let totalFoods = 0, totalOrders = 0, totalUsers = 0, totalRevenue = 0, pendingOrders = 0;

      if (foodsRes.status === 'fulfilled') totalFoods = foodsRes.value.data?.length || 0;
      if (usersRes.status === 'fulfilled') totalUsers = usersRes.value.data?.length || 0;

      if (ordersRes.status === 'fulfilled') {
        const orders = ordersRes.value.data || [];
        totalOrders = orders.length;
        pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        setRecentOrders(orders.slice(0, 5));
      }

      if (paymentsRes.status === 'fulfilled') {
        const payments = paymentsRes.value.data || [];
        totalRevenue = payments
          .filter(p => p.success)
          .reduce((sum, p) => {
            const order = ordersRes.status === 'fulfilled'
              ? (ordersRes.value.data || []).find(o => o.id === p.orderId)
              : null;
            return sum + (order?.totalAmount || 0);
          }, 0);
      }

      setStats({ totalFoods, totalOrders, totalUsers, totalRevenue, pendingOrders });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const statCards = [
    {
      label: 'Tổng món ăn',
      value: stats.totalFoods,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-orange-400 to-orange-600',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      link: '/admin/foods',
    },
    {
      label: 'Tổng đơn hàng',
      value: stats.totalOrders,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-blue-400 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      link: '/admin/orders',
    },
    {
      label: 'Đơn chờ xử lý',
      value: stats.pendingOrders,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-yellow-400 to-yellow-600',
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      link: '/admin/orders',
    },
    {
      label: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      link: '/admin/users',
    },
    {
      label: 'Doanh thu',
      value: formatPrice(stats.totalRevenue),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-400 to-green-600',
      bg: 'bg-green-50',
      text: 'text-green-600',
      link: '/admin/payments',
    },
  ];

  const statusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan hệ thống MiniFood</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <Link
            key={idx}
            to={card.link}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.text} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Doanh thu</h2>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500">Đơn hàng</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Chờ xử lý</p>
              <p className="text-lg font-semibold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Đã thanh toán</p>
              <p className="text-lg font-semibold text-green-600">{stats.totalOrders - stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Thêm món ăn', icon: '+', href: '/admin/foods', color: 'orange' },
              { label: 'Xem đơn hàng', icon: '📋', href: '/admin/orders', color: 'blue' },
              { label: 'Quản lý người dùng', icon: '👥', href: '/admin/users', color: 'purple' },
              { label: 'Xem thanh toán', icon: '💳', href: '/admin/payments', color: 'green' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                  action.color === 'orange' ? 'hover:border-orange-200 hover:bg-orange-50' :
                  action.color === 'blue' ? 'hover:border-blue-200 hover:bg-blue-50' :
                  action.color === 'purple' ? 'hover:border-purple-200 hover:bg-purple-50' :
                  'hover:border-green-200 hover:bg-green-50'
                }`}
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            Xem tất cả →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 font-semibold">Mã đơn</th>
                  <th className="pb-3 font-semibold">Khách hàng</th>
                  <th className="pb-3 font-semibold">Tổng tiền</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-semibold text-gray-900">#{order.id}</td>
                    <td className="py-3 text-sm text-gray-600">User #{order.userId}</td>
                    <td className="py-3 text-sm font-medium text-gray-900">{formatPrice(order.totalAmount)}</td>
                    <td className="py-3">
                      <span className={`badge ${statusColor(order.status)}`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
