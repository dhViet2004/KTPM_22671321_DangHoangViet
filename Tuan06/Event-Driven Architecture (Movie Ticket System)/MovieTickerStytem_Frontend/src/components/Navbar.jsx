import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-red-600 tracking-tighter">
          MOVIE<span className="text-white">TICKET</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-red-500 transition-colors">
            Trang chủ
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-xs">
                  {user?.username?.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium group-hover:text-red-500 transition-colors">
                  {user?.username}
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-sm font-medium hover:text-red-500 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
