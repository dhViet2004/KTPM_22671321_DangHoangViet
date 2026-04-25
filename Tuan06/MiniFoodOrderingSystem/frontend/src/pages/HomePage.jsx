import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { foodApi } from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await foodApi.get('/api/foods');
      setFoods(response.data);
    } catch (err) {
      console.error('Failed to fetch foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (food) => {
    if (!user) {
      return;
    }
    
    setAddingToCart(food.id);
    setTimeout(() => {
      addItem(food);
      setAddingToCart(null);
    }, 300);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Khám phá <span className="text-primary-500">ẩm thực</span>
        </h1>
        <p className="text-gray-500 text-lg">Chọn món yêu thích, giao hàng tận nơi</p>
      </div>

      {foods.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500 text-lg">Không có món ăn nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods.map((food) => (
            <div key={food.id} className="card group hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                {food.imageUrl ? (
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"
                  style={{ display: food.imageUrl ? 'none' : 'flex' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                  {food.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2 min-h-[40px]">
                  {food.description || 'Món ăn ngon'}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-bold text-lg">
                    {formatPrice(food.price)}
                  </span>
                  
                  <button
                    onClick={() => handleAddToCart(food)}
                    disabled={!user || addingToCart === food.id}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
                      transition-all duration-200 active:scale-95
                      ${!user 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : addingToCart === food.id 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50'
                      }
                    `}
                  >
                    {addingToCart === food.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang thêm...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Thêm vào giỏ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-2xl text-center">
          <p className="text-primary-700">
            <Link to="/login" className="font-semibold underline hover:no-underline">Đăng nhập</Link>
            {' '}để thêm món vào giỏ hàng
          </p>
        </div>
      )}
    </div>
  );
}
