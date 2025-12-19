import React from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiDollarSign } from 'react-icons/fi';

interface WithdrawalHistoryProps {
  withdrawals: any[];
  onRefresh: () => void;
}

const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ withdrawals, onRefresh }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Withdrawal History</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
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
                      onClick={() => {
                        // Show withdrawal details modal
                        alert(`Withdrawal Details:\n\n` +
                          `Type: ${withdrawal.type}\n` +
                          `Amount: $${withdrawal.amount}\n` +
                          `Date: ${formatDate(withdrawal.createdAt)}\n` +
                          `Status: ${withdrawal.status}\n` +
                          (withdrawal.adminNotes ? `Admin Notes: ${withdrawal.adminNotes}\n` : '') +
                          (withdrawal.approvedBy ? `Approved By: ${withdrawal.approvedBy.firstName} ${withdrawal.approvedBy.lastName}\n` : '')
                        );
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
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
  );
};

export default WithdrawalHistory;