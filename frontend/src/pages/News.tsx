import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Foot from '../components/Foot';
import { FiCalendar, FiUser } from 'react-icons/fi';
import NewsImage from '../assets/news image.jpg'
import { HomeUtils } from '../utils/HomeUtils';
import axiosInstance from '../config/axios';
import AOS from "aos";
import "aos/dist/aos.css";
import { useSEO } from "../hooks/useSEO";

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
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
    AOS.refresh();

    fetchNews();
  }, []);

  useSEO({
    title: "Bond Plans",
    description: "See our major offerings. Be part of this grand plan in the next phase of oil Investment.",
    keywords: "Civvest company, energy company, executive team, oil and gas investment, renewable energy company, Texas energy",
    image: "https://www.civvest.com/civvest logo.jpg",
    url: "https://www.civvest.com/news",
    type: "website"
  });

  useEffect(() => {
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.civvest.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Bond Plans",
          "item": "https://www.civvest.com/news"
        }
      ]
    });
    document.head.appendChild(breadcrumbScript);
    
    return () => {
      breadcrumbScript.remove();
    };
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

  // ✅ FIX: Create proper image URL
  const getImageUrl = (imageUrl: string): string => {
    if (!imageUrl) {
      return '/default-news-image.jpg';
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/uploads/')) {
      return `https://civvest-backend.onrender.com${imageUrl}`;
    }
    
    return `https://civvest-backend.onrender.com${imageUrl}`;
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
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Civvest Energy Partners",
          "url": "https://www.civvest.com",
          "logo": "https://www.civvest.com/civvest logo.jpg",
          "description": "Leading renewable energy investment platform providing sustainable energy solutions",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Dallas, Texas",
            "addressCountry": "USA"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "(192)924-81175",
            "contactType": "Customer Service"
          }
        })}
      </script>
      <Navbar />

      {/* HERO SECTION WITH BACKGROUND */}
      <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh]" data-aos="fade-up">
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
      <div className="relative z-10 -mt-16 px-4 md:px-8 pb-20" data-aos="fade-up">
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
                    {/* Image - ✅ FIXED: No fallback, just show actual image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getImageUrl(post.imageUrl)}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        // ✅ REMOVED onError handler - let it show broken image if not available
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

                      {/* Date and Author Section */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <div className="flex flex-col mb-3 lg:mb-0 lg:flex-row lg:items-center lg:gap-6">
                          <div className="flex items-center gap-2 mb-2 lg:mb-0">
                            <FiCalendar className="text-blue-600" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <FiUser className="text-blue-600" />
                            <span>{post.author}</span>
                          </div>
                        </div>

                        <div className="lg:text-right">
                          <p className="text-xs text-gray-400">
                            Civvest Energy Partners
                          </p>
                        </div>
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

