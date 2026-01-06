import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiCopy, FiCheck, FiAlertCircle, FiUpload, FiFile, FiX } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Foot from '../components/Foot';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import axiosInstance from '../config/axios';
import { HomeUtils } from '../utils/HomeUtils';

interface Investment {
  id: string;
  title: string;
  minAmount: number;
  returnRate: string;
  duration: string;
}

interface WalletAddresses {
  ETH: string;
  TRON: string;
}

const Deposit: React.FC = () => {
  const { investmentId } = useParams<{ investmentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [wallets, setWallets] = useState<WalletAddresses | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'ETH' | 'TRON'>('ETH');
  const [loading, setLoading] = useState(false);
  const [copiedEth, setCopiedEth] = useState(false);
  const [copiedTron, setCopiedTron] = useState(false);
  const [error, setError] = useState('');
  const [investment, setInvestment] = useState<Investment | null>(location.state?.investment || null);
  const [amount, setAmount] = useState(location.state?.selectedAmount || '');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');

  useEffect(() => {
    if (!investment) {
      fetchInvestment();
    }
    fetchWallets();
  }, [investmentId]);

  const fetchInvestment = async () => {
    try {
      const response = await axiosInstance.get(`/investments/by-id/${investmentId}`);
      setInvestment(response.data);
    } catch (error) {
      console.error('Failed to fetch investment:', error);
      setError('Failed to load investment details');
      showToast('Failed to load investment details', 'error');
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await axiosInstance.get('/api/deposits/wallets');
      setWallets(response.data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      showToast('Failed to load wallet addresses', 'error');
    }
  };

  const copyToClipboard = (text: string, network: 'ETH' | 'TRON') => {
    navigator.clipboard.writeText(text);
    if (network === 'ETH') {
      setCopiedEth(true);
      setTimeout(() => setCopiedEth(false), 2000);
    } else {
      setCopiedTron(true);
      setTimeout(() => setCopiedTron(false), 2000);
    }
    showToast('Wallet address copied to clipboard!', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Only JPG, PNG, and PDF files are allowed', 'error');
        return;
      }

      setReceipt(file);

      // Create preview for images only
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview('');
      }
    }
  };

  const removeReceipt = () => {
    setReceipt(null);
    setReceiptPreview('');
  };

  const handleConfirmPaymentClick = () => {
    setError('');

    if (!amount || parseFloat(amount) < (investment?.minAmount || 0)) {
      showToast(`Minimum amount is $${investment?.minAmount.toLocaleString()}`, 'error');
      return;
    }

    if (!receipt) {
      showToast('Please upload your payment receipt', 'error');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('investmentId', investmentId!);
      formData.append('amount', amount);
      formData.append('network', selectedNetwork);
      formData.append('receipt', receipt!);

      await axiosInstance.post('/api/deposits', formData);

      showToast('Payment confirmation submitted and is being processed', 'success');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to submit deposit', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!investment || !wallets) {
    return (
      <div className="min-h-screen bg-[#041a35] flex flex-col items-center justify-center">
        <img src={HomeUtils[0].companyLogo} alt="" className='w-[8em]'/>
        <p className='text-white'>Page Loading......</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Payment"
        message="Have you completed the payment to the wallet address? Please make sure you've sent the funds before confirming."
        confirmText="Yes, I've Paid"
        cancelText="Not Yet"
        onConfirm={handleConfirmPayment}
        onCancel={() => setShowConfirmModal(false)}
        type="warning"
      />
      
      <div className="pt-[12em] px-4 lg:px-8 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Make Deposit</h1>
            <p className="text-gray-600 mb-8">Investment: {investment.title}</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <FiAlertCircle className="text-red-600 mt-0.5 shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Investment Details */}
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Investment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Minimum Amount</p>
                  <p className="font-bold text-lg">${investment.minAmount.toLocaleString()}</p>
                </div>
                {/* <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-bold text-lg">{investment.duration}</p>
                </div> */}
              </div>
            </div>

            {/* Network Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">Select Network</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedNetwork('ETH')}
                  className={`p-4 rounded-lg border-2 font-semibold transition ${
                    selectedNetwork === 'ETH'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  USDT (ETH Network)
                </button>
                <button
                  onClick={() => setSelectedNetwork('TRON')}
                  className={`p-4 rounded-lg border-2 font-semibold transition ${
                    selectedNetwork === 'TRON'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  USDT (TRON Network)
                </button>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">
                {selectedNetwork === 'ETH' ? 'ETH Network' : 'TRON Network'} Wallet Address
              </label>
              <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg border border-gray-300">
                <input
                  type="text"
                  value={selectedNetwork === 'ETH' ? wallets.ETH : wallets.TRON}
                  readOnly
                  className="flex-1 bg-transparent text-gray-800 font-mono text-sm outline-none"
                />
                <button
                  onClick={() => copyToClipboard(
                    selectedNetwork === 'ETH' ? wallets.ETH : wallets.TRON,
                    selectedNetwork
                  )}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  {(selectedNetwork === 'ETH' ? copiedEth : copiedTron) ? (
                    <FiCheck className="text-green-600" />
                  ) : (
                    <FiCopy className="text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Send your USDT to this address, then confirm below
              </p>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">
                Amount Transferred (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={investment.minAmount.toString()}
                  min={investment.minAmount}
                  className="w-full pl-8 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>
              {amount && parseFloat(amount) < investment.minAmount && (
                <p className="text-red-500 text-sm mt-2">
                  Amount must be at least ${investment.minAmount.toLocaleString()}
                </p>
              )}
            </div>

            {/* Receipt Upload */}
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-3">
                Upload Payment Receipt <span className="text-red-500">*</span>
              </label>
              
              {!receipt ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    id="receipt-upload"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUpload className="text-blue-600 text-2xl" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-semibold">Click to upload receipt</p>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG, or PDF (Max 5MB)
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {receiptPreview ? (
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FiFile className="text-gray-600 text-3xl" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{receipt.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {(receipt.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={removeReceipt}
                        className="mt-2 flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm"
                      >
                        <FiX /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Upload a screenshot or photo of your payment confirmation
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h4 className="font-bold text-gray-800 mb-2">⚠️ Important Instructions</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Send USDT to the wallet address above</li>
                <li>Make sure you select the correct network</li>
                <li>Take a screenshot of your payment confirmation</li>
                <li>Upload the receipt/screenshot above</li>
                <li>Enter the exact amount you transferred</li>
                <li>Click "Confirm Payment" after completing all steps</li>
                <li>Wait for admin verification (usually within 24 hours)</li>
                <li className='font-bold text-[1.2em]'>
                  NB: If you don't have a USDT wallet, contact customer support for alternative payment.
                </li>
              </ol>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmPaymentClick}
              disabled={loading || !amount || parseFloat(amount) < investment.minAmount || !receipt}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>

            {!receipt && (
              <p className="text-center text-sm text-red-500 mt-3">
                Please upload your payment receipt before confirming
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <Foot />
    </div>
  );
};

export default Deposit;



