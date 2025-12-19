import React, { useEffect, useState } from 'react'
import { HomeUtils } from '../utils/HomeUtils'
import { FaPhoneAlt } from "react-icons/fa";
import { Link } from 'react-router-dom';
import axios from 'axios';

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  createdAt: string;
}

const Footer: React.FC = () => {
  const [latestNews, setLatestNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await axios.get('https://civvest-backend.onrender.com/api/news');
        // Get only the first 2 articles
        setLatestNews(response.data.slice(0, 2));
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex flex-col lg:flex-row px-[1.5em] lg:px-[3em] bg-[#041a35] py-[3em] lg:py-[3em] gap-[3em] lg:gap-[4em] justify-between text-center lg:text-left items-center lg:items-start">

      {/* ABOUT SECTION */}
      <div className="flex flex-col gap-[1.3em] w-full max-w-[26em]">
        <p className="text-white text-[1.5em] lg:text-[1.4em]">About Civvest Energy Partners</p>
        <div className="w-full bg-blue-300 h-[0.06em]"></div>

        <div className="flex flex-col items-center lg:items-start gap-4 lg:gap-0 justify-center lg:justify-start">
          <img src={HomeUtils[0].companyLogo} alt="" className="w-[8em]" />
          <p className="text-[1.2em] lg:text-[1.8em] text-white leading-9">ENERGY PARTNERS</p>
        </div>

        <p className="text-white">
          Civvest Energy Partners offers accredited investors exclusive access to
          high performing oil and gas investment opportunities designed to
          strengthen portfolio diversification and long-term returns.
        </p>

        <Link to="/our-company">
          <button className="text-blue-300 px-[1em] border border-blue-300 rounded-[0.6em] py-[0.6em] font-bold text-[1.2em] w-full sm:w-[14.6em] mx-auto lg:mx-0 cursor-pointer hover:bg-blue-300 hover:text-[#244772]">
            More About Our Company
          </button>
        </Link>
      </div>

      {/* CONTACT SECTION */}
      <div className="flex flex-col gap-[1.3em] w-full max-w-[26em]">
        <p className="text-white text-[1.5em] lg:text-[1.4em]">Contact Us To Invest</p>
        <div className="w-full bg-blue-300 h-[0.06em]"></div>

        <p className="text-white">
          Are you interested in adding oil and gas investments to your portfolio?
        </p>

        <Link to="/contact-us">
          <button className="text-blue-300 px-[1em] border border-blue-300 rounded-[0.6em] py-[0.6em] font-bold text-[1.2em] w-full sm:w-[13em] mx-auto lg:mx-0 cursor-pointer hover:bg-blue-300 hover:text-[#244772]">
            Contact Us to Find Out
          </button>
        </Link>

        <div className="flex gap-2 text-white items-center justify-center lg:justify-start">
          <FaPhoneAlt className="text-[1.3em]" />
          <p>(929) 248-1175</p>
        </div>

        <div className="flex flex-col text-white items-center lg:items-start">
          <p className="font-bold">Civvest Energy Partners</p>
          <p className="w-full max-w-[15em]">
            Dallas, Texas
          </p>
        </div>
      </div>

      {/* NEWS SECTION */}
      <div className="flex flex-col text-white gap-[1.3em] w-full max-w-[24em]">
        <p className="text-[1.5em] lg:text-[1.4em]">Latest News</p>
        <div className="w-full bg-blue-300 h-[0.06em]"></div>

        {loading ? (
          <div className="text-gray-400 text-sm">Loading news...</div>
        ) : latestNews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {latestNews.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="flex gap-3 hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                {/* News Image */}
                <div className="w-[5em] h-[5em] shrink-0 rounded overflow-hidden bg-gray-700">
                  <img
                    src={`https://civvest-backend.onrender.com${article.imageUrl}`}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/80x80?text=News';
                    }}
                  />
                </div>

                {/* News Details */}
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-sm font-medium text-white hover:text-blue-300 transition-colors line-clamp-2 mb-1">
                    {article.title}
                  </h3>
                  <div className="flex flex-col gap-1 text-xs text-gray-400">
                    <span>{formatDate(article.createdAt)}</span>
                    <span>{formatTime(article.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No news available</p>
        )}

        <Link to='/news'>
          <button className="text-blue-300 px-[1em] border border-blue-300 rounded-[0.6em] py-[0.6em] font-bold text-[1.2em] w-full sm:w-[9em] mx-auto lg:mx-0 cursor-pointer hover:bg-blue-300 hover:text-[#244772]">
            View All News
          </button>
        </Link>
      </div>

    </div>
  );
};

export default Footer;







