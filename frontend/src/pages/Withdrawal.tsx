// Withdrawal.tsx - Updated with safe checks
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiAlertCircle, FiDollarSign, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { HomeUtils } from '../utils/HomeUtils';
import WithdrawalModal from '../components/WithdrawalModal';
import WithdrawalHistory from '../components/WithdrawalHistory';
import { useToast } from '../context/ToastContext';
import axiosInstance from '../config/axios';
import { useUser } from '../context/UserContext';

interface Investment {
  id: string;
  amount: number;
  returnAmount: number;
  roiAmount: number; // Make optional
  totalRoiAdded?: number; // Make optional
  startDate: string | null;
  endDate: string | null;
  status: string;
  investment: {
    title: string;
    category: string;
    returnRate: string;
  };
  daysRemaining?: number | null;
  canWithdraw?: boolean;
}

const Withdrawal: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { showToast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchInvestments(),
        fetchWithdrawalHistory()
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const response = await axiosInstance.get('/api/user-investments/my-investments');
      const data = response.data.investments || response.data || [];
      
      // Ensure all investments have roiAmount and totalRoiAdded fields
      const safeInvestments = Array.isArray(data) 
        ? data.map((inv: any) => ({
            ...inv,
            roiAmount: inv.roiAmount || 0,
            totalRoiAdded: inv.totalRoiAdded || 0
          }))
        : [];
      
      setInvestments(safeInvestments);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
      showToast('Failed to load investments', 'error');
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const response = await axiosInstance.get('/api/withdrawals/my-withdrawals');
      setWithdrawalHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch withdrawal history:', error);
    }
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const canWithdraw = (investment: Investment) => {
    // Can't withdraw if pending or no dates set
    if (investment.status !== 'ACTIVE' || !investment.endDate || !investment.startDate) {
      return false;
    }
    
    // Check if ROI is available to withdraw
    const hasROI = (investment.roiAmount || 0) > 0;
    if (!hasROI) {
      return false;
    }
    
    const daysRemaining = getDaysRemaining(investment.endDate);
    return daysRemaining !== null && daysRemaining <= 0;
  };

  const handleWithdrawClick = (investment: Investment) => {
    console.log('Selected investment:', investment);
    console.log('Investment ID:', investment.id);
    console.log('ROI available:', investment.roiAmount || 0);
    
    // Validate ROI is available
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
      
      // Validate that userInvestmentId exists
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
      
    } catch (error: any) {
      console.error('Full withdrawal error:', error);
      console.error('Error response:', error.response?.data);
      showToast(error.response?.data?.error || 'Failed to submit withdrawal request', "error");
    }
  };

  const getStatusBadge = (investment: Investment) => {
    if (investment.status === 'COMPLETED') {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold flex items-center gap-1">
          <FiCheckCircle /> Withdrawn
        </span>
      );
    }

    if (investment.status === 'PENDING_WITHDRAWAL') {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1">
          <FiClock /> Withdrawal Pending
        </span>
      );
    }

    if (investment.status === 'PENDING') {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1">
          <FiClock /> Pending Confirmation
        </span>
      );
    }

    // Only show days remaining if dates are set
    if (investment.status === 'ACTIVE' && investment.endDate && investment.startDate) {
      if (canWithdraw(investment)) {
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
            <FiCheckCircle /> ROI Ready to Withdraw
          </span>
        );
      }

      const daysRemaining = getDaysRemaining(investment.endDate);
      if (daysRemaining !== null) {
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1">
            <FiClock /> {daysRemaining} days remaining
          </span>
        );
      }
    }

    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
        {investment.status}
      </span>
    );
  };

  // Calculate total available ROI across all investments
  const totalAvailableROI = investments
    .filter(inv => inv.status === 'ACTIVE')
    .reduce((sum, inv) => sum + (inv.roiAmount || 0), 0);

  // Safe formatting functions
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#041a35] flex flex-col items-center justify-center">
        <img src={HomeUtils[0].companyLogo} alt="" className='w-16 sm:w-20 md:w-24 lg:w-32'/>
        <p className='text-white mt-4 text-base sm:text-lg md:text-xl'>Page Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Withdraw ROI</h1>
              <p className="text-gray-600 mt-2">
                Withdraw returns from your matured investments
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              {showHistory ? 'Back to Investments' : 'View Withdrawal History'}
            </button>
          </div>
        </div>

        {/* ROI Summary Card */}
        <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">ROI Summary</h2>
              <p className="text-purple-100">Total ROI available for withdrawal</p>
            </div>
            <div className="text-right">
              <div className="text-3xl md:text-4xl font-bold mb-1">${formatCurrency(totalAvailableROI)}</div>
              <p className="text-purple-200 text-sm">
                Across {investments.filter(inv => inv.status === 'ACTIVE' && (inv.roiAmount || 0) > 0).length} investment(s)
              </p>
            </div>
          </div>
        </div>

        {/* Info Box - Updated for ROI */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">ROI Withdrawal Information</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You can only withdraw ROI (Return on Investment), not your principal amount</li>
                <li>ROI is added by admin to each investment separately</li>
                <li>You can withdraw ROI after the investment maturity period</li>
                <li>Each investment's ROI is tracked separately but summed in your total ROI</li>
                <li>Withdrawal requests require admin approval</li>
                <li>You can choose between bank transfer or crypto wallet transfer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        {showHistory && (
          <WithdrawalHistory 
            withdrawals={withdrawalHistory} 
            onRefresh={fetchWithdrawalHistory}
          />
        )}

        {/* Investments List (only show if not viewing history) */}
        {!showHistory && (
          <>
            {/* Refresh Button */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-600">
                Showing {investments.length} investment{investments.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={fetchAllData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
              >
                <FiRefreshCw /> Refresh
              </button>
            </div>

            {investments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FiDollarSign className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-4">No investments yet</p>
                <Link
                  to="/view-investment"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Browse Investments
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investments.map((investment) => (
                  <div
                    key={investment.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                  >
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-white">
                      <h3 className="font-bold text-lg mb-2">{investment.investment.title}</h3>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
                        {investment.investment.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="space-y-4 mb-6">
                        <div>
                          <p className="text-gray-600 text-sm">Investment Amount</p>
                          <p className="text-2xl font-bold text-gray-800">
                            ${formatNumber(investment.amount)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                          <div>
                            <p className="text-gray-600 text-sm">Available ROI</p>
                            <p className="text-xl font-bold text-purple-600 flex items-center gap-1">
                              <FiTrendingUp /> ${formatCurrency(investment.roiAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total ROI Added:</span>
                            <span className="font-semibold">${formatCurrency(investment.totalRoiAdded)}</span>
                          </div>
                        </div>

                        {investment.startDate && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Start Date</p>
                              <p className="font-semibold">
                                {new Date(investment.startDate).toLocaleDateString()}
                              </p>
                            </div>
                            {investment.endDate && (
                              <div>
                                <p className="text-gray-600">End Date</p>
                                <p className="font-semibold">
                                  {new Date(investment.endDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        {getStatusBadge(investment)}
                      </div>

                      {/* Withdraw Button */}
                      {canWithdraw(investment) ? (
                        <button
                          onClick={() => handleWithdrawClick(investment)}
                          className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all"
                        >
                          Withdraw ROI (${formatCurrency(investment.roiAmount)})
                        </button>
                      ) : investment.status === 'PENDING_WITHDRAWAL' ? (
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ROI withdrawal request pending admin approval
                          </p>
                        </div>
                      ) : investment.status === 'PENDING' ? (
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            Waiting for admin confirmation
                          </p>
                        </div>
                      ) : investment.status === 'COMPLETED' ? (
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Fully withdrawn</p>
                        </div>
                      ) : (investment.roiAmount || 0) > 0 ? (
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-800">
                            ${formatCurrency(investment.roiAmount)} ROI available after maturity
                          </p>
                        </div>
                      ) : investment.endDate && getDaysRemaining(investment.endDate) !== null ? (
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {getDaysRemaining(investment.endDate)} days until maturity
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Not available for withdrawal</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showModal && selectedInvestment && user && (
        <WithdrawalModal
          investment={{
            id: selectedInvestment.id,
            amount: selectedInvestment.amount,
            roiAmount: selectedInvestment.roiAmount || 0,
            investment: {
              title: selectedInvestment.investment.title,
              category: selectedInvestment.investment.category
            }
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
  );
};

export default Withdrawal;

