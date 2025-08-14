import React, { useState } from 'react';
import { requestPayout, PayoutRequest } from '@/utils/payment/requestPayout';
import toast from 'react-hot-toast';

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  availableBalance: number;
  onPayoutRequested: () => void;
}

const RequestPayoutModal: React.FC<RequestPayoutModalProps> = ({ 
  isOpen, 
  onClose, 
  sellerId, 
  availableBalance, 
  onPayoutRequested 
}) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountNumber = parseFloat(amount);
    
    // Validation
    if (!amount || isNaN(amountNumber) || amountNumber <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNumber > availableBalance) {
      setError(`Amount cannot exceed available balance of $${availableBalance}`);
      return;
    }

    setLoading(true);
    const payoutData: PayoutRequest = {
      sellerId,
      amount: amountNumber,
    };

    const response = await requestPayout(payoutData);

    if (response && !response.msg.includes('Insufficient')) {
      toast.success(response.msg || 'Payout request submitted successfully');
      onPayoutRequested();
      onClose();
      setAmount('');
    } else {
      toast.error(response?.msg || 'An error occurred');
      setError(response?.msg || 'An error occurred');
    }

    setLoading(false);
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">
                  Request Payout
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Available Balance: <span className="font-semibold text-green-600">${availableBalance.toFixed(2)}</span>
                  </p>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Payout Amount
                      </label>
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount to withdraw"
                        step="0.01"
                        min="0.01"
                        max={availableBalance}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vesoko_primary focus:border-vesoko_primary"
                        disabled={loading}
                        required
                      />
                    </div>
                    {error && (
                      <div className="mb-4 text-sm text-red-600">
                        {error}
                      </div>
                    )}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-vesoko_primary border border-transparent rounded-md shadow-sm hover:bg-vesoko_primary_dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vesoko_primary disabled:opacity-50"
                        disabled={loading || !amount}
                      >
                        {loading ? 'Processing...' : 'Request Payout'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPayoutModal;

