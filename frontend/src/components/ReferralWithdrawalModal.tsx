// components/ReferralWithdrawalModal.tsx
import React, { useState } from 'react';
import { FiX, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import axiosInstance from '../config/axios';
import { useToast } from '../context/ToastContext';

interface ReferralWithdrawalModalProps {
  onClose: () => void;
  onSuccess: () => void;
  user: {
    referralBonus: number;
    referralCount: number;
  };
}

const ReferralWithdrawalModal: React.FC<ReferralWithdrawalModalProps> = ({ 
  onClose, 
  onSuccess,
  user 
}) => {
  const [amount, setAmount] = useState('');
  const [withdrawalType, setWithdrawalType] = useState<'BANK_TRANSFER' | 'CRYPTO_WALLET'>('BANK_TRANSFER');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Bank details
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingCode, setRoutingCode] = useState('');

  // Crypto details
  const [coinHost, setCoinHost] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const canWithdraw = user.referralCount >= 10 && user.referralBonus > 0;
  const referralsNeeded = Math.max(0, 10 - user.referralCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canWithdraw) {
      showToast(`You need ${referralsNeeded} more referral(s) to withdraw`, 'error');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (withdrawAmount > user.referralBonus) {
      showToast('Amount exceeds available referral bonus', 'error');
      return;
    }

    setLoading(true);

    try {
      const withdrawalData: any = {
        amount: withdrawAmount,
        type: withdrawalType
      };

      if (withdrawalType === 'BANK_TRANSFER') {
        if (!bankName || !accountName || !accountNumber) {
          showToast('Please fill in all bank details', 'error');
          setLoading(false);
          return;
        }
        withdrawalData.bankDetails = {
          bankName,
          accountName,
          accountNumber,
          routingCode
        };
      } else {
        if (!coinHost || !walletAddress) {
          showToast('Please fill in all wallet details', 'error');
          setLoading(false);
          return;
        }
        withdrawalData.walletDetails = {
          coinHost,
          walletAddress
        };
      }

      await axiosInstance.post('/api/referral-withdrawals/request-referral', withdrawalData);
      
      showToast('Referral bonus withdrawal request submitted successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Referral withdrawal error:', error);
      showToast(
        error.response?.data?.error || 'Failed to submit withdrawal request',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Withdraw Referral Bonus</h2>
            <p className="text-sm text-gray-600 mt-1">
              Available: ${user.referralBonus.toFixed(2)} | Referrals: {user.referralCount}/10
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Eligibility Check */}
          {!canWithdraw && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Withdrawal Not Available</h3>
                  <p className="text-sm text-yellow-700">
                    {user.referralCount < 10
                      ? `You need ${referralsNeeded} more referral(s) to unlock withdrawal. Current: ${user.referralCount}/10`
                      : 'No referral bonus available to withdraw'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {canWithdraw && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Withdrawal Amount *
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={user.referralBonus}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ${user.referralBonus.toFixed(2)}
                </p>
              </div>

              {/* Withdrawal Type */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Withdrawal Method *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setWithdrawalType('BANK_TRANSFER')}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      withdrawalType === 'BANK_TRANSFER'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">Bank Transfer</p>
                    <p className="text-xs text-gray-600 mt-1">Transfer to bank account</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalType('CRYPTO_WALLET')}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      withdrawalType === 'CRYPTO_WALLET'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">Crypto Wallet</p>
                    <p className="text-xs text-gray-600 mt-1">Transfer to wallet</p>
                  </button>
                </div>
              </div>

              {/* Bank Details */}
              {withdrawalType === 'BANK_TRANSFER' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800">Bank Details</h3>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Bank Name *</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Account Name *</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Enter account holder name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Account Number *</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Routing/Swift Code</label>
                    <input
                      type="text"
                      value={routingCode}
                      onChange={(e) => setRoutingCode(e.target.value)}
                      placeholder="Enter routing or swift code (optional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Crypto Details */}
              {withdrawalType === 'CRYPTO_WALLET' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800">Wallet Details</h3>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Cryptocurrency *</label>
                    <select
                      value={coinHost}
                      onChange={(e) => setCoinHost(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select cryptocurrency</option>
                      <option value="Bitcoin">Bitcoin (BTC)</option>
                      <option value="Ethereum">Ethereum (ETH)</option>
                      <option value="USDT">Tether (USDT)</option>
                      <option value="USDC">USD Coin (USDC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Wallet Address *</label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter wallet address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || !canWithdraw}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
                >
                  {loading ? 'Processing...' : 'Submit Withdrawal Request'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your withdrawal request will be reviewed by an administrator. 
              Once approved, the funds will be transferred to your specified account within 1-3 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralWithdrawalModal;