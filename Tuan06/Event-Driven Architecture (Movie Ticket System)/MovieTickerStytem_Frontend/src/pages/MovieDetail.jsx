import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { moviesApi, showtimesApi } from '@/api/services';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

const MovieDetail = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        // Lấy chi tiết phim
        const movieData = await moviesApi.getMovieById(movieId);
        setMovie(movieData);
        
        // Lấy lịch chiếu (giả sử có API này)
        try {
          const showtimeData = await showtimesApi.getShowtimesByMovie(movieId);
          setShowtimes(showtimeData);
        } catch (err) {
          console.warn('Could not fetch showtimes', err);
        }
      } catch (error) {
        console.error('Error fetching movie detail:', error);
        toast.error('Không thể tải thông tin phim');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400 mb-6">Không tìm thấy phim yêu cầu</p>
          <Link to="/" className="bg-red-600 text-white px-6 py-2 rounded font-bold">Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  const posterUrl = `https://placehold.co/600x900/1a1a1a/e50914?text=${encodeURIComponent(movie.title)}`;

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Navbar />
      
      {/* Backdrop Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110 opacity-30"
          style={{ backgroundImage: `url(${posterUrl})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent"></div>
        
        <div className="container mx-auto px-4 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="hidden md:block w-64 aspect-[2/3] rounded-lg shadow-2xl overflow-hidden border border-gray-800">
              <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">HOT</span>
                <span className="text-yellow-500 font-bold">★ {movie.rating}</span>
                <span className="text-gray-400">| {movie.genre}</span>
                <span className="text-gray-400">| {movie.language}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{movie.title}</h1>
              <p className="text-lg text-gray-300 max-w-3xl line-clamp-3 md:line-clamp-none mb-6">
                {movie.description}
              </p>
              
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1 uppercase tracking-wider text-xs">Thời lượng</span>
                  <span className="font-bold">{movie.durationMinutes || movie.duration} phút</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1 uppercase tracking-wider text-xs">Ngày phát hành</span>
                  <span className="font-bold">{movie.releaseDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold border-l-4 border-red-600 pl-4">Lịch chiếu</h2>
        </div>

        {showtimes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {showtimes.map((showtime) => (
              <div 
                key={showtime.id}
                className="bg-[#181818] p-6 rounded-xl border border-gray-800 hover:border-red-600 transition-all group cursor-pointer"
                onClick={() => navigate(`/booking/${movieId}/${showtime.id}`)}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold group-hover:text-red-500 transition-colors">
                    {showtime.startTime}
                  </span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                    2D Phụ đề
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>{showtime.theaterName || 'Rạp 01'}</p>
                  <p className="mt-1">Còn {showtime.availableSeats || 0} ghế trống</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#181818] p-12 rounded-xl text-center border border-dashed border-gray-800">
            <p className="text-gray-500 mb-4">Hiện tại chưa có lịch chiếu cho phim này.</p>
            <button 
              className="text-red-500 hover:underline font-bold"
              onClick={() => toast.success('Đã gửi yêu cầu thông báo cho bạn')}
            >
              Nhận thông báo khi có lịch chiếu
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2024 MovieTicketSystem. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MovieDetail;
