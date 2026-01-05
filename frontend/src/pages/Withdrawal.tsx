// Withdrawal.tsx - UPDATED VERSION with slate colors for closed investments
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiDollarSign, FiRefreshCw, FiTrendingUp, FiAlertCircle} from 'react-icons/fi';
import { HomeUtils } from '../utils/HomeUtils';
import WithdrawalModal from '../components/WithdrawalModal';
import WithdrawalHistory from '../components/WithdrawalHistory';
import { useToast } from '../context/ToastContext';
import axiosInstance from '../config/axios';
import { useUser } from '../context/UserContext';
import { useWebSocket } from '../context/WebSocketContext';

// Define specific status types
type InvestmentStatus = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | string;
type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | string;

interface Investment {
  id: string;
  amount: number;
  returnAmount: number;
  roiAmount: number;
  totalRoiAdded?: number;
  startDate: string | null;
  endDate: string | null;
  status: InvestmentStatus;
  withdrawalStatus?: WithdrawalStatus;
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
  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    fetchAllData();
    
    // Subscribe to real-time updates
    const handleWithdrawalUpdate = (data: any) => {
      console.log('Withdrawal update received:', data);
      if (data.userId === user?.id) {
        showToast(`Your withdrawal has been ${data.status.toLowerCase()}!`, 'success');
        fetchAllData();
      }
    };
    
    const handleInvestmentUpdate = (data: any) => {
      console.log('Investment update received:', data);
      if (data.userId === user?.id) {
        fetchAllData();
      }
    };

    // Handle withdrawal approval notification
    const handleWithdrawalApproved = (event: CustomEvent) => {
      console.log('Withdrawal approved event received:', event.detail);
      if (event.detail?.userId === user?.id) {
        showToast('Your withdrawal request has been approved! Investment closed.', 'success');
        fetchAllData();
      }
    };
    
    subscribe('withdrawalUpdate', handleWithdrawalUpdate);
    subscribe('investmentUpdate', handleInvestmentUpdate);
    window.addEventListener('withdrawalApproved', handleWithdrawalApproved as EventListener);
    
