import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.login(formData);
      if (response.success) {
        login(response.data, response.data.token);
        toast.success('Đăng nhập thành công!');
        navigate('/');
      } else {
        toast.error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/f85718a8-bc3d-4b8c-af35-950967739b4b/ea857eba-057d-4780-9993-41a4a46a6f1c/VN-vi-20231106-popsignuptwoweeks-perspective_alpha_website_large.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="relative bg-black/75 p-16 rounded-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8">Đăng nhập</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="w-full bg-[#333] border-none rounded p-4 text-white placeholder-gray-500 focus:bg-[#454545] outline-none"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="w-full bg-[#333] border-none rounded p-4 text-white placeholder-gray-500 focus:bg-[#454545] outline-none"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="mt-8 text-gray-500">
          Mới tham gia? <Link to="/register" className="text-white hover:underline">Đăng ký ngay</Link>.
        </div>
      </div>
    </div>
  );
};

export default Login;
