import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import axiosInstance from '../config/axios';

const CreateNews: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'Energy',
    author: '',
    published: false
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('slug', formData.slug);
      data.append('content', formData.content);
      data.append('excerpt', formData.excerpt);
      data.append('category', formData.category);
      data.append('author', formData.author);
      data.append('published', String(formData.published));
      
      if (image) {
        data.append('image', image);
      }

      await axiosInstance.post('/api/news', data);

      showToast('News post created successfully!', 'success');
      navigate('/admin-dashboard');
    } catch (error: any) {
      console.error('Create news error:', error);
      showToast(error.response?.data?.error, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create News Post</h1>
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="text-sm text-blue-600 hover:text-blue-800 mt-1"
            >
              Generate slug from title
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="news-title-slug"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">URL-friendly version of the title</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Excerpt *</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Brief summary of the news..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
              placeholder="Full news content..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Energy">Energy</option>
                <option value="Investment">Investment</option>
                <option value="Market">Market</option>
                <option value="Technology">Technology</option>
                <option value="Company">Company</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Author *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="Author name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Featured Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {image && (
              <p className="text-sm text-gray-600 mt-2">Selected: {image.name}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-gray-700 font-semibold">Publish immediately</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              If unchecked, the post will be saved as draft
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create News Post'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNews;
