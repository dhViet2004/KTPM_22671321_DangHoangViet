import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderApi, paymentApi } from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [order, setOrder] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: create order, 2: payment
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        userId: user.id || 1, // Use user's ID or fallback to 1
        items: items.map(item => ({
          foodId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await orderApi.post('/api/orders', orderData);
      setOrder(response.data);
      setStep(2);
    } catch (err) {
      alert('Tạo đơn hàng thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    setLoading(true);

    try {
      const paymentData = {
        orderId: order.id,
        paymentMethod: paymentMethod,
      };

      const response = await paymentApi.post('/api/payments', paymentData);
      setPaymentResult(response.data);

      if (response.data.success) {
        clearCart();
      }
    } catch (err) {
      alert('Thanh toán thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (paymentResult?.success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mb-6">
            Cảm ơn bạn đã đặt hàng. Đơn hàng #{order.id} đang được xử lý.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Mã đơn hàng</span>
              <span className="font-bold text-gray-900">#{order.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Phương thức thanh toán</span>
              <span className="font-medium text-gray-900">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền</span>
              <span className="font-bold text-primary-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          <Link to="/" className="btn-primary inline-block">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Xác nhận đơn hàng</h1>
          <p className="text-gray-500 mt-2">Kiểm tra thông tin trước khi tạo đơn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-gray-500 text-sm">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin thanh toán</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Người đặt</span>
                  <span className="font-medium text-gray-900">{user?.username}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="font-bold text-primary-600 text-xl">{formatPrice(getTotal())}</span>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={loading || items.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo đơn...' : 'Tạo đơn hàng'}
              </button>

              <Link to="/cart" className="block text-center mt-4 text-gray-500 hover:text-primary-500 font-medium">
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2 && order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đơn hàng đã được tạo!</h2>
            <p className="text-gray-500">Mã đơn hàng: <span className="font-bold text-primary-600">#{order.id}</span></p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tổng tiền</span>
              <span className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái</span>
              <span className="badge bg-yellow-100 text-yellow-700">{order.status}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Chọn phương thức thanh toán</h3>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'COD' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-primary-600"
                />
                <div className="ml-3 flex-1">
                  <span className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                  <p className="text-sm text-gray-500">Trả tiền mặt khi nhận được đơn hàng</p>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'BANKING' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="BANKING"
                  checked={paymentMethod === 'BANKING'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-primary-600"
                />
                <div className="ml-3 flex-1">
                  <span className="font-medium text-gray-900">Chuyển khoản ngân hàng</span>
                  <p className="text-sm text-gray-500">Thanh toán qua tài khoản ngân hàng</p>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
