import React, { useState } from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiDollarSign, FiX, FiCalendar, FiCreditCard, FiInfo } from 'react-icons/fi';
import CivvestLogo from '../assets/civvest logo.jpg'

interface WithdrawalHistoryProps {
  withdrawals: any[];
  onRefresh: () => void;
}

interface WithdrawalModalProps {
  withdrawal: any;
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ withdrawal, isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-linear-to-b from-blue-900 to-blue-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          {/* Modal Header with Company Logo */}
          <div className="bg-blue-950 p-4 border-b border-blue-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-lg p-1">
                  <img src={CivvestLogo} alt="" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Withdrawal Details</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors p-1"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="overflow-y-auto p-5 space-y-4">
            {/* Status & Amount Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-800/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FiInfo className="text-blue-200" size={14} />
                  <span className="text-blue-200 text-xs">Status</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold block w-fit ${
                  withdrawal.status === 'APPROVED' ? 'bg-green-500/20 text-green-300' :
                  withdrawal.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                  withdrawal.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {withdrawal.status}
                </span>
              </div>
              
              <div className="bg-blue-800/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FiDollarSign className="text-blue-200" size={14} />
                  <span className="text-blue-200 text-xs">Amount</span>
                </div>
                <p className="text-xl font-bold text-white">${withdrawal.amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="bg-blue-800/30 rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <FiCreditCard className="text-blue-200" size={16} />
                <h3 className="text-white font-semibold text-sm">Transaction Details</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-blue-200 text-xs mb-1">Type</p>
                  <p className="text-white text-sm font-medium">
                    {withdrawal.type === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Crypto Wallet'}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FiCalendar className="text-blue-200" size={12} />
                    <p className="text-blue-200 text-xs">Date</p>
                  </div>
                  <p className="text-white text-sm font-medium">{formatDate(withdrawal.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-blue-200 text-xs mb-1">Investment</p>
                <p className="text-white text-sm font-medium">{withdrawal.investment.investment.title}</p>
              </div>
            </div>

            {/* Additional Information - Conditional */}
            {withdrawal.adminNotes && (
              <div className="bg-blue-800/30 rounded-xl p-3">
                <p className="text-blue-200 text-xs mb-2">Admin Notes</p>
                <p className="text-white text-sm italic">{withdrawal.adminNotes}</p>
              </div>
            )}

            {withdrawal.approvedBy && (
              <div className="bg-blue-800/30 rounded-xl p-3">
                <p className="text-blue-200 text-xs mb-2">Approved By</p>
                <p className="text-white text-sm font-medium">
                  {withdrawal.approvedBy.firstName} {withdrawal.approvedBy.lastName}
                </p>
              </div>
            )}

            {/* Transaction ID */}
            <div className="bg-blue-950/50 rounded-xl p-3">
              <p className="text-blue-300 text-xs text-center">
                Transaction ID: <span className="text-white font-mono text-xs">{withdrawal.id}</span>
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-blue-950 p-4 border-t border-blue-700">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors duration-200 text-sm"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ withdrawals, onRefresh }) => {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <FiCheckCircle className="text-green-500" />;
      case 'PENDING':
        return <FiClock className="text-yellow-500" />;
      case 'REJECTED':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PROCESSED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleViewDetails = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWithdrawal(null), 300);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Withdrawal History</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <FiDollarSign className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No withdrawal history yet</p>
            <p className="text-gray-500 mt-2">Your withdrawal requests will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Investment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-600">{formatDate(withdrawal.createdAt)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold">{withdrawal.investment.investment.title}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-green-600">${withdrawal.amount.toFixed(2)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        withdrawal.type === 'BANK_TRANSFER' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {withdrawal.type === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Crypto Wallet'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewDetails(withdrawal)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedWithdrawal && (
        <WithdrawalModal
          withdrawal={selectedWithdrawal}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default WithdrawalHistory;
