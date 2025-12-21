import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiAlertCircle, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { HomeUtils } from '../utils/HomeUtils';
import WithdrawalModal from '../components/WithdrawalModal';
import WithdrawalHistory from '../components/WithdrawalHistory';
import { useToast } from '../context/ToastContext';
import axiosInstance from '../config/axios';

interface Investment {
  id: string;
  amount: number;
  returnAmount: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
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

const Withdrawal: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchInvestments(),
        fetchUserProfile(),
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
      setInvestments(response.data);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/api/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
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
    const daysRemaining = getDaysRemaining(investment.endDate);
    return daysRemaining !== null && daysRemaining <= 0;
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

      const response = await axiosInstance.post('/withdrawals/request', withdrawalData);
      
      console.log('Withdrawal response:', response.data);
      showToast(response.data.message, "success");
      fetchAllData();
      
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
            <FiCheckCircle /> Ready to Withdraw
          </span>
        );
      }

      const daysRemaining = getDaysRemaining(investment.endDate);
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1">
          <FiClock /> {daysRemaining} days remaining
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
        {investment.status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#041a35] flex flex-col items-center justify-center">
        <img src={HomeUtils[0].companyLogo} alt="" className='w-[8em]'/>
        <p className='text-white'>Page Loading......</p>
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
              <h1 className="text-3xl font-bold text-gray-800">Withdraw Investments</h1>
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

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Withdrawal Information</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You can only withdraw after the investment maturity period</li>
                <li>The maturity period starts after admin confirms your deposit</li>
                <li>Withdrawal requests require admin approval</li>
                <li>You can choose between bank transfer or crypto wallet transfer</li>
                <li>Track your withdrawal requests in the history section</li>
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
            <div className="flex justify-end mb-4">
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
                            ${investment.amount.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600 text-sm">Expected Return</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${investment.returnAmount.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600 text-sm">Profit</p>
                          <p className="text-xl font-bold text-purple-600">
                            ${(investment.returnAmount - investment.amount).toLocaleString()}
                          </p>
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
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                        >
                          Withdraw Now
                        </button>
                      ) : investment.status === 'PENDING_WITHDRAWAL' ? (
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            Withdrawal request pending admin approval
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
                          <p className="text-sm text-gray-600">Already withdrawn</p>
                        </div>
                      ) : (
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {getDaysRemaining(investment.endDate)} days until maturity
                          </p>
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

export default Withdrawal;
