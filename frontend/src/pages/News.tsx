import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Foot from '../components/Foot';
import { FiCalendar, FiUser } from 'react-icons/fi';
import NewsImage from '../assets/news image.jpg'
import { HomeUtils } from '../utils/HomeUtils';
import axiosInstance from '../config/axios';

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  author: string;
  createdAt: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axiosInstance.get('/api/news');
      setNews(response.data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#041a35] flex flex-col items-center justify-center">
        <img src={HomeUtils[0].companyLogo} alt="" className='w-[8em]'/>
        <p className='text-white'>Page Loading......</p>
      </div>
    );
  }

  return (
  <div>
    <Navbar />

    {/* HERO SECTION WITH BACKGROUND */}
    <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh]">
      <img
        src={NewsImage}
        alt="News"
        className="w-full h-full object-cover"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-[#041a35]/80"></div>

      {/* CENTERED TITLE */}
      <div className="absolute inset-0 flex items-center justify-center mt-[4em]">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-serif text-center">
          Latest News
        </h1>
      </div>
    </div>

    {/* MAIN CONTENT */}
    <div className="relative z-10 -mt-16 px-4 md:px-8 pb-20">
      <div className="max-w-7xl mx-auto">

        {news.length === 0 ? (
          <div className="text-center py-12 mt-[4em]">
            <p className="text-gray-500 text-lg">
              No news articles available at the moment.
            </p>
          </div>
        ) : (
          <div className="bg-gray-200 p-6 md:p-10 rounded-2xl shadow-xl">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/news/${post.slug}`)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer 
                             transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`https://civvest-backend.onrender.com${post.imageUrl}`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x300?text=News+Image";
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-blue-600" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiUser className="text-blue-600" />
                        <span>{post.author}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-gray-400">
                        Civvest Energy Partners
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>

    <Footer />
    <Foot />
  </div>
);
};

export default News;
