import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HomeUtils } from '../utils/HomeUtils';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('https://civvest-backend.onrender.com/api/auth/forgot-password', {
        email
      });

      setMessage(response.data.message || 'Reset link sent to your email!');
      
      // Clear form
      setEmail('');
      
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#041a35]">
      {/* LEFT FORM SECTION */}
      <div className="flex flex-col justify-center px-12 lg:px-20 w-full lg:w-1/2 text-white">
        <Link to="/">
          <div className="flex flex-col mb-8">
            <div className="w-[5em]">
              <img src={HomeUtils[0].companyLogo} alt="Company Logo" className="w-full" />
            </div>
            <p className="text-gray-300 mt-2 tracking-widest text-[0.7em]">ENERGY PARTNERS</p>
          </div>
        </Link>

        <div className="flex flex-col w-full max-w-sm">
          <p className="text-gray-400 text-sm">Reset Password</p>
          <p className="text-xl font-semibold mb-6">Enter your email to receive a reset link</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-200 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 w-full"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-semibold mb-6 disabled:opacity-50 w-full"
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>

          <div className="flex items-center justify-between mb-4">
            <Link to="/signin" className="text-sm text-blue-400 hover:text-blue-300">
              ← Back to Login
            </Link>
          </div>

          <p className="text-sm text-gray-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT IMAGE SECTION */}
      <div className="hidden lg:flex w-1/2 h-full">
        <img
          src={HomeUtils[0].signUpLogo}
          alt="Signup Side"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
