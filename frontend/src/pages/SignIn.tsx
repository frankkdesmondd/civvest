import React, { useState } from 'react';
import { HomeUtils } from '../utils/HomeUtils';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');

    console.log('🔐 Login attempt:', { email, password: '***' });

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      console.log('📡 Sending request to:', 'https://civvest-backend.onrender.com/api/auth/signin');
      
      const response = await axios.post(
        'https://civvest-backend.onrender.com/api/auth/signin',
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Login successful:', response.data);

      // CRITICAL: Store token and user data BEFORE navigating
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('✅ Token stored in localStorage');
      } else {
        console.error('❌ No token received from server');
        throw new Error('No authentication token received');
      }

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ User data stored in localStorage');
      }

      // Dispatch storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(response.data.user)
      }));

      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate based on user role
      if (response.data.user.role === 'ADMIN') {
        console.log('🔀 Redirecting to admin dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('🔀 Redirecting to user dashboard');
        navigate('/dashboard');
      }
      
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      
      let errorMessage = 'Failed to sign in';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex w-full h-[120vh] bg-[#041a35]">
      {/* LEFT FORM SECTION */}
      <div className="flex flex-col justify-center px-12 lg:px-20 w-full lg:w-1/2 text-white">
        <Link to="/">
          <div className="flex flex-col mb-8">
            <div className="w-[5em]">
              <img src={HomeUtils[0].companyLogo} alt="Company Logo" className="w-full ml-[1em]" />
            </div>
            <p className="text-gray-300 mt-2 tracking-widest text-[0.7em]">ENERGY PARTNERS</p>
          </div>
        </Link>

        <div className="flex flex-col w-full max-w-sm">
          <p className="text-gray-400 text-sm">Welcome</p>
          <p className="text-xl font-semibold mb-6">log in to Investor Portal</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="mb-4 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />

          {/* PASSWORD INPUT WITH EYE ICON */}
          <div className="relative mb-6">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full px-4 py-3 pr-12 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 disabled:opacity-50"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-semibold mb-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'SIGNING IN...' : 'LOG IN'}
          </button>

          <Link to="/forgot-password">
            <p className="text-sm mb-2 hover:text-blue-400 transition-colors">Forgot Password?</p>
          </Link>
          <p className="text-sm text-gray-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
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

export default SignIn;
