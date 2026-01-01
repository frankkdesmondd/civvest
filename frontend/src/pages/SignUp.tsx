import React, { useState } from 'react';
import { HomeUtils } from '../utils/HomeUtils';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async () => {
    setError('');

    console.log('📝 Signup attempt for:', formData.email);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      console.log('📡 Sending signup request...');
      
      const response = await axios.post(
        'https://civvest-backend.onrender.com/api/auth/signup',
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          referralCode: formData.referralCode || undefined
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Signup successful:', response.data);

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

      console.log('🔀 Redirecting to dashboard');
      navigate('/');
      
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      console.error('❌ Error response:', err.response?.data);
      
      let errorMessage = 'Failed to create account';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || 'Invalid information provided';
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
      handleSignUp();
    }
  };

  return (
    <div className="flex w-full h-[50em] bg-[#041a35]">
      {/* LEFT FORM SECTION */}
      <div className="flex flex-col justify-center px-12 lg:px-20 w-full lg:w-1/2 text-white">
        <Link to="/">
          <div className="flex flex-col mb-8">
            <div className="w-[5em]">
              <img
                src={HomeUtils[0].companyLogo}
                alt="Company Logo"
                className="w-full ml-[1em]"
              />
            </div>
            <p className="text-gray-300 mt-2 tracking-widest text-[0.7em]">
              ENERGY PARTNERS
            </p>
          </div>
        </Link>

        <div className="flex flex-col w-full max-w-sm">
          <p className="text-gray-400 text-sm">Get Started</p>
          <p className="text-xl font-semibold mb-6">
            Create your Investor Account
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="mb-4 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />

          {/* PASSWORD INPUT WITH EYE ICON */}
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full px-4 py-3 pr-12 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none disabled:opacity-50"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD INPUT WITH EYE ICON */}
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full px-4 py-3 pr-12 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              disabled={loading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none disabled:opacity-50"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* REFERRAL CODE (OPTIONAL) */}
          <input
            type="text"
            name="referralCode"
            placeholder="Referral Code (Optional)"
            value={formData.referralCode}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="mb-6 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-semibold mb-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>

          <p className="text-sm text-gray-300">
            Already have an account?{' '}
            <Link to="/signin" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              Sign In
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

export default SignUp;