    return () => {
      unsubscribe('withdrawalUpdate', handleWithdrawalUpdate);
      unsubscribe('investmentUpdate', handleInvestmentUpdate);
      window.removeEventListener('withdrawalApproved', handleWithdrawalApproved as EventListener);
    };
  }, [user?.id]);

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
      
      const safeInvestments = Array.isArray(data) 
        ? data.map((inv: any) => ({
            ...inv,
            roiAmount: inv.roiAmount || 0,
            totalRoiAdded: inv.totalRoiAdded || 0,
            withdrawalStatus: inv.withdrawalStatus || null
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

  const canWithdraw = (investment: Investment) => {
  // Check if investment is already completed or withdrawn
  const isCompleted = investment.status === 'COMPLETED';
  const isWithdrawn = investment.withdrawalStatus === 'PROCESSED';
  
  if (isCompleted || isWithdrawn) {
    return false;
  }
  
  // Check if investment is active
  if (investment.status !== 'ACTIVE') {
    return false;
  }
  
  // Check if already has pending withdrawal
  if (investment.withdrawalStatus === 'PENDING') {
    return false;
  }
  
  // ONLY check if ROI is available to withdraw - NO maturity checks
  const hasROI = (investment.roiAmount || 0) > 0;
  return hasROI;
};

  const handleWithdrawClick = (investment: Investment) => {
  // Validate investment can withdraw
  if (!canWithdraw(investment)) {
    const isCompleted = investment.status === 'COMPLETED';
    const isWithdrawn = investment.withdrawalStatus === 'PROCESSED';
    
    if (isCompleted || isWithdrawn) {
      showToast('Investment is already closed', 'info');
    } 
  }
  
  setSelectedInvestment(investment);
  setShowModal(true);
};

// Update the isInvestmentClosed logic in the Withdrawal.tsx component
const isInvestmentClosed = (investment: Investment) => {
  // First check explicit status
  const isCompleted = investment.status === 'COMPLETED';
  const isWithdrawn = investment.withdrawalStatus === 'PROCESSED';
  
  // NEW: Also check if all ROI has been withdrawn
  const allROIWithdrawn = (investment.roiAmount || 0) <= 0 && (investment.totalRoiAdded || 0) > 0;
  
  return isCompleted || isWithdrawn || allROIWithdrawn;
};

  const handleConfirmWithdrawal = async (withdrawalData: any) => {
    try {
      // Validate data
      if (!withdrawalData.userInvestmentId) {
        showToast('Error: Investment ID is missing', "error");
        return;
      }
      
      const investment = investments.find(inv => inv.id === withdrawalData.userInvestmentId);
      if (!investment) {
        showToast('Investment not found', "error");
        return;
      }
      
      if (withdrawalData.amount > (investment.roiAmount || 0)) {
        showToast(`Cannot withdraw more than available ROI ($${investment.roiAmount || 0})`, "error");
        return;
      }

      const response = await axiosInstance.post('/api/withdrawals/request', withdrawalData);
      
      showToast('Withdrawal request submitted successfully!', "success");
      
      // Update UI immediately
      setInvestments(prev => prev.map(inv => {
        if (inv.id === withdrawalData.userInvestmentId) {
          return { 
            ...inv, 
            roiAmount: response.data.remainingROI || 0,
            withdrawalStatus: 'PENDING' as WithdrawalStatus
          };
        }
        return inv;
      }));
      
      fetchAllData();
      setShowModal(false);
      setSelectedInvestment(null);
      
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      showToast(error.response?.data?.error || 'Failed to submit withdrawal request', "error");
    }
  };

  const getStatusBadge = (investment: Investment) => {
  // NEW: Check if all ROI is withdrawn
  const allROIWithdrawn = (investment.roiAmount || 0) <= 0 && (investment.totalRoiAdded || 0) > 0;
  
  // Check if investment has been fully withdrawn/closed
  const isCompleted = investment.status === 'COMPLETED';
  const isWithdrawn = investment.withdrawalStatus === 'PROCESSED';
  
  // UPDATED: Include allROIWithdrawn in the check
  if (isCompleted || isWithdrawn || allROIWithdrawn) {
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold flex items-center gap-1">
        <FiCheckCircle /> Closed
      </span>
    );
  }

  if (investment.withdrawalStatus === 'PENDING') {
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

  // For ACTIVE investments
  if (investment.status === 'ACTIVE' && investment.startDate) {
    if (canWithdraw(investment)) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
          <FiCheckCircle /> ROI Ready to Withdraw
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

  const totalAvailableROI = investments
    .filter(inv => {
      const isCompleted = inv.status === 'COMPLETED';
      const isWithdrawn = inv.withdrawalStatus === 'PROCESSED';
      
      return inv.status === 'ACTIVE' && 
             !isWithdrawn &&
             !isCompleted;
    })
    .reduce((sum, inv) => sum + (inv.roiAmount || 0), 0);

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
        <img src={HomeUtils[0].companyLogo} alt="" className='w-16 sm:w-20 lg:w-24 xl:w-32'/>
        <p className='text-white mt-4 text-base sm:text-lg lg:text-xl'>Page Loading...</p>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Withdraw ROI</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Withdraw returns from your investments
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm sm:text-base"
            >
              {showHistory ? 'Back to Investments' : 'View Withdrawal History'}
            </button>
          </div>
        </div>

        {/* ROI Summary Card */}
        <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-4 sm:p-6 mb-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-2">ROI Summary</h2>
              <p className="text-purple-100 text-sm sm:text-base">Total ROI available for withdrawal</p>
            </div>
            <div className="text-left lg:text-right">
              <div className="text-3xl lg:text-4xl font-bold mb-1">${formatCurrency(totalAvailableROI)}</div>
              <p className="text-purple-200 text-xs sm:text-sm">
                Across {investments.filter(inv => {
                  const isCompleted = inv.status === 'COMPLETED';
                  const isWithdrawn = inv.withdrawalStatus === 'PROCESSED';
                  
                  return inv.status === 'ACTIVE' && 
                         (inv.roiAmount || 0) > 0 && 
                         !isWithdrawn &&
                         !isCompleted;
                }).length} investment(s)
              </p>
            </div>
          </div>
        </div>

        {/* Info Box - Only show when viewing investments, not withdrawal history */}
        {!showHistory && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">ROI Withdrawal Information</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Withdrawal Eligibility: ROI withdrawals are available once the due time is reached. You will be notified via email when your ROI becomes eligible for withdrawal.</li>
                  <li>Withdrawal Methods: Investors may choose to receive their ROI through either a bank transfer (to a verified bank account) or a cryptocurrency wallet (supported wallets only).</li>
                  <li>Processing Time: After a valid withdrawal request is submitted and successfully verified, processing is typically completed within 24 hours.</li>
                  <li>Available ROI: Only the ROI amount that has been officially credited to your investment balance is eligible for withdrawal.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal History */}
        {showHistory && (
          <WithdrawalHistory 
            withdrawals={withdrawalHistory} 
            onRefresh={fetchWithdrawalHistory}
          />
        )}

        {/* Investments List */}
        {!showHistory && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div className="text-gray-600 text-sm sm:text-base">
                Showing {investments.length} investment{investments.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={fetchAllData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-sm sm:text-base"
              >
                <FiRefreshCw /> Refresh
              </button>
            </div>

            {investments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
                <FiDollarSign className="text-5xl sm:text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-lg sm:text-xl text-gray-600 mb-4">No investments yet</p>
                <Link
                  to="/view-investment"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm sm:text-base"
                >
                  Browse Investments
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {investments.map((investment) => {
                  const isClosed = isInvestmentClosed(investment);
                  
                  return (
                    <div
                      key={investment.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                    >
                      {/* Header - UPDATED: Changed closed investment color to slate */}
                      <div className={`p-6 text-white ${
                        isClosed 
                          ? 'bg-linear-to-r from-slate-600 to-slate-700' // CHANGED from gray-600/gray-700 to slate-600/slate-700
                          : 'bg-linear-to-r from-blue-600 to-purple-600'
                      }`}>
                        <h3 className="font-bold text-base sm:text-lg mb-2">{investment.investment.title}</h3>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
                          {investment.investment.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-6">
                        <div className="space-y-4 mb-6">
                          <div>
                            <p className="text-gray-600 text-xs sm:text-sm">Investment Amount</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-800">
                              ${formatNumber(investment.amount)}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-600 text-xs sm:text-sm">ROI Available</p>
                              <p className={`text-lg sm:text-xl font-bold flex items-center gap-1 ${
                                isClosed ? 'text-slate-600' : 'text-purple-600' // CHANGED from gray-600 to slate-600
                              }`}>
                                <FiTrendingUp /> ${formatCurrency(investment.roiAmount)}
                              </p>
                              {isClosed && investment.totalRoiAdded && investment.totalRoiAdded > 0 && (
                                <p className="text-xs text-slate-500 mt-1"> {/* CHANGED from gray-500 to slate-500 */}
                                  Total earned: ${formatCurrency(investment.totalRoiAdded)}
                                </p>
                              )}
                            </div>
                          </div>

                          {(investment.totalRoiAdded || 0) > 0 && !isClosed && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Total ROI Added:</span>
                                <span className="font-semibold">${formatCurrency(investment.totalRoiAdded)}</span>
                              </div>
                            </div>
                          )}

                          {investment.startDate && !isClosed && (
                            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                              <div>
                                <p className="text-gray-600">Start Date</p>
                                <p className="font-semibold">
                                  {new Date(investment.startDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                          {getStatusBadge(investment)}
                        </div>

                        {/* Withdraw Button */}
                        {isClosed ? (
                          <div className="text-center p-3 bg-slate-50 rounded-lg"> {/* CHANGED from gray-50 to slate-50 */}
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-600"> {/* CHANGED from gray-600 to slate-600 */}
                              <FiCheckCircle className="text-slate-500" /> {/* CHANGED from green-500 to slate-500 */}
                              <span>Investment closed</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1"> {/* CHANGED from gray-500 to slate-500 */}
                              ROI already withdrawn
                            </p>
                          </div>
                        ) : canWithdraw(investment) ? (
                          <button
                            onClick={() => handleWithdrawClick(investment)}
                            className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base"
                          >
                            Withdraw ROI (${formatCurrency(investment.roiAmount)})
                          </button>
                        ) : investment.withdrawalStatus === 'PENDING' ? (
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs sm:text-sm text-yellow-800">
                              ROI withdrawal request is being processed
                            </p>
                          </div>
                        ) : investment.status === 'PENDING' ? (
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs sm:text-sm text-yellow-800">
                              Waiting for confirmation
                            </p>
                          </div>
                        ) : (
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-600">No ROI available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
  );
};

export default Withdrawal;
