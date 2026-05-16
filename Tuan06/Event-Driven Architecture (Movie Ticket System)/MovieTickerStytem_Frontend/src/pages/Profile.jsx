import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/services';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.getProfile();
        if (response.success) {
          setProfileData(response.data);
          updateUser(response.data); // Đồng bộ dữ liệu mới nhất vào store
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
        toast.error('Không thể tải thông tin cá nhân');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [updateUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayData = profileData || user;

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto bg-[#141414] rounded-lg overflow-hidden border border-gray-800">
          <div className="bg-gradient-to-r from-red-600 to-red-900 h-32 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-lg bg-gray-900 border-4 border-[#141414] flex items-center justify-center text-4xl font-bold text-red-600">
                {displayData?.username?.substring(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
          
          <div className="pt-16 px-8 pb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold">{displayData?.username}</h1>
                <p className="text-gray-400">{displayData?.email}</p>
              </div>
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {displayData?.role}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-800 pt-8">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Thông tin cơ bản</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Họ và tên</label>
                    <p className="text-lg font-medium">
                      {displayData?.firstName || displayData?.lastName 
                        ? `${displayData.firstName || ''} ${displayData.lastName || ''}`.trim() 
                        : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Số điện thoại</label>
                    <p className="text-lg font-medium">{displayData?.phoneNumber || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Tài khoản</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">User ID</label>
                    <p className="text-xs font-mono text-gray-400">{displayData?.id}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Loại tài khoản</label>
                    <p className="text-lg font-medium capitalize">{displayData?.role?.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <button 
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded font-medium transition-colors"
                onClick={() => toast.error('Tính năng cập nhật hồ sơ đang được phát triển')}
              >
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
