// Dashboard.tsx - UPDATED VERSION with network error handling
import React, { useState, useEffect } from 'react';
import CivvestLogo from '../assets/civvest company logo.png';
import ReferralWithdrawalModal from "../components/ReferralWithdrawalModal";
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
  FiChevronLeft,
  FiChevronRight,
  FiWifiOff,
  FiRefreshCw,
  FiAlertCircle,
  FiUsers,
  FiExternalLink
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
import { useUser } from "../context/UserContext"
import ProfilePicture from "../components/ProfilePicture";

interface Investment {
  id: string;
  amount: number;
  returnAmount: number;
  roiAmount: number;
  totalRoiAdded: number;
  startDate: string | null;
  status: string;
  withdrawalStatus?: string;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const [showReferralWithdrawalModal, setShowReferralWithdrawalModal] = useState(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Cache user data from localStorage to prevent UI disruption
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [cachedInvestments, setCachedInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    // Load cached data first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCachedUser(parsedUser);
    }

    // Load cached investments if available
    const cachedInv = localStorage.getItem("cachedInvestments");
    if (cachedInv) {
      try {
        setCachedInvestments(JSON.parse(cachedInv));
      } catch (e) {
        console.error("Failed to parse cached investments:", e);
      }
    }

    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
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

    // Increase interval to reduce API calls
    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      fetchAllData();
    }, 60000); // Changed from 30s to 60s

    // Event listeners (unchanged)
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
        fetchInvestments();
      }
    };

    const handleWithdrawalApproved = (event: CustomEvent) => {
      console.log('Withdrawal approved event received:', event.detail);
      if (event.detail?.userId === user?.id) {
        showToast('Your withdrawal request has been approved! Investment closed.', 'success');
        refreshUser();
        fetchAllData();
      }
    };
    
    window.addEventListener('investmentROIUpdated', handleInvestmentROIUpdated as EventListener);
    window.addEventListener('userUpdated', handleUserUpdated as EventListener);
    window.addEventListener('balanceUpdated', handleBalanceUpdated as EventListener);
    window.addEventListener('roiUpdated', handleROIUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('withdrawalApproved', handleWithdrawalApproved as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('userUpdated', handleUserUpdated as EventListener);
      window.removeEventListener('balanceUpdated', handleBalanceUpdated as EventListener);
      window.removeEventListener('roiUpdated', handleROIUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('investmentROIUpdated', handleInvestmentROIUpdated as EventListener);
      window.removeEventListener('withdrawalApproved', handleWithdrawalApproved as EventListener);
    };
  }, [navigate, user?.id]);

  const fetchAllData = async () => {
    console.log('Fetching all dashboard data...');
    try {
      await Promise.all([
        fetchUserData(),
        fetchInvestments(),
        generateOilPriceData()
      ]);
      setNetworkError(false);
      setRetryCount(0);
    } catch (error) {
      console.log('Network error in fetchAllData, using cached data');
    }
  };

  const fetchUserData = async () => {
    try {
      setError(null);
      await refreshUser();
      console.log('User data refreshed');
    } catch (error: any) {
      console.error("Failed to fetch user data:", error);
      
      // Only set error for authentication issues, not network errors
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("user");
        navigate("/signin");
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        // Network error - don't disrupt UI, just log it
        console.log('Network error fetching user data, using cached data');
        setNetworkError(true);
        setRetryCount(prev => prev + 1);
      }
    }
  };

  const fetchInvestments = async () => {
    try {
      setError(null);
      const response = await axiosInstance.get('/api/user-investments/my-investments', {
        timeout: 10000, // 10 second timeout
      });
      
      console.log("Investments fetched:", response.data);
      const investmentsData = response.data.investments || response.data || [];
      
      const safeInvestments = Array.isArray(investmentsData) 
        ? investmentsData.map((inv: any) => ({
            ...inv,
            roiAmount: inv.roiAmount ?? 0,
            totalRoiAdded: inv.totalRoiAdded ?? 0,
            withdrawalStatus: inv.withdrawalStatus || null
          }))
        : [];
      
      setInvestments(safeInvestments);
      
      // Cache the investments for offline use
      localStorage.setItem("cachedInvestments", JSON.stringify(safeInvestments));
      setCachedInvestments(safeInvestments);
      
      setLoading(false);
      setNetworkError(false);
    } catch (error: any) {
      console.error("Failed to fetch investments:", error);
      
      // Don't show error for network issues, use cached data
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("user");
        navigate("/signin");
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('Network error, using cached investments');
        setNetworkError(true);
        
        // Use cached investments if available
        if (cachedInvestments.length > 0) {
          setInvestments(cachedInvestments);
        }
        
        // Show gentle notification instead of error page
        if (retryCount < 3) {
          setTimeout(() => {
            fetchInvestments(); // Retry
          }, 5000);
        }
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

  const handleRetry = () => {
    setRetryCount(0);
    setNetworkError(false);
    fetchAllData();
    showToast('Attempting to reconnect...', 'info');
  };

  const handleWithdrawClick = (investment: Investment) => {
  if (isInvestmentClosed(investment)) {
    showToast('This investment has already been closed', 'info');
    return;
  }
  
  if (investment.withdrawalStatus === 'PENDING') {
    showToast('Withdrawal request already pending', 'info');
    return;
  }
  
  // Remove maturity check - only check if ROI exists
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
      
      const investment = investments.find(inv => inv.id === withdrawalData.userInvestmentId);
      if (investment && withdrawalData.amount > (investment.roiAmount || 0)) {
        showToast(`Cannot withdraw more than available ROI ($${investment.roiAmount || 0})`, "error");
        return;
      }

      const response = await axiosInstance.post('/api/withdrawals/request', withdrawalData);
      
      console.log('Withdrawal response:', response.data);
      showToast('Withdrawal request submitted successfully!', "success");
      
      // Update the UI immediately - mark as pending withdrawal
      setInvestments(prev => prev.map(inv => {
        if (inv.id === withdrawalData.userInvestmentId) {
          return { 
            ...inv, 
            roiAmount: response.data.remainingROI || 0,
            withdrawalStatus: 'PENDING'
          };
        }
        return inv;
      }));
      
      // Update cached investments
      const updatedInvestments = investments.map(inv => {
        if (inv.id === withdrawalData.userInvestmentId) {
          return { 
            ...inv, 
            roiAmount: response.data.remainingROI || 0,
            withdrawalStatus: 'PENDING'
          };
        }
        return inv;
      });
      localStorage.setItem("cachedInvestments", JSON.stringify(updatedInvestments));
      setCachedInvestments(updatedInvestments);
      
      fetchAllData();
      setShowModal(false);
      setSelectedInvestment(null);
      
    } catch (error: any) {
      console.error('Full withdrawal error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        showToast('Network error. Please check your connection and try again.', "error");
      } else if (error.response?.status === 404) {
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
    const dataToUse = investments.length > 0 ? investments : cachedInvestments;
    return dataToUse
      .filter((inv) => inv.status === "ACTIVE")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  };

  const calculateTotalAvailableROI = () => {
    const dataToUse = investments.length > 0 ? investments : cachedInvestments;
    return dataToUse
      .filter(inv => 
        inv.status === "ACTIVE" && 
        (inv.roiAmount || 0) > 0 &&
        inv.withdrawalStatus !== 'PROCESSED'
      )
      .reduce((sum, inv) => sum + (inv.roiAmount || 0), 0);
  };

  const calculateTotalROIAdded = () => {
    const dataToUse = investments.length > 0 ? investments : cachedInvestments;
    return dataToUse
      .reduce((sum, inv) => sum + (inv.totalRoiAdded || 0), 0);
  };


  const isInvestmentClosed = (investment: Investment) => {
    return investment.status === 'COMPLETED' || investment.withdrawalStatus === 'PROCESSED';
  };

  const getDisplayStatus = (investment: Investment) => {
  if (isInvestmentClosed(investment)) {
    return { text: 'CLOSED', color: 'bg-gray-100 text-gray-800' };
  }
  
  if (investment.withdrawalStatus === 'PENDING') {
    return { text: 'WITHDRAWAL PENDING', color: 'bg-yellow-100 text-yellow-800' };
  }
  
  if (investment.status === 'PENDING') {
    return { text: 'PENDING', color: 'bg-yellow-100 text-yellow-800' };
  }
  
  // Remove maturity checks - just check if ROI is available
  if (investment.status === 'ACTIVE') {
    if ((investment.roiAmount || 0) > 0) {
      return { text: 'READY TO WITHDRAW', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'ACTIVE', color: 'bg-blue-100 text-blue-800' };
  }
  
  return { text: investment.status, color: 'bg-gray-100 text-gray-800' };
};

  const getDaysLeftText = (investment: Investment) => {
    // Check if investment is closed first
    if (isInvestmentClosed(investment)) {
      return 'N/A';
    }
    
    // Check if investment is pending
    if (investment.status === 'PENDING') {
      return 'Awaiting';
    }
    
    return 'N/A';
  };

  const getActionText = (investment: Investment) => {
    // Check if investment is closed first
    if (isInvestmentClosed(investment)) {
      return 'Closed';
    }
    
    // Check if withdrawal is pending
    if (investment.withdrawalStatus === 'PENDING') {
      return 'Pending Approval';
    }
    
    // Check if investment is pending
    if (investment.status === 'PENDING') {
      return 'Pending';
    }
    
    return 'No ROI yet';
  };

  const getROIColor = (investment: Investment) => {
    if (isInvestmentClosed(investment)) {
      return 'text-gray-600';
    }
    return 'text-purple-600';
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

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getSidebarWidth = () => {
    if (isMobile) {
      return sidebarOpen ? 'w-64' : 'w-0';
    }
    return sidebarCollapsed ? 'w-20' : 'w-64';
  };

  const getMainContentMargin = () => {
    if (isMobile) {
      return sidebarOpen ? 'ml-64' : 'ml-0';
    }
    return sidebarCollapsed ? 'ml-20' : 'ml-64';
  };

  // Get data to display (use cached if network fails)
  const displayInvestments = investments.length > 0 ? investments : cachedInvestments;
  const displayUser = user || cachedUser;

  if (loading && investments.length === 0 && cachedInvestments.length === 0) {
    return (
      <div className="min-h-screen bg-[#041a35] flex flex-col items-center justify-center">
        <img src={HomeUtils[0].companyLogo} alt="" className='w-16 sm:w-20 lg:w-24 xl:w-32'/>
        <p className='text-white mt-4 text-base sm:text-lg lg:text-xl'>Page Loading...</p>
      </div>
    );
  }

  // Don't show error page for network errors, show data with warning
  if (error && !networkError) {
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
        className={`bg-gray-900 text-white fixed top-0 left-0 h-full transition-all duration-300 flex flex-col z-50 ${getSidebarWidth()}`}
        style={{ 
          height: '100vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!sidebarCollapsed && (
            <img src={CivvestLogo} alt="Civvest Logo" className="w-12" />
          )}
          {isMobile ? (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-2xl hover:text-gray-300 transition-colors p-1"
            >
              <FiX />
            </button>
          ) : (
            <button
              onClick={toggleSidebarCollapse}
              className="text-2xl hover:text-gray-300 transition-colors p-1"
            >
              {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          )}
        </div>

        <div className="flex-1 mt-6 space-y-3 px-3">
          <Link
            to="/"
            className={`flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded ${sidebarCollapsed ? 'justify-center' : ''}`}
            onClick={closeSidebar}
            title="Homepage"
          >
            <FiHome className="text-xl" />
            {!sidebarCollapsed && <span className="text-sm">Homepage</span>}
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center gap-3 p-3 bg-blue-600 transition rounded ${sidebarCollapsed ? 'justify-center' : ''}`}
            onClick={closeSidebar}
            title="Dashboard"
          >
            <FiLayers className="text-xl" />
            {!sidebarCollapsed && <span className="text-sm">Dashboard</span>}
          </Link>

          <Link
            to="/view-investment"
            className={`flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded ${sidebarCollapsed ? 'justify-center' : ''}`}
            onClick={closeSidebar}
            title="Investments"
          >
            <FiTrendingUp className="text-xl" />
            {!sidebarCollapsed && <span className="text-sm">Investments</span>}
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded ${sidebarCollapsed ? 'justify-center' : ''}`}
            onClick={closeSidebar}
            title="Profile"
          >
            <FiUser className="text-xl" />
            {!sidebarCollapsed && <span className="text-sm">Profile</span>}
          </Link>

          <Link
            to="/withdrawal"
            className={`flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded ${sidebarCollapsed ? 'justify-center' : ''}`}
            onClick={closeSidebar}
            title="Withdraw ROI"
          >
            <FiDollarSign className="text-xl" />
            {!sidebarCollapsed && <span className="text-sm">Withdraw ROI</span>}
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              navigate("/signin");
            }}
            className={`flex items-center gap-3 p-3 hover:bg-gray-700 transition rounded w-full text-left ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Logout"
          >
            <FiLogOut className="text-xl" />
            {!sidebarCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>

        {displayUser && !sidebarCollapsed && (
          <div className="p-4 border-t border-gray-700 mt-auto">
            <div className="flex items-center gap-3">
              <ProfilePicture 
                size="sm"
                showBorder={true}
                borderColor="border-blue-500"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {displayUser.firstName} {displayUser.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  Acc: {displayUser.accountNumber}
                </p>
                <p className="text-xs text-purple-300 mt-1">
                  ROI: ${formatCurrency(displayUser.roi || 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${getMainContentMargin()}`}>
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

        {/* Network Error Banner - Only shows when network is down */}
        {networkError && (
          <div className="sticky top-0 z-20 bg-yellow-50 border-b border-yellow-200 p-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiWifiOff className="text-yellow-600" />
                <span className="text-yellow-800 text-sm">
                  Connection lost. Showing cached data. Some features may be limited.
                </span>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800 text-sm font-medium"
              >
                <FiRefreshCw /> Retry
              </button>
            </div>
          </div>
        )}

        <div className="p-4 lg:p-6 xl:p-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <Link to="/" className="flex items-center mb-3 hover:text-blue-600 text-sm">
                <span className="mr-1">←</span>
                <p>Back to Homepage</p>
              </Link>

              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800">
                Welcome back, {displayUser?.firstName}!
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Account: {displayUser?.accountNumber}
                {networkError && (
                  <span className="text-yellow-600 text-xs ml-2">(cached data)</span>
                )}
              </p>
            </div>

            {!isMobile && (
              <ProfilePicture size="lg" showBorder={true} borderColor="border-blue-100" />
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Total Invested</p>
                  <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mt-2">
                    ${formatNumber(calculateTotalInvested())}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {displayInvestments.filter(inv => inv.status === 'ACTIVE').length} active
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiDollarSign className="text-blue-600 text-xl lg:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Total ROI</p>
                  <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mt-2">
                    ${formatCurrency(displayUser?.roi || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ${formatCurrency(calculateTotalAvailableROI())} available
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FiTrendingUp className="text-purple-600 text-xl lg:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-600 text-xs sm:text-sm">Referral Bonus</p>
      <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mt-2">
        ${formatNumber(displayUser?.referralBonus || 0)}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-gray-500">
          Referrals: {displayUser?.referralCount || 0}/10
        </p>
        {(displayUser?.referralCount || 0) >= 10 ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            ✓ Eligible
          </span>
        ) : (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
            {10 - (displayUser?.referralCount || 0)} more needed
          </span>
        )}
      </div>
    </div>
    <div className="bg-green-100 p-3 rounded-full">
      <FiActivity className="text-green-600 text-xl lg:text-2xl" />
    </div>
  </div>
  {(displayUser?.referralBonus || 0) > 0 && (displayUser?.referralCount || 0) >= 10 && (
    <button
      onClick={() => setShowReferralWithdrawalModal(true)}
      className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition"
    >
      Withdraw Bonus
    </button>
  )}
</div>

            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">ROI Added</p>
                  <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mt-2">
                    ${formatCurrency(calculateTotalROIAdded())}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total across all investments
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <FiPackage className="text-indigo-600 text-xl lg:text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* ROI Summary Card */}
          {calculateTotalAvailableROI() > 0 && (
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-4 lg:p-6 mb-6 text-white">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">ROI Available for Withdrawal</h2>
                  <p className="text-purple-100">Total ROI that can be withdrawn from matured investments</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl lg:text-4xl font-bold mb-1">
                    ${formatCurrency(calculateTotalAvailableROI())}
                  </div>
                  <p className="text-purple-200 text-sm">
                    Across {displayInvestments.filter(inv => 
                      inv.status === 'ACTIVE' && 
                      (inv.roiAmount || 0) > 0 &&
                      inv.withdrawalStatus !== 'PROCESSED'
                    ).length} investment(s)
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
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
              <OilChart />
            </div>
          </div>

          {/* Oil Price Trends */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm my-6">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">
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

          {/* ADD REFERRAL BONUS SECTION HERE */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiDollarSign className="text-green-600" /> Referral Bonus
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Earn bonuses by referring friends to Civvest
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {displayUser?.referralCount || 0} Referrals
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-linear-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Available Bonus</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${formatCurrency(displayUser?.referralBonus || 0)}
                  </p>
                </div>
                <FiDollarSign className="text-green-600 text-2xl" />
              </div>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {displayUser?.referralCount || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {(displayUser?.referralCount || 0) < 10 
                      ? `${10 - (displayUser?.referralCount || 0)} more to withdraw` 
                      : 'Ready to withdraw!'}
                  </p>
                </div>
                <FiUsers className="text-blue-600 text-2xl" />
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Withdrawal Status</p>
                  <p className={`text-lg font-bold ${
                    (displayUser?.referralCount || 0) >= 10 && (displayUser?.referralBonus || 0) > 0 
                      ? 'text-purple-700' 
                      : 'text-gray-600'
                  }`}>
                    {(displayUser?.referralCount || 0) >= 10 && (displayUser?.referralBonus || 0) > 0 
                      ? 'Eligible' 
                      : 'Not Eligible'}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Min: 10 referrals required
                  </p>
                </div>
                <FiAlertCircle className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {(displayUser?.referralCount || 0) >= 10 && (displayUser?.referralBonus || 0) > 0 && (
              <button
                onClick={() => setShowReferralWithdrawalModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 justify-center"
              >
                <FiDollarSign /> Withdraw Referral Bonus
              </button>
            )}
            
            <button
              onClick={() => {
                const referralLink = `${window.location.origin}/signup?ref=${displayUser?.referralCode || displayUser?.accountNumber}`;
                navigator.clipboard.writeText(referralLink);
                showToast('Referral link copied!', 'success');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 justify-center"
            >
              <FiExternalLink /> Copy Referral Link
            </button>
          </div>

          {/* Referral Link Display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Your Referral Link:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`${window.location.origin}/signup?ref=${displayUser?.referralCode || displayUser?.accountNumber}`}
                readOnly
                className="flex-1 p-2 bg-white border border-gray-300 rounded text-sm"
              />
              <button
                onClick={() => {
                  const referralLink = `${window.location.origin}/signup?ref=${displayUser?.referralCode || displayUser?.accountNumber}`;
                  navigator.clipboard.writeText(referralLink);
                  showToast('Referral link copied!', 'success');
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-semibold"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with friends. You earn bonuses when they sign up and invest!
            </p>
          </div>
        </div>
        {/* END OF REFERRAL BONUS SEC*/}

          {/* Investments Section */}
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-3">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                My Investments
                {networkError && (
                  <span className="text-yellow-600 text-xs ml-2">(cached)</span>
                )}
              </h2>
              
              {displayInvestments.length === 0 && (
                <Link
                  to="/view-investment"
                  className="text-blue-600 hover:underline text-xs sm:text-sm whitespace-nowrap"
                >
                  Browse investments →
                </Link>
              )}
            </div>

            {displayInvestments.length === 0 ? (
              <div className="text-center py-6 sm:py-8 lg:py-12 text-gray-500">
                <p className="text-sm sm:text-base lg:text-lg">You haven't made any investments yet.</p>
                <Link
                  to="/view-investment"
                  className="text-blue-600 hover:underline mt-2 sm:mt-3 lg:mt-4 inline-block text-xs sm:text-sm lg:text-base"
                >
                  Browse available investments
                </Link>
              </div>
            ) : (
              <>
                {/* Mobile & Tablet View - Cards */}
                <div className="lg:hidden space-y-4">
                  {displayInvestments.map((investment) => {
                    const displayStatus = getDisplayStatus(investment);
                    const actionText = getActionText(investment);
                    const isClosed = isInvestmentClosed(investment);
                    const roiColor = getROIColor(investment);
                    
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

                          {/* Investment Details Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Initial Investment</p>
                              <p className="font-medium text-gray-800 text-sm">
                                ${formatNumber(investment.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">ROI Available</p>
                              <p className={`font-medium text-sm ${roiColor}`}>
                                ${formatCurrency(investment.roiAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${displayStatus.color}`}>
                                {displayStatus.text}
                              </span>
                            </div>
                            
                          </div>

                          {/* ROI Info Box - Only show for non-closed investments */}
                          {(investment.totalRoiAdded || 0) > 0 && !isClosed && (
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
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-2">
                            {isClosed ? (
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <span className="text-gray-500 text-sm">Investment Closed</span>
                                {investment.totalRoiAdded && investment.totalRoiAdded > 0 && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    Total earned: ${formatCurrency(investment.totalRoiAdded)}
                                  </p>
                                )}
                              </div>
                            ) : investment.withdrawalStatus === 'PENDING' ? (
                              <div className="text-center p-2 bg-yellow-50 rounded">
                                <span className="text-yellow-700 text-sm">Withdrawal Pending Approval</span>
                              </div>
                            ) : investment.status === "PENDING" ? (
                              <div className="text-center p-2 bg-yellow-50 rounded">
                                <span className="text-yellow-700 text-sm">Pending Admin Approval</span>
                              </div>
                            ) : investment.withdrawalStatus ? (
                              <button
                                onClick={() => handleWithdrawClick(investment)}
                                className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-md text-sm font-semibold transition-colors"
                              >
                                Withdraw ${formatCurrency(investment.roiAmount)} ROI
                              </button>
                            ) : (investment.roiAmount || 0) > 0 ? (
                              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-sm text-purple-700 font-medium">
                                  ${formatCurrency(investment.roiAmount)} ROI {actionText.toLowerCase().includes('available') ? 'available' : actionText}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <span className="text-gray-500 text-sm">{actionText}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Investment
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            ROI Available
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {displayInvestments.map((investment) => {
                          const displayStatus = getDisplayStatus(investment);
                          const daysLeftText = getDaysLeftText(investment);
                          const actionText = getActionText(investment);
                          const isClosed = isInvestmentClosed(investment);
                          const roiColor = getROIColor(investment);
                          
                          return (
                            <tr key={investment.id} className="hover:bg-gray-50 transition-colors">
                              {/* Investment Title Column */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div>
                                  <p className="font-semibold text-gray-800 text-base truncate max-w-[250px]">
                                    {investment.investment.title}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-[250px]">
                                    {investment.investment.category}
                                  </p>
                                </div>
                              </td>

                              {/* Amount Column */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-gray-800 text-base">
                                    ${formatNumber(investment.amount)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Initial Investment
                                  </p>
                                </div>
                              </td>

                              {/* ROI Available Column */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div>
                                  <p className={`text-base font-semibold ${roiColor}`}>
                                    ${formatCurrency(investment.roiAmount)}
                                  </p>
                                  {(investment.totalRoiAdded || 0) > 0 && !isClosed && (
                                    <p className="text-xs text-purple-500">
                                      Total added: ${formatCurrency(investment.totalRoiAdded)}
                                    </p>
                                  )}
                                  {isClosed && investment.totalRoiAdded && investment.totalRoiAdded > 0 && (
                                    <p className="text-xs text-gray-500">
                                      Total earned: ${formatCurrency(investment.totalRoiAdded)}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {isClosed ? 'Already withdrawn' : 'Available to withdraw'}
                                  </p>
                                </div>
                              </td>

                              {/* Status Column */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${displayStatus.color}`}>
                                  {displayStatus.text}
                                </span>
                              </td>

                              {/* Days Left Column */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-gray-800 text-base">
                                  {daysLeftText}
                                </span>
                              </td>

                              {/* Action Column */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                {isClosed ? (
                                  <span className="text-gray-500 text-sm">Closed</span>
                                ) : investment.withdrawalStatus === 'PENDING' ? (
                                  <span className="text-yellow-600 text-sm">Pending Approval</span>
                                ) : investment.status === "PENDING" ? (
                                  <span className="text-gray-500 text-sm">Pending</span>
                                ) : investment.status ? (
                                  <button
                                    onClick={() => handleWithdrawClick(investment)}
                                    className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap transition-colors"
                                  >
                                    Withdraw ROI
                                  </button>
                                ) : (investment.roiAmount || 0) > 0 ? (
                                  <div className="text-xs text-purple-600">
                                    ${formatCurrency(investment.roiAmount)} {actionText.toLowerCase().includes('available') ? 'available' : actionText}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">{actionText}</span>
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
          <div className="h-4 sm:h-6 lg:h-8"></div>
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

        {showReferralWithdrawalModal && displayUser && (
          <ReferralWithdrawalModal
            onClose={() => setShowReferralWithdrawalModal(false)}
            onSuccess={() => {
              refreshUser();
              fetchAllData();
            }}
            user={{
              referralBonus: displayUser.referralBonus,
              referralCount: displayUser.referralCount
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
