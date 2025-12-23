// Dashboard.tsx - Complete fixed version
import React, { useState, useEffect } from 'react';
import CivvestLogo from '../assets/civvest company logo.png';
import {
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiMenu,
  FiHome,
  FiLayers,
  FiLogOut,
  FiUser,
  FiX,
  FiPackage,
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
import { useUser } from "../context/UserContext";
import ProfilePicture from "../components/ProfilePicture";

interface Investment {
  id: string;
  amount: number;
  returnAmount: number;
  roiAmount: number; // Make optional
  totalRoiAdded: number; // Make optional
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
    duration: string;
  };
  recentRoiAdditions?: Array<{
    amount: number;
    date: string;
    notes?: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useUser();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [oilPrices, setOilPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
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
      console.log('Auto-refreshing dashboard data...');
      fetchAllData();
    }, 30000);

    const handleUserUpdated = (event: CustomEvent) => {
      console.log('User updated event received:', event.detail);
      if (event.detail?.user) {
        refreshUser();
        fetchAllData();
        
        if (event.detail.source === 'admin-update') {
          showToast('Your account has been updated!', 'success');
        }
      }
    };

    const handleBalanceUpdated = (event: CustomEvent) => {
      console.log('Balance updated event received:', event.detail);
      if (event.detail?.userId === user?.id) {
        showToast('Your balance has been updated!', 'success');
        refreshUser();
        fetchAllData();
      }
    };

    const handleROIUpdated = (event: CustomEvent) => {
      console.log('ROI updated event received:', event.detail);
      if (event.detail?.userId === user?.id) {
        showToast('Your ROI has been updated!', 'success');
        refreshUser();
        fetchAllData();
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        console.log('User data changed in storage');
        refreshUser();
        fetchAllData();
      }
    };

    const handleInvestmentROIUpdated = (event: CustomEvent) => {
    console.log('Investment ROI updated:', event.detail);
    if (event.detail?.userId === user?.id) {
      showToast('Your investment ROI has been updated!', 'success');
      fetchInvestments(); // Refresh investments to show new ROI
    }
  };
  
  window.addEventListener('investmentROIUpdated', handleInvestmentROIUpdated as EventListener);

    window.addEventListener('userUpdated', handleUserUpdated as EventListener);
    window.addEventListener('balanceUpdated', handleBalanceUpdated as EventListener);
    window.addEventListener('roiUpdated', handleROIUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('userUpdated', handleUserUpdated as EventListener);
      window.removeEventListener('balanceUpdated', handleBalanceUpdated as EventListener);
      window.removeEventListener('roiUpdated', handleROIUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('investmentROIUpdated', handleInvestmentROIUpdated as EventListener);
    };
  }, [navigate, user?.id]);

  const fetchAllData = async () => {
    console.log('Fetching all dashboard data...');
    await Promise.all([
      fetchUserData(),
      fetchInvestments(),
      generateOilPriceData()
    ]);
  };

  const fetchUserData = async () => {
    try {
      setError(null);
      await refreshUser();
      console.log('User data refreshed');
    } catch (error: any) {
      console.error("Failed to fetch user data:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("user");
        navigate("/signin");
      }
    }
  };

  const fetchInvestments = async () => {
  try {
    setError(null);
    const response = await axiosInstance.get('/api/user-investments/my-investments');
    
    console.log("Investments fetched:", response.data);
    const investmentsData = response.data.investments || response.data || [];
    
    // ENSURE all investments have roiAmount and totalRoiAdded fields - THIS IS THE KEY FIX
    const safeInvestments = Array.isArray(investmentsData) 
      ? investmentsData.map((inv: any) => ({
          ...inv,
          roiAmount: inv.roiAmount ?? 0,  // ← Use nullish coalescing to ensure number
          totalRoiAdded: inv.totalRoiAdded ?? 0  // ← Use nullish coalescing
        }))
      : [];
    
    setInvestments(safeInvestments);
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
  
  // Check if investment is matured
  if (!investment.isMatured) {
    showToast('Investment has not matured yet. ROI withdrawal is only allowed after maturity.', 'error');
    return;
  }
  
  // Check if ROI is available
  if ((investment.roiAmount || 0) <= 0) {
    showToast('No ROI available to withdraw for this investment', 'error');
    return;
  }
  
  setSelectedInvestment(investment);
  setShowModal(true);
};

  const handleConfirmWithdrawal = async (withdrawalData: any) => {
    try {
      console.log('Withdrawal data being sent:', withdrawalData);
      
      if (!withdrawalData.userInvestmentId) {
        showToast('Error: Investment ID is missing', "error");
        return;
      }
      
      // Validate withdrawal amount doesn't exceed ROI
      const investment = investments.find(inv => inv.id === withdrawalData.userInvestmentId);
      if (investment && withdrawalData.amount > (investment.roiAmount || 0)) {
        showToast(`Cannot withdraw more than available ROI ($${investment.roiAmount || 0})`, "error");
        return;
      }

      try {
        const response = await axiosInstance.post('/api/withdrawals/request', withdrawalData);
        
        console.log('Withdrawal response:', response.data);
        showToast(response.data.message, "success");
        
        // Update the UI immediately
        if (response.data.remainingROI !== undefined) {
          setInvestments(prev => prev.map(inv => {
            if (inv.id === withdrawalData.userInvestmentId) {
              return { ...inv, roiAmount: response.data.remainingROI };
            }
            return inv;
          }));
        }
        
        fetchAllData();
        setShowModal(false);
        setSelectedInvestment(null);
      } catch (instanceError: any) {
        console.log('axiosInstance failed, trying direct axios...');
        
        const directResponse = await axiosInstance.post('/api/withdrawals/request', withdrawalData);
        
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
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  };

  const calculateTotalAvailableROI = () => {
    return investments
      .filter(inv => inv.status === "ACTIVE" && (inv.roiAmount || 0) > 0)
      .reduce((sum, inv) => sum + (inv.roiAmount || 0), 0);
  };

  const calculateTotalROIAdded = () => {
    return investments
      .reduce((sum, inv) => sum + (inv.totalRoiAdded || 0), 0);
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    try {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return daysRemaining;
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return null;
    }
  };

  const canWithdrawInvestment = (investment: Investment) => {
    if (investment.status !== 'ACTIVE') return false;
    
    if ((investment.roiAmount || 0) <= 0) return false;
    
    const daysRemaining = getDaysRemaining(investment.endDate);
    return daysRemaining !== null && daysRemaining <= 0;
  };

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return "0";
    }
    return Math.floor(num).toLocaleString();
  };

  const formatCurrency = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return "0.00";
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white fixed top-0 left-0 h-full transition-transform duration-300 flex flex-col z-50 ${
          isMobile 
            ? `w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'w-64 translate-x-0'
        }`}
        style={{ 
          height: '100vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <img src={CivvestLogo} alt="Civvest Logo" className="w-12" />
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-2xl hover:text-gray-300 transition-colors p-1"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="flex-1 mt-6 space-y-3 px-3">
          <Link
            to="/"
            className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded"
            onClick={closeSidebar}
          >
            <FiHome className="text-xl" />
            <span className="text-sm">Homepage</span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-3 p-3 bg-blue-600 transition rounded"
            onClick={closeSidebar}
          >
            <FiLayers className="text-xl" />
            <span className="text-sm">Dashboard</span>
          </Link>

          <Link
            to="/view-investment"
            className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded"
            onClick={closeSidebar}
          >
            <FiTrendingUp className="text-xl" />
            <span className="text-sm">Investments</span>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded"
            onClick={closeSidebar}
          >
            <FiUser className="text-xl" />
            <span className="text-sm">Profile</span>
          </Link>

          <Link
            to="/withdrawal"
            className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded"
            onClick={closeSidebar}
          >
            <FiDollarSign className="text-xl" />
            <span className="text-sm">Withdraw ROI</span>
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              navigate("/signin");
            }}
            className="flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded w-full text-left"
          >
            <FiLogOut className="text-xl" />
            <span className="text-sm">Logout</span>
          </button>
        </div>

        {user && (
          <div className="p-4 border-t border-gray-700 mt-auto">
            <div className="flex items-center gap-3">
              <ProfilePicture 
                size="sm"
                showBorder={true}
                borderColor="border-blue-500"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  Acc: {user.accountNumber}
                </p>
                <p className="text-xs text-purple-300 mt-1">
                  ROI: ${formatCurrency(user.roi || 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-64'}`}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 bg-gray-900 shadow-md z-30 p-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-2xl text-white p-1 hover:bg-gray-800 rounded"
            >
              <FiMenu />
            </button>
            <img src={CivvestLogo} alt="Civvest" className="w-10" />
            <ProfilePicture size="sm" showBorder={true} borderColor="border-blue-500" />
          </div>
        )}

        <div className="p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <Link to="/" className="flex items-center mb-3 hover:text-blue-600 text-sm">
                <span className="mr-1">←</span>
                <p>Back to Homepage</p>
              </Link>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Account: {user?.accountNumber}
              </p>
            </div>

            {!isMobile && (
              <ProfilePicture size="lg" showBorder={true} borderColor="border-blue-100" />
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Total Invested</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-2">
                    ${formatNumber(calculateTotalInvested())}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {investments.filter(inv => inv.status === 'ACTIVE' || inv.status === 'PENDING').length} active
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiDollarSign className="text-blue-600 text-xl md:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Total ROI</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-2">
                    ${formatCurrency(user?.roi || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ${formatCurrency(calculateTotalAvailableROI())} available
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FiTrendingUp className="text-purple-600 text-xl md:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Referral Bonus</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-2">
                    ${formatNumber(user?.referralBonus || 0)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FiActivity className="text-green-600 text-xl md:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">ROI Added</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-2">
                    ${formatCurrency(calculateTotalROIAdded())}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total across all investments
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <FiPackage className="text-indigo-600 text-xl md:text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* ROI Summary Card */}
          {calculateTotalAvailableROI() > 0 && (
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-4 md:p-6 mb-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">ROI Available for Withdrawal</h2>
                  <p className="text-purple-100">Total ROI that can be withdrawn from matured investments</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    ${formatCurrency(calculateTotalAvailableROI())}
                  </div>
                  <p className="text-purple-200 text-sm">
                    Across {investments.filter(inv => inv.status === 'ACTIVE' && (inv.roiAmount || 0) > 0).length} investment(s)
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/withdrawal"
                  className="inline-block bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Go to Withdrawal Page
                </Link>
              </div>
            </div>
          )}

          {/* Oil Chart */}
          <div className="mt-6">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <OilChart />
            </div>
          </div>

          {/* Oil Price Trends */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm my-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
              Oil Price Trends
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={oilPrices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investments Section */}
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-3">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                My Investments
              </h2>
              
              {investments.length === 0 && (
                <Link
                  to="/view-investment"
                  className="text-blue-600 hover:underline text-xs sm:text-sm whitespace-nowrap"
                >
                  Browse investments →
                </Link>
              )}
            </div>

            {investments.length === 0 ? (
              <div className="text-center py-6 sm:py-8 md:py-12 text-gray-500">
                <p className="text-sm sm:text-base md:text-lg">You haven't made any investments yet.</p>
                <Link
                  to="/view-investment"
                  className="text-blue-600 hover:underline mt-2 sm:mt-3 md:mt-4 inline-block text-xs sm:text-sm md:text-base"
                >
                  Browse available investments
                </Link>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                {/* Mobile View - Cards */}
<div className="md:hidden space-y-4">
  {investments.map((investment) => {
    const canWithdraw = canWithdrawInvestment(investment);
    const daysRemaining = getDaysRemaining(investment.endDate);
    
    return (
      <div key={investment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="space-y-3">
          {/* Investment Header */}
          <div>
            <h3 className="font-semibold text-gray-800 text-sm truncate">
              {investment.investment.title}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {investment.investment.category}
            </p>
          </div>

          {/* Investment Details Grid - UPDATED */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Initial Investment</p>
              <p className="font-medium text-gray-800 text-sm">
                ${formatNumber(investment.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">ROI Available</p>
              <p className="font-medium text-purple-600 text-sm">
                ${formatCurrency(investment.roiAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
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
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Days Left</p>
              {investment.status === "PENDING" ? (
                <span className="text-yellow-600 font-semibold text-xs">
                  Awaiting
                </span>
              ) : investment.status === "ACTIVE" ? (
                daysRemaining !== null && daysRemaining > 0 ? (
                  <span className="text-gray-800 text-sm">
                    {daysRemaining} days
                  </span>
                ) : canWithdraw ? (
                  <span className="text-green-600 font-semibold text-xs">
                    Matured
                  </span>
                ) : (
                  <span className="text-gray-500 text-xs">Calculating...</span>
                )
              ) : (
                <span className="text-gray-500 text-xs">N/A</span>
              )}
            </div>
          </div>

          {/* ROI Info Box - UPDATED */}
          {(investment.totalRoiAdded || 0) > 0 && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-purple-700 font-medium">Total ROI Added:</span>
                <span className="font-bold text-purple-800">
                  ${formatCurrency(investment.totalRoiAdded)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-600">Available Now:</span>
                <span className="font-semibold text-purple-700">
                  ${formatCurrency(investment.roiAmount)}
                </span>
              </div>
              {investment.recentRoiAdditions && investment.recentRoiAdditions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <p className="text-xs text-purple-600">
                    Latest: ${formatCurrency(investment.recentRoiAdditions[0].amount)} on{' '}
                    {new Date(investment.recentRoiAdditions[0].date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {investment.status === "PENDING" ? (
              <div className="text-center">
                <span className="text-gray-500 text-sm">Pending Admin Approval</span>
              </div>
            ) : canWithdraw ? (
              <button
                onClick={() => handleWithdrawClick(investment)}
                className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-md text-sm font-semibold transition-colors"
              >
                Withdraw ${formatCurrency(investment.roiAmount)} ROI
              </button>
            ) : investment.status === "COMPLETED" ? (
              <div className="text-center">
                <span className="text-gray-500 text-sm">Investment Completed</span>
              </div>
            ) : (investment.roiAmount || 0) > 0 ? (
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">
                  ${formatCurrency(investment.roiAmount)} ROI Available
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Withdrawable after maturity date
                </p>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-gray-500 text-sm">No ROI Added Yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  })}
</div>

                {/* Desktop View - Table */}
                <div className="hidden md:block overflow-x-auto -mx-3 sm:mx-0">
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
                            ROI Available
                          </th>
                          <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                        {investments.map((investment) => {
                          const canWithdraw = canWithdrawInvestment(investment);
                          const daysRemaining = getDaysRemaining(investment.endDate);
                          
                          return (
                            <tr key={investment.id} className="hover:bg-gray-50 transition-colors">
              {/* Investment Title Column */}
              <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap">
                <div>
                  <p className="font-semibold text-gray-800 text-sm md:text-base truncate max-w-[180px] lg:max-w-[250px]">
                    {investment.investment.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[180px] lg:max-w-[250px]">
                    {investment.investment.category}
                  </p>
                </div>
              </td>

              {/* Amount Column - UPDATED */}
              <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap">
                <div>
                  <p className="text-gray-800 text-sm md:text-base">
                    ${formatNumber(investment.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Initial Investment
                  </p>
                </div>
              </td>

              {/* ROI Available Column - THIS IS THE KEY CHANGE */}
              <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap">
                <div>
                  <p className="text-purple-600 font-semibold text-sm md:text-base">
                    ${formatCurrency(investment.roiAmount)}
                  </p>
                  {(investment.totalRoiAdded || 0) > 0 && (
                    <p className="text-xs text-purple-500">
                      Total added: ${formatCurrency(investment.totalRoiAdded)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Available to withdraw
                  </p>
                </div>
              </td>

              {/* Status Column */}
              <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap">
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

              {/* Days Left Column */}
              <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap text-gray-800 text-sm md:text-base">
                {investment.status === "PENDING" ? (
                  <span className="text-yellow-600 font-semibold text-xs">
                    Awaiting
                  </span>
                ) : investment.status === "ACTIVE" ? (
                  daysRemaining !== null && daysRemaining > 0 ? (
                    <span className="text-sm">
                      {daysRemaining} days
                    </span>
                  ) : canWithdraw ? (
                    <span className="text-green-600 font-semibold text-sm">
                      Matured
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">Calculating...</span>
                  )
                ) : (
                  <span className="text-gray-500 text-xs">N/A</span>
                )}
              </td>

              {/* Action Column */}
              <td className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 whitespace-nowrap">
                {investment.status === "PENDING" ? (
                  <span className="text-gray-500 text-sm">Pending</span>
                ) : canWithdraw ? (
                  <button
                    onClick={() => handleWithdrawClick(investment)}
                    className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap transition-colors"
                  >
                    Withdraw ROI
                  </button>
                ) : investment.status === "COMPLETED" ? (
                  <span className="text-gray-500 text-sm">Completed</span>
                ) : (investment.roiAmount || 0) > 0 ? (
                  <div className="text-xs text-purple-600">
                    ${formatCurrency(investment.roiAmount)} available after maturity
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">No ROI yet</span>
                )}
              </td>
            </tr>

                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Spacing */}
          <div className="h-4 sm:h-6 md:h-8"></div>
        </div>

        {/* Withdrawal Modal */}
        {showModal && selectedInvestment && (
          <WithdrawalModal
            investment={{
              id: selectedInvestment.id,
              amount: selectedInvestment.amount,
              roiAmount: selectedInvestment.roiAmount || 0,
              investment: {
                title: selectedInvestment.investment.title,
                category: selectedInvestment.investment.category
              } as any
            }}
            maxAmount={selectedInvestment.roiAmount || 0}
            onClose={() => {
              setShowModal(false);
              setSelectedInvestment(null);
            }}
            onConfirm={handleConfirmWithdrawal}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

