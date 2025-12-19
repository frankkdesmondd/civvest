import React, { useState, useEffect } from 'react';
import { FiUpload, FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiCopy } from 'react-icons/fi';
import axios from 'axios';

interface Transfer {
  id: string;
  amount: number;
  receiptUrl: string;
  accountNumber: string;
  bankName: string;
  status: string;
  createdAt: string;
}

const Transfer: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    accountNumber: '',
    bankName: ''
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const adminAccountDetails = {
    accountNumber: '1234567890',
    bankName: 'First National Bank',
    accountName: 'Civvest Energy Partners LLC',
    routingNumber: '987654321'
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await axios.get('https://civvest-backend.onrender.com/api/transfers/my-transfers', {
        withCredentials: true
      });
      setTransfers(response.data);
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt) {
      alert('Please upload a receipt');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('amount', formData.amount);
      data.append('accountNumber', formData.accountNumber);
      data.append('bankName', formData.bankName);
      data.append('receipt', receipt);

      await axios.post('https://civvest-backend.onrender.com/api/transfers', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      alert('Transfer submitted successfully! Awaiting admin approval.');
      setFormData({ amount: '', accountNumber: '', bankName: '' });
      setReceipt(null);
      setShowForm(false);
      fetchTransfers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit transfer');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <FiCheckCircle className="text-green-600" />;
      case 'PENDING':
        return <FiClock className="text-yellow-600" />;
      case 'REJECTED':
        return <FiXCircle className="text-red-600" />;
      default:
        return <FiClock className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-12 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Deposit Funds</h1>
          <p className="text-gray-600 mt-1 sm:mt-2">Transfer funds to your Civvest account</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold w-full sm:w-auto"
        >
          {showForm ? 'Cancel' : 'New Deposit'}
        </button>
      </div>

      {/* Account Details */}
      <div className="bg-linear-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Company Account Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Account Name */}
          <div>
            <p className="text-blue-100 text-sm mb-1">Account Name</p>
            <div className="flex justify-between bg-blue-600/50 px-4 py-3 rounded-lg">
              <p className="font-semibold text-lg">{adminAccountDetails.accountName}</p>
            </div>
          </div>

          {/* Bank Name */}
          <div>
            <p className="text-blue-100 text-sm mb-1">Bank Name</p>
            <div className="flex justify-between bg-blue-600/50 px-4 py-3 rounded-lg">
              <p className="font-semibold text-lg">{adminAccountDetails.bankName}</p>
            </div>
          </div>

          {/* Account Number */}
          <div>
            <p className="text-blue-100 text-sm mb-1">Account Number</p>
            <div className="flex justify-between bg-blue-600/50 px-4 py-3 rounded-lg">
              <p className="font-semibold text-lg">{adminAccountDetails.accountNumber}</p>
              <button onClick={() => copyToClipboard(adminAccountDetails.accountNumber)} className="ml-2 p-2 hover:bg-blue-500 rounded">
                <FiCopy />
              </button>
            </div>
          </div>

          {/* Routing Number */}
          <div>
            <p className="text-blue-100 text-sm mb-1">Routing Number</p>
            <div className="flex justify-between bg-blue-600/50 px-4 py-3 rounded-lg">
              <p className="font-semibold text-lg">{adminAccountDetails.routingNumber}</p>
              <button onClick={() => copyToClipboard(adminAccountDetails.routingNumber)} className="ml-2 p-2 hover:bg-blue-500 rounded">
                <FiCopy />
              </button>
            </div>
          </div>

        </div>

        <div className="mt-6 p-4 bg-blue-600/30 rounded-lg">
          <p className="text-sm">
            <strong>Instructions:</strong> Transfer funds to the account above, then submit your transfer details with a receipt below.
          </p>
        </div>
      </div>

      {/* Deposit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Submit Transfer Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Amount */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Amount ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="1"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Your Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500"
                placeholder="Bank name"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Your Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500"
                placeholder="Account number"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Upload Receipt</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="receipt-upload" />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <FiUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                  {receipt ? (
                    <p className="text-green-600 font-semibold">{receipt.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-600 font-semibold">Click to upload receipt</p>
                      <p className="text-gray-400 text-sm">PNG, JPG, or PDF</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>

          </form>
        </div>
      )}

      {/* Transfer History */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Transfer History</h2>

        {transfers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiDollarSign className="mx-auto text-5xl mb-4" />
            <p>No transfer history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Date</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Amount</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Bank</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Status</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Receipt</th>
                </tr>
              </thead>

              <tbody>
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-800">
                      {new Date(transfer.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 text-gray-800 font-semibold">
                      ${transfer.amount.toFixed(2)}
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      {transfer.bankName}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transfer.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <a
                        href={`http://localhost:5000${transfer.receiptUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        View Receipt
                      </a>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Transfer;
