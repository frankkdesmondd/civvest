// components/WithdrawalModal.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiInfo, FiCheck, FiCreditCard, FiAirplay } from 'react-icons/fi';
import { useUser } from '../context/UserContext';
import axiosInstance from '../config/axios';

interface WithdrawalInvestment {
  id: string;
  amount: number;
  roiAmount: number;
  investment: {
    title: string;
    category: string;
  };
}

interface WalletDetails {
  id: string;
  coinHost: string;
  walletAddress: string;
  isDefault?: boolean;
}

interface UserProfile {
  bankName?: string;
  accountName?: string;
  bankAccountNumber?: string;
  routingCode?: string;
  wallets?: WalletDetails[];
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
  const maxAmount = investment.roiAmount || 0;
  const [amount, setAmount] = useState<string>(maxAmount.toString());
  const [type, setType] = useState<'BANK_TRANSFER' | 'CRYPTO_WALLET'>('BANK_TRANSFER');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Options for saved details
  const [useSavedBank, setUseSavedBank] = useState(true);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [useNewDetails, setUseNewDetails] = useState(false);
  
  // Form details
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountName: user?.firstName + ' ' + user?.lastName || '',
    accountNumber: '',
    routingCode: ''
  });
  
  const [walletDetails, setWalletDetails] = useState({
    coinHost: 'USDT',
    walletAddress: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // If user has saved bank details and we want to use them, pre-fill
    if (userProfile && useSavedBank && type === 'BANK_TRANSFER') {
      if (userProfile.bankName && userProfile.accountName && userProfile.bankAccountNumber) {
        setBankDetails({
          bankName: userProfile.bankName,
          accountName: userProfile.accountName,
          accountNumber: userProfile.bankAccountNumber,
          routingCode: userProfile.routingCode || ''
        });
      }
    }
    
    // If user has saved wallets and we want to use them, select first one
    if (userProfile?.wallets && userProfile.wallets.length > 0 && type === 'CRYPTO_WALLET') {
      const defaultWallet = userProfile.wallets.find(w => w.isDefault) || userProfile.wallets[0];
      if (defaultWallet && !selectedWalletId) {
        setSelectedWalletId(defaultWallet.id);
        setWalletDetails({
          coinHost: defaultWallet.coinHost,
          walletAddress: defaultWallet.walletAddress
        });
      }
    }
  }, [userProfile, useSavedBank, type, selectedWalletId]);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await axiosInstance.get('/api/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

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

  const handleWalletSelect = (walletId: string) => {
    setSelectedWalletId(walletId);
    const selectedWallet = userProfile?.wallets?.find(w => w.id === walletId);
    if (selectedWallet) {
      setWalletDetails({
        coinHost: selectedWallet.coinHost,
        walletAddress: selectedWallet.walletAddress
      });
    }
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

  // Check if user has saved bank details
  const hasSavedBankDetails = userProfile?.bankName && 
                              userProfile?.accountName && 
                              userProfile?.bankAccountNumber;

  // Check if user has saved wallets
  const hasSavedWallets = userProfile?.wallets && userProfile.wallets.length > 0;

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
                <p className="font-semibold">ROI Withdrawal Notice</p>
                <p>1. Investment maturity notifications are communicated via email only. Please ensure your registered email address is active and monitored regularly.</p>
                <p className="mt-1 font-medium">2. Any ROI withdrawal initiated before official company notification will attract a processing fee before the ROI can be refunded back to your dashboard.</p>
                <p>3. Kindly wait for official confirmation before initiating any withdrawal.</p>
                <p>4. For further clarification, please contact customer support.</p>
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
                  className={`p-4 rounded-lg border-2 font-semibold transition flex items-center justify-center gap-2 ${
                    type === 'BANK_TRANSFER'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FiCreditCard /> Bank
                </button>
                <button
                  type="button"
                  onClick={() => setType('CRYPTO_WALLET')}
                  className={`p-4 rounded-lg border-2 font-semibold transition flex items-center justify-center gap-2 ${
                    type === 'CRYPTO_WALLET'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FiAirplay /> Crypto
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loadingProfile && (
              <div className="mb-6 text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading your saved details...</p>
              </div>
            )}

            {/* BANK TRANSFER SECTION */}
            {type === 'BANK_TRANSFER' && !loadingProfile && (
              <div className="mb-6">
                {/* Saved Bank Details Option */}
                {hasSavedBankDetails && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 font-semibold text-gray-700">
                        <FiCheck className="text-green-500" />
                        Use Saved Bank Details
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseSavedBank(!useSavedBank)}
                        className={`px-3 py-1 text-sm rounded-full font-medium ${
                          useSavedBank
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {useSavedBank ? 'Using Saved' : 'Use Saved'}
                      </button>
                    </div>
                    
                    {useSavedBank ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bank:</span>
                            <span className="font-semibold">{userProfile?.bankName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account Name:</span>
                            <span className="font-semibold">{userProfile?.accountName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account Number:</span>
                            <span className="font-semibold">••••{userProfile?.bankAccountNumber?.slice(-4)}</span>
                          </div>
                          {userProfile?.routingCode && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Routing Code:</span>
                              <span className="font-semibold">{userProfile.routingCode}</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setUseSavedBank(false)}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Use different bank details
                        </button>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={() => setUseSavedBank(true)}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
                        >
                          Use Saved Bank Details Instead
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Bank Transfer Details Form */}
                {(!useSavedBank || !hasSavedBankDetails) && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Enter Bank Details</h3>
                    <div>
                      <label className="block text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={bankDetails.bankName}
                        onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="e.g., Chase, Bank of America"
                        required={!useSavedBank}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Account Name</label>
                      <input
                        type="text"
                        value={bankDetails.accountName}
                        onChange={(e) => handleBankDetailChange('accountName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        required={!useSavedBank}
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
                        required={!useSavedBank}
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
              </div>
            )}

            {/* CRYPTO WALLET SECTION */}
            {type === 'CRYPTO_WALLET' && !loadingProfile && (
              <div className="mb-6">
                {/* Saved Wallets Option */}
                {hasSavedWallets && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 font-semibold text-gray-700">
                        <FiCheck className="text-green-500" />
                        Choose Saved Wallet
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseNewDetails(!useNewDetails)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full font-medium hover:bg-gray-200"
                      >
                        {useNewDetails ? 'New Wallet' : 'Use Saved'}
                      </button>
                    </div>
                    
                    {!useNewDetails && (
                      <div className="space-y-3">
                        {userProfile?.wallets?.map((wallet) => (
                          <div
                            key={wallet.id}
                            className={`p-3 border rounded-lg cursor-pointer transition ${
                              selectedWalletId === wallet.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleWalletSelect(wallet.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-gray-800">{wallet.coinHost}</div>
                                <div className="text-sm text-gray-600 truncate">
                                  {wallet.walletAddress.slice(0, 20)}...{wallet.walletAddress.slice(-10)}
                                </div>
                              </div>
                              {selectedWalletId === wallet.id && (
                                <FiCheck className="text-blue-500 text-xl" />
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setUseNewDetails(true)}
                          className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Use a different wallet address
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* New Wallet Details Form */}
                {(useNewDetails || !hasSavedWallets) && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Enter Wallet Details</h3>
                    {hasSavedWallets && (
                      <button
                        type="button"
                        onClick={() => setUseNewDetails(false)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
                      >
                        Choose from Saved Wallets Instead
                      </button>
                    )}
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
                        required={useNewDetails || !hasSavedWallets}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Saved Details Message */}
            {!loadingProfile && (
              <div className="mb-6">
                {type === 'BANK_TRANSFER' && !hasSavedBankDetails && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FiInfo className="text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p>You haven't saved any bank details yet. Add them to your profile for faster withdrawals next time.</p>
                      </div>
                    </div>
                  </div>
                )}
                {type === 'CRYPTO_WALLET' && !hasSavedWallets && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FiInfo className="text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p>You haven't saved any wallet addresses yet. Add them to your profile for faster withdrawals next time.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Important</p>
                  <p>Withdrawal requests require approval. Processing time: 24-48 hours.</p>
                  <p className="mt-1">Double-check all details before submitting.</p>
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



