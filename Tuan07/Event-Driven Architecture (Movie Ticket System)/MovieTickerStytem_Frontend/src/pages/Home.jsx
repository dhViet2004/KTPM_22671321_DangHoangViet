import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moviesApi } from '@/api/services';
import Navbar from '@/components/Navbar';

/**
 * Home Page - Trang chủ hiển thị danh sách phim
 */
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const data = await moviesApi.getAllMovies();
        
        // Ánh xạ dữ liệu từ API sang cấu trúc của Component
        const mappedMovies = data.map(movie => ({
          ...movie,
          duration: movie.durationMinutes || movie.duration,
          // API chưa có poster, sử dụng ảnh mặc định dựa trên genre hoặc ảnh placeholder
          poster: movie.poster || `https://placehold.co/400x600/1a1a1a/e50914?text=${encodeURIComponent(movie.title)}`
        }));
        
        setMovies(mappedMovies);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Không thể tải danh sách phim từ server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Mock data for demo (thay thế bằng API call thực tế)
  const mockMovies = [
    {
      id: 'MOV001',
      title: 'Avengers: Endgame',
      poster: 'https://image.tmdb.org/t/p/w500/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
      genre: 'Hành động, Phiêu lưu',
      duration: 181,
      rating: 8.5,
    },
    {
      id: 'MOV002',
      title: 'Spider-Man: No Way Home',
      poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      genre: 'Hành động, Phiêu lưu',
      duration: 148,
      rating: 8.3,
    },
    {
      id: 'MOV003',
      title: 'The Batman',
      poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      genre: 'Hành động, Tội phạm',
      duration: 176,
      rating: 7.9,
    },
    {
      id: 'MOV004',
      title: 'Dune',
      poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
      genre: 'Khoa học viễn tưởng',
      duration: 155,
      rating: 8.1,
    },
    {
      id: 'MOV005',
      title: 'Top Gun: Maverick',
      poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
      genre: 'Hành động, Drama',
      duration: 131,
      rating: 8.4,
    },
    {
      id: 'MOV006',
      title: 'Jurassic World: Dominion',
      poster: 'https://image.tmdb.org/t/p/w500/bOlb3l8L2vP1bcsT2QJqBXFWCiQ.jpg',
      genre: 'Hành động, Khoa học viễn tưởng',
      duration: 147,
      rating: 6.2,
    },
  ];

  const displayMovies = movies.length > 0 ? movies : mockMovies;

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-t from-netflix-black via-transparent to-transparent">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://image.tmdb.org/t/p/w1920/p1F51Lvj3sMopG948F5HsBbl43C.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/50 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              MovieTicketSystem
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Đặt vé xem phim trực tuyến dễ dàng với hệ thống đặt vé thông minh
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-colors">
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Phim đang chiếu</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {displayMovies.map((movie) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                          {movie.rating}
                        </span>
                        <span className="text-gray-300 text-xs">
                          {movie.duration}p
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-sm group-hover:text-red-500 transition-colors line-clamp-2">
                  {movie.title}
                </h3>
                <p className="text-gray-500 text-xs mt-1">{movie.genre}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>MovieTicketSystem - Cinema Booking Application</p>
          <p className="text-sm mt-2">Event-Driven Architecture Demo</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
