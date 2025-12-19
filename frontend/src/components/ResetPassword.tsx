import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { HomeUtils } from '../utils/HomeUtils';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset link');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        password
      });

      setMessage(response.data.message || 'Password reset successful!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
      
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.error || 'Failed to reset password');
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
          <p className="text-xl font-semibold mb-6">Enter your new password</p>

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

          {!token ? (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-200 text-sm">
              Invalid or missing reset token
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="relative mb-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative mb-6">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-semibold mb-6 disabled:opacity-50 w-full"
              >
                {loading ? 'RESETTING...' : 'RESET PASSWORD'}
              </button>
            </form>
          )}

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

export default ResetPassword;