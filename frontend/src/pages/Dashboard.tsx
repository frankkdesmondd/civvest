import React, { useState, useEffect } from "react";
import CivvestLogo from '../assets/civvest company logo.png'
import {
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiActivity,
  FiMenu,
  FiHome,
  FiLayers,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import axiosInstance from "../config/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate, Link } from "react-router-dom";
import OilChart from "../components/OilChart";
import { HomeUtils } from "../utils/HomeUtils";
import { useToast } from '../context/ToastContext';
import WithdrawalModal from "../components/WithdrawalModal";
import axios from "axios";
import { useUser } from "../context/UserContext";
import ProfilePicture from "../components/ProfilePicture";

interface Investment {
  id: string;
  amount: number;
  returnAmount: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  daysRemaining?: number | null;
  progress?: number;
  isMatured?: boolean;
  canWithdraw?: boolean;
  investment: {
    title: string;
    category: string;
    returnRate: string;
  };
}

interface UserProfile {
  bankName: string | null;
  accountName: string | null;
  bankAccountNumber: string | null;
  routingCode: string | null;
  wallets: any[];
}

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useUser();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [oilPrices, setOilPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile, sidebar starts collapsed
      if (mobile) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/signin");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role === "ADMIN") {
      navigate("/admin-dashboard");
      return;
    }

    fetchAllData();

    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);

    // Listen for user updates from other components
    const handleUserUpdate = (event: StorageEvent) => {
      if (event.key === 'user' && event.newValue) {
        refreshUser();
      }
    };

    // Listen for custom event for user updates within same tab
    const handleCustomUserUpdate = (event: CustomEvent) => {
      if (event.detail?.user) {
        refreshUser();
      }
    };

    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('userUpdated', handleCustomUserUpdate as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('userUpdated', handleCustomUserUpdate as EventListener);
    };
  }, [navigate]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUserData(),
      fetchInvestments(),
      fetchUserProfile(),
      generateOilPriceData()
    ]);
  };

  const fetchUserData = async () => {
    try {
      setError(null);
      await refreshUser();
    } catch (error: any) {
      console.error("Failed to fetch user data:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("user");
        navigate("/signin");
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      try {
        const altResponse = await axiosInstance.get('/api/profile');
        setUserProfile(altResponse.data);
      } catch (altError) {
        console.error('Failed to fetch profile from alternative endpoint:', altError);
      }
    }
  };

  const fetchInvestments = async () => {
    try {
      setError(null);
      const response = await axiosInstance.get('/api/user-investments/my-investments');
      
      console.log("Investments fetched:", response.data);
      setInvestments(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error("Failed to fetch investments:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("user");
        navigate("/signin");
      } else {
        setError("Failed to load investments");
      }
      setLoading(false);
    }
  };

  const generateOilPriceData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const data = months.map((month) => ({
      month,
      price: Math.floor(Math.random() * 20) + 70,
    }));
    setOilPrices(data);
  };

  const handleWithdrawClick = (investment: Investment) => {
    console.log('Selected investment:', investment);
    console.log('Investment ID:', investment.id);
    console.log('Investment amount:', investment.amount);
    console.log('Return amount:', investment.returnAmount);
    
    setSelectedInvestment(investment);
    setShowModal(true);
  };

  const handleConfirmWithdrawal = async (withdrawalData: any) => {
    try {
      console.log('Withdrawal data being sent:', withdrawalData);
      console.log('Investment ID:', withdrawalData.userInvestmentId);
      
      // Validate that userInvestmentId exists
      if (!withdrawalData.userInvestmentId) {
        showToast('Error: Investment ID is missing', "error");
        return;
      }

      try {
        const response = await axiosInstance.post(
          '/api/withdrawals/request',
          withdrawalData,
          { withCredentials: true }
        );
        
        console.log('Withdrawal response:', response.data);
        showToast(response.data.message, "success");
        fetchAllData();
        setShowModal(false);
        setSelectedInvestment(null);
      } catch (instanceError: any) {
        console.log('axiosInstance failed, trying direct axios...');
        
        const directResponse = await axios.post(
          'https://civvest-backend.onrender.com/api/withdrawals/request',
          withdrawalData,
          { withCredentials: true }
        );
        
        console.log('Direct withdrawal response:', directResponse.data);
        showToast(directResponse.data.message, "success");
        fetchAllData();
        setShowModal(false);
        setSelectedInvestment(null);
      }
      
    } catch (error: any) {
      console.error('Full withdrawal error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 404) {
        showToast('Withdrawal route not found. Please check API configuration.', "error");
      } else if (error.response?.data?.error) {
        showToast(error.response.data.error, "error");
      } else if (error.message) {
        showToast(error.message, "error");
      } else {
        showToast('Failed to submit withdrawal request', "error");
      }
    }
  };

  const calculateTotalInvested = () => {
    return investments
      .filter((inv) => inv.status === "ACTIVE" || inv.status === "PENDING")
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Format number without decimals
  const formatNumber = (num: number) => {
    return Math.floor(num).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#041a35] flex flex-col items-center justify-center">
        <img src={HomeUtils[0].companyLogo} alt="" className='w-16 sm:w-20 md:w-24 lg:w-32'/>
        <p className='text-white mt-4 text-base sm:text-lg md:text-xl'>Page Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#041a35] flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded max-w-md w-full">
          <p className="text-sm sm:text-base">{error}</p>
          <button 
            onClick={() => navigate("/signin")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm sm:text-base w-full sm:w-auto"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">User not found. Please login again.</p>
          <button 
            onClick={() => navigate("/signin")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const Sidebar = () => (
    <div
      className={`bg-gray-900 text-white h-screen fixed top-0 left-0 transition-all duration-300 flex flex-col z-30 ${
        collapsed ? "w-16 sm:w-16 md:w-20" : "w-64 sm:w-64 md:w-72"
      }`}
      style={{ 
        height: '100vh',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#4B5563 #1F2937'
      }}
    >
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
        {!collapsed && (
          <img 
            src={CivvestLogo} 
            alt="Civvest Logo" 
            className="w-10 sm:w-12 md:w-16"
          />
        )}

        <button
          onClick={toggleSidebar}
          className="text-xl sm:text-2xl cursor-pointer hover:text-gray-300 transition-colors p-1"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiMenu/> : <FiMenu/>}
        </button>
      </div>

      <div className="flex-1 mt-4 sm:mt-6 space-y-2 sm:space-y-3 px-2 sm:px-3">
        <Link
          to="/"
          className="flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded"
          onClick={() => isMobile && setCollapsed(true)}
        >
          <FiHome className="text-lg sm:text-xl min-w-5 sm:min-w-6" />
          {!collapsed && <span className="text-sm sm:text-sm md:text-base">Homepage</span>}
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded"
          onClick={() => isMobile && setCollapsed(true)}
        >
          <FiLayers className="text-lg sm:text-xl min-w-5 sm:min-w-6" />
          {!collapsed && <span className="text-sm sm:text-sm md:text-base">Dashboard</span>}
        </Link>

        <Link
          to="/view-investment"
          className="flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded"
          onClick={() => isMobile && setCollapsed(true)}
        >
          <FiTrendingUp className="text-lg sm:text-xl min-w-5 sm:min-w-6" />
          {!collapsed && <span className="text-sm sm:text-sm md:text-base">Investments</span>}
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded"
          onClick={() => isMobile && setCollapsed(true)}
        >
          <FiUser className="text-lg sm:text-xl min-w-5 sm:min-w-6" />
          {!collapsed && <span className="text-sm sm:text-sm md:text-base">Profile</span>}
        </Link>

        <Link
          to="/withdrawal"
          className="flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded"
          onClick={() => isMobile && setCollapsed(true)}
        >
          <FiDollarSign className="text-lg sm:text-xl min-w-5 sm:min-w-6" />
          {!collapsed && <span className="text-sm sm:text-sm md:text-base">Withdraw</span>}
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/signin");
          }}
          className="flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded w-full text-left"
        >
          <FiLogOut className="text-lg sm:text-xl min-w-5 sm:min-w-6" />
          {!collapsed && <span className="text-sm sm:text-sm md:text-base">Logout</span>}
        </button>
      </div>

      {/* User info at bottom */}
      {!collapsed && user && (
  <div className="p-3 sm:p-4 border-t border-gray-700 mt-auto">
    <div className="flex items-center gap-3">
      <ProfilePicture 
        size="sm"
        showBorder={true}
        borderColor="border-blue-500"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-semibold truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-400 truncate">
          Acc: {user.accountNumber}
        </p>
      </div>
    </div>
  </div>
)}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      {/* Main Content Area - Scrolls independently */}
      <div
        className={`flex-1 min-h-screen transition-all duration-300 overflow-y-auto ${
          collapsed ? "ml-16 sm:ml-16 md:ml-20" : "ml-64 sm:ml-64 md:ml-72"
        }`}
        style={{ maxHeight: '100vh' }}
      >
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="w-full sm:w-auto">
              <Link to="/" className="flex items-center mb-2 sm:mb-3 hover:text-blue-600 text-xs sm:text-sm">
                <span className="mr-1">←</span>
                <p>Back to Homepage</p>
              </Link>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                Account: {user?.accountNumber}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
  <ProfilePicture 
    size="lg"
    showBorder={true}
    borderColor="border-blue-100"
  />
</div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Total Invested</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                    ${formatNumber(calculateTotalInvested())}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-2 md:p-3 rounded-full">
                  <FiDollarSign className="text-blue-600 text-base sm:text-lg md:text-xl lg:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">ROI</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                    ${formatNumber(user?.roi || 0)}
                  </p>
                </div>
                <div className="bg-green-100 p-2 sm:p-2 md:p-3 rounded-full">
                  <FiTrendingUp className="text-green-600 text-base sm:text-lg md:text-xl lg:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Referral Bonus</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                    ${formatNumber(user?.referralBonus || 0)}
                  </p>
                </div>
                <div className="bg-purple-100 p-2 sm:p-2 md:p-3 rounded-full">
                  <FiActivity className="text-purple-600 text-base sm:text-lg md:text-xl lg:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Active Investments</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                    {investments.filter((inv) => inv.status === "ACTIVE" || inv.status === "PENDING").length}
                  </p>
                </div>
                <div className="bg-orange-100 p-2 sm:p-2 md:p-3 rounded-full">
                  <FiClock className="text-orange-600 text-base sm:text-lg md:text-xl lg:text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* OilChart Component - Make responsive */}
          <div className="mt-4 sm:mt-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              Live Crude Oil Market Chart
            </h2>
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm">
              <OilChart />
            </div>
          </div>

          {/* Oil Price Trends Chart */}
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm mb-4 sm:mb-6 md:mb-8 mt-4 sm:mt-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              Oil Price Trends
            </h2>
            <div className="h-48 sm:h-56 md:h-64 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={oilPrices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={isMobile ? 8 : 10}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    fontSize={isMobile ? 8 : 10}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: isMobile ? '10px' : '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ r: isMobile ? 2 : 3 }}
                    activeDot={{ r: isMobile ? 4 : 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investments Table */}
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-3">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                My Investments
              </h2>
              
              {investments.length === 0 && (
                <a
                  href="/view-investment"
                  className="text-blue-600 hover:underline text-xs sm:text-sm whitespace-nowrap"
                >
                  Browse investments →
                </a>
              )}
            </div>

            {investments.length === 0 ? (
              <div className="text-center py-6 sm:py-8 md:py-12 text-gray-500">
                <p className="text-sm sm:text-base md:text-lg">You haven't made any investments yet.</p>
                <a
                  href="/view-investment"
                  className="text-blue-600 hover:underline mt-2 sm:mt-3 md:mt-4 inline-block text-xs sm:text-sm md:text-base"
                >
                  Browse available investments
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Investment
                        </th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Return
                        </th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                          Status
                        </th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Days Left
                        </th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {investments.map((investment) => (
                        <tr
                          key={investment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap">
                            <div>
                              <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">
                                {investment.investment.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                                {investment.investment.category}
                              </p>
                            </div>
                          </td>

                          <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap text-gray-800 text-xs sm:text-sm md:text-base">
                            ${formatNumber(investment.amount)}
                          </td>

                          <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap text-green-600 font-semibold text-xs sm:text-sm md:text-base">
                            ${formatNumber(investment.returnAmount)}
                          </td>

                          <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                investment.status === "ACTIVE"
                                  ? "bg-blue-100 text-blue-800"
                                  : investment.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : investment.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {investment.status}
                            </span>
                          </td>

                          <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap text-gray-800 text-xs sm:text-sm md:text-base">
                            {investment.status === "PENDING" ? (
                              <span className="text-yellow-600 font-semibold text-xs">
                                Awaiting
                              </span>
                            ) : investment.status === "ACTIVE" ? (
                              typeof investment.daysRemaining === 'number' && investment.daysRemaining > 0 ? (
                                <span className="text-xs sm:text-sm">
                                  {investment.daysRemaining} days
                                </span>
                              ) : typeof investment.daysRemaining === 'number' && investment.daysRemaining <= 0 ? (
                                <span className="text-green-600 font-semibold text-xs sm:text-sm">
                                  Ready
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">Calculating...</span>
                              )
                            ) : (
                              <span className="text-gray-500 text-xs">N/A</span>
                            )}
                          </td>

                          <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap">
                            {investment.status === "PENDING" ? (
                              <span className="text-gray-500 text-xs">Pending</span>
                            ) : investment.status === "ACTIVE" &&
                              typeof investment.daysRemaining === 'number' &&
                              investment.daysRemaining <= 0 ? (
                              <button
                                onClick={() => handleWithdrawClick(investment)}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap"
                              >
                                Withdraw
                              </button>
                            ) : investment.status === "COMPLETED" ? (
                              <span className="text-gray-500 text-xs">Withdrawn</span>
                            ) : (
                              <span className="text-gray-500 text-xs">Locked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 sm:h-6 md:h-8"></div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showModal && selectedInvestment && (
        <WithdrawalModal
          investment={selectedInvestment}
          userProfile={userProfile}
          onClose={() => {
            setShowModal(false);
            setSelectedInvestment(null);
          }}
          onConfirm={handleConfirmWithdrawal}
        />
      )}
    </div>
  );
};

export default Dashboard;
