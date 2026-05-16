import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/services';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.register(formData);
      if (response.success) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Đã xảy ra lỗi khi đăng ký. Tên người dùng hoặc email có thể đã tồn tại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative py-12"
      style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/f85718a8-bc3d-4b8c-af35-950967739b4b/ea857eba-057d-4780-9993-41a4a46a6f1c/VN-vi-20231106-popsignuptwoweeks-perspective_alpha_website_large.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="relative bg-black/75 p-12 rounded-md w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Đăng ký tài khoản</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
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
          
          <div className="md:col-span-2">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full bg-[#333] border-none rounded p-4 text-white placeholder-gray-500 focus:bg-[#454545] outline-none"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="w-full bg-[#333] border-none rounded p-4 text-white placeholder-gray-500 focus:bg-[#454545] outline-none"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <div>
            <input
              type="text"
              name="firstName"
              placeholder="Họ"
              className="w-full bg-[#333] border-none rounded p-4 text-white placeholder-gray-500 focus:bg-[#454545] outline-none"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <input
              type="text"
              name="lastName"
              placeholder="Tên"
              className="w-full bg-[#333] border-none rounded p-4 text-white placeholder-gray-500 focus:bg-[#454545] outline-none"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          
          <div className="md:col-span-2">
            <input
              type="text"
              name="phoneNumber"
              placeholder="Số điện thoại"
              className="w-full bg-[#333] border-none rounded p-4 text-white placeholder-gray-500 focus:bg-[#454545] outline-none"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="md:col-span-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded transition-colors disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-gray-500">
          Đã có tài khoản? <Link to="/login" className="text-white hover:underline">Đăng nhập ngay</Link>.
        </div>
      </div>
    </div>
  );
};

export default Register;
