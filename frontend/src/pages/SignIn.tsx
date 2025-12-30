import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { HomeUtils } from '../utils/HomeUtils';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // import eye icons

const SignIn: React.FC = () => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // new state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleLogin = async () => {
    setError('');

    console.log('Login attempt:', { email, password: '***', captchaToken: !!captchaToken });

    if (!captchaToken) {
      setError("Please verify that you're not a robot.");
      return;
    }

    setLoading(true);

    try {
      console.log('Sending request to:', 'https://civvest-backend.onrender.com/api/auth/signin');
      const response = await axios.post('https://civvest-backend.onrender.com/api/auth/signin', {
        email,
        password,
        captchaToken
      }, { withCredentials: true });

      console.log('Login response:', response.data);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
      
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to sign in');
    } finally {
      setLoading(false);
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
            className="mb-4 px-4 py-3 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* PASSWORD INPUT WITH EYE ICON */}
          <div className="relative mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-md bg-[#0a2c52] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <div className="my-4">
            <ReCAPTCHA sitekey={siteKey} onChange={handleCaptchaChange} theme="dark" />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-semibold mb-6 disabled:opacity-50"
          >
            {loading ? 'SIGNING IN...' : 'LOG IN'}
          </button>

          <Link to="/forgot-password">
            <p className="text-sm mb-2">Forgot Password?</p>
          </Link>
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

export default SignIn;





