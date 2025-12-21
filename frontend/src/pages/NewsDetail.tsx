import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Foot from '../components/Foot';
import { FiCalendar, FiUser, FiArrowLeft } from 'react-icons/fi';
import axiosInstance from '../config/axios';

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  author: string;
  createdAt: string;
}

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  const fetchNewsDetail = async () => {
    try {
      const response = await axiosInstance.get(`/api/news/${slug}`);
      setPost(response.data.post);
      setRelatedPosts(response.data.relatedPosts);
    } catch (error) {
      console.error('Failed to fetch news detail:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">News article not found</p>
          <button
            onClick={() => navigate('/news')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="pt-[12em] px-4 lg:px-8 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold"
          >
            <FiArrowLeft /> Back to News
          </button>

          {/* Article */}
          <article className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Featured Image */}
            <div className="relative h-96 overflow-hidden">
              <img
                src={`https://civvest-backend.onrender.com${post.imageUrl}`}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x400?text=News+Image';
                }}
              />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
              
              <div className="flex items-center gap-6 text-gray-600 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <FiUser className="text-blue-600" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-blue-600" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <span className="text-sm text-gray-400">Civvest Energy Partners</span>
              </div>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <div
                    key={related.id}
                    onClick={() => navigate(`/news/${related.slug}`)}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={`https://civvest-backend.onrender.com${related.imageUrl}`}
                        alt={related.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=News';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {related.excerpt}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(related.createdAt)}
                      </p>
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

export default NewsDetail;
