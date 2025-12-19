import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { HomeUtils } from '../utils/HomeUtils';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const SignUp: React.FC = () => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async () => {
    setError('');

    if (!captchaToken) {
      setError("Please verify that you're not a robot.");
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
      const response = await axios.post(
        'https://civvest-backend.onrender.com/api/auth/signup',
        { ...formData, captchaToken },
        { withCredentials: true }
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
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
              className="flex-1 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="mb-4 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* PASSWORD INPUT WITH EYE ICON */}
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD INPUT WITH EYE ICON */}
          <div className="relative mb-3">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <div className="my-4">
            <ReCAPTCHA
              sitekey={siteKey}
              onChange={handleCaptchaChange}
              theme="dark"
            />
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-semibold mb-4 disabled:opacity-50"
          >
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>

          <p className="text-sm text-gray-300">
            Already have an account?{' '}
            <Link to="/signin" className="text-blue-400 font-semibold">
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




