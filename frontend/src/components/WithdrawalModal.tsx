import React, { useState } from 'react';
import { FiCreditCard, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { useUser } from '../context/UserContext'; // Import useUser hook

interface Wallet {
  id: string;
  coinHost: string;
  walletAddress: string;
}

interface Investment {
  id: string;
  amount: number;
  returnAmount: number;
  investment: {
    title: string;
  };
}

// Remove the User interface from here since we're getting it from context
interface WithdrawalModalProps {
  investment: Investment;
  // user: User; // Remove this prop since we'll get it from context
  onClose: () => void;
  onConfirm: (data: WithdrawalData) => void;
}

interface WithdrawalData {
  userInvestmentId: string;
  amount: number;
  type: 'BANK_TRANSFER' | 'CRYPTO_WALLET';
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingCode?: string;
  coinHost?: string;
  walletAddress?: string;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  investment,
  // user, // Remove from props
  onClose,
  onConfirm
}) => {
  const { user } = useUser(); // Get user from context
  const [step, setStep] = useState(1);
  const [withdrawalType, setWithdrawalType] = useState<'BANK_TRANSFER' | 'CRYPTO_WALLET' | null>(null);
  const [useSavedDetails, setUseSavedDetails] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [bankDetails, setBankDetails] = useState({
    bankName: user?.bankName || '',
    accountName: user?.accountName || '',
    accountNumber: user?.bankAccountNumber || '',
    routingCode: user?.routingCode || ''
  });
  
  const [walletDetails, setWalletDetails] = useState({
    coinHost: '',
    walletAddress: ''
  });
  
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  
  // Calculate available profit (returnAmount - amount)
  const availableProfit = investment.returnAmount - investment.amount;
  
  // Default to full profit amount
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(availableProfit);

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankDetails({
      ...bankDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleWalletDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletDetails({
      ...walletDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setWithdrawalAmount(value);
    }
  };

  const handleWalletSelect = (walletId: string) => {
    const wallet = user?.wallets?.find((w: Wallet) => w.id === walletId);
    if (wallet) {
      setWalletDetails({
        coinHost: wallet.coinHost,
        walletAddress: wallet.walletAddress
      });
      setSelectedWallet(walletId);
    }
  };

  const handleSubmit = () => {
    if (!withdrawalType || !user) return;

    // Validate amount
    if (withdrawalAmount <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }

    if (withdrawalAmount > availableProfit) {
      alert(`Withdrawal amount cannot exceed $${availableProfit.toLocaleString()} (your profit)`);
      return;
    }

    const withdrawalData: WithdrawalData = {
      userInvestmentId: investment.id,
      amount: withdrawalAmount,
      type: withdrawalType
    };

    if (withdrawalType === 'BANK_TRANSFER') {
      if (!bankDetails.bankName || !bankDetails.accountName || !bankDetails.accountNumber) {
        alert('Please fill in all required bank details');
        return;
      }
      Object.assign(withdrawalData, {
        bankName: bankDetails.bankName,
        accountName: bankDetails.accountName,
        accountNumber: bankDetails.accountNumber,
        routingCode: bankDetails.routingCode || ''
      });
    } else {
      if (!walletDetails.coinHost || !walletDetails.walletAddress) {
        alert('Please fill in all wallet details');
        return;
      }
      Object.assign(withdrawalData, {
        coinHost: walletDetails.coinHost,
        walletAddress: walletDetails.walletAddress
      });
    }

    console.log('Submitting withdrawal data:', withdrawalData);
    onConfirm(withdrawalData);
    setShowSuccess(true);
    
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Withdraw Profit</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Investment Summary */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Investment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm">Investment</p>
                  <p className="font-bold">{investment.investment.title}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-md">
                  <p className="text-gray-600 text-xs">Initial Investment</p>
                  <p className="font-bold text-gray-800">${investment.amount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3 rounded-md">
                  <p className="text-gray-600 text-xs">Total Return</p>
                  <p className="font-bold text-green-600">${investment.returnAmount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">Available Profit</p>
                    <p className="text-xs text-gray-600">(Return - Initial Investment)</p>
                  </div>
                  <p className="text-lg font-bold text-green-700">${availableProfit.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Input Section - Always visible */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Withdraw Profit Amount</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Enter amount to withdraw (Max: ${availableProfit.toLocaleString()} profit)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={handleAmountChange}
                    min="0"
                    max={availableProfit}
                    step="0.01"
                    className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Minimum: $0</span>
                  <span>Maximum: ${availableProfit.toLocaleString()}</span>
                </div>               
                
              </div>
            </div>
          </div>

          {/* Step 1: Choose Withdrawal Method */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Select Withdrawal Method</h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setWithdrawalType('BANK_TRANSFER');
                    setStep(2);
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-4"
                >
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FiCreditCard className="text-blue-600 text-xl" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800">Bank Transfer</h4>
                    <p className="text-sm text-gray-600">Transfer to your bank account</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setWithdrawalType('CRYPTO_WALLET');
                    setStep(2);
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition flex items-center gap-4"
                >
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FiDollarSign className="text-purple-600 text-xl" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800">Crypto Wallet</h4>
                    <p className="text-sm text-gray-600">Transfer to your crypto wallet</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Enter Details */}
          {step === 2 && withdrawalType && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Back
                </button>
                <h3 className="text-lg font-bold text-gray-800">
                  {withdrawalType === 'BANK_TRANSFER' ? 'Bank Details' : 'Wallet Details'}
                </h3>
              </div>

              {/* Use Saved Details Toggle */}
              {user && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSavedDetails}
                      onChange={(e) => setUseSavedDetails(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Use saved {withdrawalType === 'BANK_TRANSFER' ? 'bank' : 'wallet'} details
                    </span>
                  </label>
                </div>
              )}

              {/* Bank Transfer Form */}
              {withdrawalType === 'BANK_TRANSFER' && (
                <div className="space-y-4">
                  {useSavedDetails && user?.bankName ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Saved Bank Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Bank:</span> {user.bankName}</p>
                        <p><span className="text-gray-600">Account Name:</span> {user.accountName}</p>
                        <p><span className="text-gray-600">Account Number:</span> {user.bankAccountNumber}</p>
                        {user.routingCode && (
                          <p><span className="text-gray-600">Routing Code:</span> {user.routingCode}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setUseSavedDetails(false)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Use different account
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Bank Name *</label>
                        <input
                          type="text"
                          name="bankName"
                          value={bankDetails.bankName}
                          onChange={handleBankDetailsChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Enter bank name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Account Name *</label>
                        <input
                          type="text"
                          name="accountName"
                          value={bankDetails.accountName}
                          onChange={handleBankDetailsChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Enter account name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Account Number *</label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={bankDetails.accountNumber}
                          onChange={handleBankDetailsChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Enter account number"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Routing Code (Optional)</label>
                        <input
                          type="text"
                          name="routingCode"
                          value={bankDetails.routingCode}
                          onChange={handleBankDetailsChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Enter routing code"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Crypto Wallet Form */}
              {withdrawalType === 'CRYPTO_WALLET' && (
                <div className="space-y-4">
                  {useSavedDetails && user?.wallets && user.wallets.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Select Saved Wallet</h4>
                      <div className="space-y-2">
                        {user.wallets.map((wallet: Wallet) => (
                          <div
                            key={wallet.id}
                            onClick={() => handleWalletSelect(wallet.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition ${
                              selectedWallet === wallet.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-800">{wallet.coinHost}</p>
                                <p className="text-xs text-gray-600 truncate">{wallet.walletAddress}</p>
                              </div>
                              {selectedWallet === wallet.id && (
                                <FiCheckCircle className="text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setUseSavedDetails(false)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Use different wallet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Coin/Host *</label>
                        <input
                          type="text"
                          name="coinHost"
                          value={walletDetails.coinHost}
                          onChange={handleWalletDetailsChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., Bitcoin, Ethereum, USDT"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Wallet Address *</label>
                        <input
                          type="text"
                          name="walletAddress"
                          value={walletDetails.walletAddress}
                          onChange={handleWalletDetailsChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Enter wallet address"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={withdrawalAmount <= 0 || withdrawalAmount > availableProfit}
                className={`w-full mt-6 py-3 rounded-lg font-semibold ${
                  withdrawalAmount <= 0 || withdrawalAmount > availableProfit
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Request Withdrawal of ${withdrawalAmount.toLocaleString()}
              </button>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Profit Withdrawal Request Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Your profit withdrawal request of ${withdrawalAmount.toLocaleString()} has been sent. An admin will approve this.
              </p>
              <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold mb-1">Investment Status:</p>
                <p>• Initial investment: ${investment.amount.toLocaleString()} remains active</p>
                <p>• Profit withdrawn: ${withdrawalAmount.toLocaleString()}</p>
                <p>• Remaining profit: ${(availableProfit - withdrawalAmount).toLocaleString()}</p>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                You can track the status in your withdrawal history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
