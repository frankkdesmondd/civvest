// components/WithdrawalModal.tsx
import React, { useState } from 'react';
import { FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useUser } from '../context/UserContext';

interface WithdrawalInvestment {
  id: string;
  amount: number;
  roiAmount: number;
  investment: {
    title: string;
    category: string;
  };
}

interface WithdrawalModalProps {
  investment: WithdrawalInvestment;
  onClose: () => void;
  onConfirm: (withdrawalData: any) => void;
  maxAmount?: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ 
  investment, 
  onClose, 
  onConfirm 
}) => {
  const { user } = useUser();
  // Use roiAmount as maxAmount
  const maxAmount = investment.roiAmount || 0;
  const [amount, setAmount] = useState<string>(maxAmount.toString());
  const [type, setType] = useState<'BANK_TRANSFER' | 'CRYPTO_WALLET'>('BANK_TRANSFER');
  const [loading, setLoading] = useState(false);
  
  // Bank transfer details
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountName: user?.firstName + ' ' + user?.lastName || '',
    accountNumber: '',
    routingCode: ''
  });
  
  // Crypto wallet details
  const [walletDetails, setWalletDetails] = useState({
    coinHost: 'USDT',
    walletAddress: ''
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value) || 0;
      if (numValue <= maxAmount) {
        setAmount(value);
      } else {
        setAmount(maxAmount.toString());
      }
    }
  };

  const handleMaxClick = () => {
    setAmount(maxAmount.toString());
  };

  const handleBankDetailChange = (field: string, value: string) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleWalletDetailChange = (field: string, value: string) => {
    setWalletDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawalAmount = parseFloat(amount);
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount > maxAmount) {
      alert(`Cannot withdraw more than $${maxAmount} (available ROI)`);
      return;
    }

    if (type === 'BANK_TRANSFER') {
      if (!bankDetails.bankName || !bankDetails.accountName || !bankDetails.accountNumber) {
        alert('Please fill all bank details');
        return;
      }
    } else {
      if (!walletDetails.walletAddress) {
        alert('Please enter your wallet address');
        return;
      }
    }

    setLoading(true);
    
    const withdrawalData = {
      userInvestmentId: investment.id,
      amount: withdrawalAmount,
      type,
      ...(type === 'BANK_TRANSFER' ? { bankDetails } : { walletDetails })
    };

    await onConfirm(withdrawalData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Withdraw ROI</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            <FiX />
          </button>
        </div>

        <div className="p-6">
          {/* Investment Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">{investment.investment.title}</h3>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Available ROI:</span>
                <span className="font-bold text-purple-600">${maxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Principal Investment:</span>
                <span className="font-semibold">${investment.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ROI Info Alert */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <FiInfo className="text-purple-600 mt-0.5 shrink-0" />
              <div className="text-sm text-purple-800">
                <p className="font-semibold">ROI Withdrawal Only</p>
                <p>You can only withdraw the ROI amount ({investment.roiAmount?.toFixed(2) || '0.00'}) allocated by admin.</p>
                <p className="mt-1 font-medium">Principal amount (${investment.amount.toLocaleString()}) cannot be withdrawn.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Amount to Withdraw (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full pl-8 pr-24 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter amount"
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold hover:bg-blue-200"
                >
                  Max
                </button>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">
                  Max: ${maxAmount.toLocaleString()}
                </span>
                {amount && parseFloat(amount) > maxAmount && (
                  <span className="text-sm text-red-500">
                    Exceeds available ROI
                  </span>
                )}
              </div>
            </div>

            {/* Withdrawal Type */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Withdrawal Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('BANK_TRANSFER')}
                  className={`p-4 rounded-lg border-2 font-semibold transition ${
                    type === 'BANK_TRANSFER'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setType('CRYPTO_WALLET')}
                  className={`p-4 rounded-lg border-2 font-semibold transition ${
                    type === 'CRYPTO_WALLET'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Crypto Wallet
                </button>
              </div>
            </div>

            {/* Bank Transfer Details */}
            {type === 'BANK_TRANSFER' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Chase, Bank of America"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Account Name</label>
                  <input
                    type="text"
                    value={bankDetails.accountName}
                    onChange={(e) => handleBankDetailChange('accountName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => handleBankDetailChange('accountNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 1234567890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Routing Code (Optional)</label>
                  <input
                    type="text"
                    value={bankDetails.routingCode}
                    onChange={(e) => handleBankDetailChange('routingCode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 021000021"
                  />
                </div>
              </div>
            )}

            {/* Crypto Wallet Details */}
            {type === 'CRYPTO_WALLET' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Coin Host</label>
                  <select
                    value={walletDetails.coinHost}
                    onChange={(e) => handleWalletDetailChange('coinHost', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="TRON">TRON</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Wallet Address</label>
                  <input
                    type="text"
                    value={walletDetails.walletAddress}
                    onChange={(e) => handleWalletDetailChange('walletAddress', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder={`Enter your ${walletDetails.coinHost} wallet address`}
                    required
                  />
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Important</p>
                  <p>Withdrawal requests require approval. Processing time: 24-48 hours.</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Request Withdrawal'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
