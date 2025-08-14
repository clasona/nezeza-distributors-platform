import Heading from '@/components/Heading';
import MetricCard from '@/components/Charts/MetricCard';
import SalesChart from '@/components/Charts/SalesChart';
import DonutChart from '@/components/Charts/DonutChart';
import ModernTable from '@/components/Table/ModernTable';
import RequestPayoutModal from './RequestPayoutModal';
import { hasActiveStripeConnectAccount } from '@/utils/stripe/hasStripeConnectAccount';
import { getSellerRevenue, SellerBalance } from '@/utils/payment/getSellerRevenue';
import { getTransactionHistory, Transaction, TransactionHistory } from '@/utils/payment/getTransactionHistory';
import { fetchSellerAnalytics, SellerAnalyticsData } from '@/utils/seller/sellerAnalytics';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type';
import formatPrice from '@/utils/formatPrice';
import formatDate from '@/utils/formatDate';
import toast from 'react-hot-toast';

// Icons (you can replace these with your preferred icon library)
const DollarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const CreditCardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserPayments = () => {
  const [hasStripeActiveAccount, setHasStripeActiveAccount] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerBalance, setSellerBalance] = useState<SellerBalance | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory | null>(null);
  const [analyticsData, setAnalyticsData] = useState<SellerAnalyticsData | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  const checkHasActiveStripeAccount = async () => {
    try {
      const response = await hasActiveStripeConnectAccount(userInfo._id);
      if (response && response.hasStripeAccount && response.isActive) {
        setHasStripeActiveAccount(true);
        setStripeAccountId(response.stripeAccountId || null);
      } else {
        setHasStripeActiveAccount(false);
        setStripeAccountId(response?.stripeAccountId || null);
      }
    } catch (error) {
      console.error('Error checking Stripe account:', error);
      setHasStripeActiveAccount(false);
      setStripeAccountId(null);
    }
  };

  const fetchPaymentData = async () => {
    if (!storeInfo?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch seller balance
      const balanceData = await getSellerRevenue(storeInfo._id);
      setSellerBalance(balanceData);

      // Fetch transaction history
      const transactionData = await getTransactionHistory(storeInfo._id);
      setTransactionHistory(transactionData);

      // Fetch analytics data
      const analytics = await fetchSellerAnalytics('30d', storeInfo._id);
      setAnalyticsData(analytics);
      
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequested = () => {
    // Refresh data after payout request
    setRefreshKey(prev => prev + 1);
    fetchPaymentData();
  };

  useEffect(() => {
    if (userInfo?._id) {
      checkHasActiveStripeAccount();
    }
  }, [userInfo?._id]);

  useEffect(() => {
    fetchPaymentData();
  }, [storeInfo?._id, refreshKey]);

  // Prepare transaction table data
  const transactionColumns = [
    {
      id: 'type',
      title: 'Type',
      render: (transaction: Transaction) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            transaction.type === 'Sale' ? 'bg-green-500' :
            transaction.type === 'Payout' ? 'bg-blue-500' :
            transaction.type === 'Commission' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></div>
          <span className="font-medium">{transaction.type}</span>
        </div>
      )
    },
    {
      id: 'description',
      title: 'Description',
      render: (transaction: Transaction) => (
        <span className="text-gray-600">{transaction.description}</span>
      )
    },
    {
      id: 'amount',
      title: 'Amount',
      render: (transaction: Transaction) => (
        <span className={`font-semibold ${
          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.amount >= 0 ? '+' : ''}{formatPrice(transaction.amount)}
        </span>
      )
    },
    {
      id: 'status',
      title: 'Status',
      render: (transaction: Transaction) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          transaction.status === 'Completed' ? 'bg-vesoko_green_100 text-green-800' :
          transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {transaction.status}
        </span>
      )
    },
    {
      id: 'date',
      title: 'Date',
      render: (transaction: Transaction) => (
        <span className="text-gray-500">{formatDate(transaction.date)}</span>
      )
    }
  ];

  if (loading) {
    return (
      <div>
        <Heading title='Payments Overview' />
        <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vesoko_primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Modern Header */}
      <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-white/20 animate-fade-in'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-3xl sm:text-4xl font-bold text-vesoko_primary mb-2'>
              💰 Payments & Earnings
            </h1>
            <p className='text-lg text-gray-600'>
              Manage your earnings, payouts, and payment settings
            </p>
          </div>
          
          {hasStripeActiveAccount && (
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={!hasStripeActiveAccount || (sellerBalance?.availableBalance || 0) <= 0}
              className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-vesoko_primary to-vesoko_primary_dark hover:from-vesoko_primary_dark hover:to-vesoko_secondary text-white rounded-lg transition-all duration-300 transform hover:scale-105 text-sm font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <DollarIcon />
              Request Payout
            </button>
          )}
        </div>
      </div>
        {/* Modern Stripe Account Status */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 animate-slide-up' style={{animationDelay: '100ms'}}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className={`p-3 rounded-xl ${
                hasStripeActiveAccount ? 'bg-vesoko_green_100' : 'bg-orange-100'
              }`}>
                <CreditCardIcon />
              </div>
              <div>
                <h3 className='text-xl font-bold text-gray-900'>Payment Account</h3>
                <div className='flex items-center gap-2 mt-1'>
                  <div className={`w-2 h-2 rounded-full ${
                    hasStripeActiveAccount ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <p className={`text-sm font-medium ${
                    hasStripeActiveAccount ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {hasStripeActiveAccount 
                      ? 'Connected and ready for payments' 
                      : 'Setup required to receive payments'
                    }
                  </p>
                </div>
                {stripeAccountId && (
                  <p className='text-xs text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-1 rounded inline-block'>
                    ID: {stripeAccountId}
                  </p>
                )}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              hasStripeActiveAccount ? 'bg-vesoko_green_100 text-green-800 border border-green-200' : 'bg-orange-100 text-orange-800 border border-orange-200'
            }`}>
              {hasStripeActiveAccount ? '✅ Active' : '⚠️ Setup Required'}
            </div>
          </div>
          {!hasStripeActiveAccount && (
            <div className='mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200'>
              <div className='flex items-center gap-3'>
                <div className='flex-1'>
                  <p className='text-orange-800 font-medium mb-2'>
                    Complete your payment setup to start receiving earnings
                  </p>
                  <p className='text-sm text-orange-600'>
                    Connect your Stripe account to receive payouts directly to your bank account
                  </p>
                </div>
                <Link
                  href='/sellers/stripe/setup'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-vesoko_primary to-vesoko_primary_dark hover:from-vesoko_primary_2 hover:to-vesoko_secondary text-white rounded-lg transition-all duration-300 transform hover:scale-105 text-sm font-medium shadow-lg whitespace-nowrap'
                >
                  <CreditCardIcon />
                  Setup Now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Modern Balance Overview */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[
            {
              title: 'Total Earnings',
              value: formatPrice(sellerBalance?.totalSales || 0),
              icon: <DollarIcon />,
              gradient: 'from-vesoko_primary400 to-vesoko_primary_dark',
              bgGradient: 'from-vesoko_primary50 to-cyan-50',
              borderColor: 'border-blue-200',
              change: analyticsData?.salesMetrics.revenueGrowth
            },
            {
              title: 'Available Balance',
              value: formatPrice(sellerBalance?.availableBalance || 0),
              icon: <TrendingUpIcon />,
              gradient: 'from-green-400 to-green-600',
              bgGradient: 'from-green-50 to-emerald-50',
              borderColor: 'border-green-200',
              subtitle: 'Ready to withdraw'
            },
            {
              title: 'Pending Balance',
              value: formatPrice(sellerBalance?.pendingBalance || 0),
              icon: <ClockIcon />,
              gradient: 'from-yellow-400 to-orange-500',
              bgGradient: 'from-yellow-50 to-orange-50',
              borderColor: 'border-yellow-200',
              subtitle: 'Processing payments'
            },
            {
              title: 'Commission Paid',
              value: formatPrice(sellerBalance?.commissionDeducted || 0),
              icon: <CreditCardIcon />,
              gradient: 'from-purple-400 to-purple-600',
              bgGradient: 'from-purple-50 to-indigo-50',
              borderColor: 'border-purple-200',
              subtitle: 'Platform fees'
            }
          ].map((metric, index) => (
            <div
              key={metric.title}
              className={`bg-gradient-to-r ${metric.bgGradient} border ${metric.borderColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up`}
              style={{animationDelay: `${(index + 2) * 100}ms`}}
            >
              <div className='flex items-center justify-between mb-4'>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${metric.gradient} flex items-center justify-center text-white shadow-lg`}>
                  {metric.icon}
                </div>
                {metric.change && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUpIcon className={`w-4 h-4 ${metric.change < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(metric.change)}%
                  </div>
                )}
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-900 mb-1'>
                  {metric.value}
                </div>
                <div className='text-sm font-medium text-gray-600'>
                  {metric.title}
                </div>
                {metric.subtitle && (
                  <div className='text-xs text-gray-500 mt-1'>
                    {metric.subtitle}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Charts */}
        {/* {analyticsData && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <SalesChart 
              data={analyticsData.recentSales} 
              height={300}
            />
            <DonutChart 
              data={analyticsData.orderStatusBreakdown}
              size={200}
            />
          </div>
        )} */}

        {/* Quick Actions */}
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100'>
          <h4 className='text-lg font-semibold text-vesoko_primary mb-4'>
            Quick Actions
          </h4>
          <div className='flex flex-wrap gap-3'>
            <button 
              onClick={() => setShowPayoutModal(true)}
              disabled={!hasStripeActiveAccount || (sellerBalance?.availableBalance || 0) <= 0}
              className='inline-flex items-center px-4 py-2 bg-vesoko_primary text-white font-medium rounded-lg hover:bg-vesoko_primary_dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
            >
              Request Payout
            </button>
            <Link
              href={`/retailer/orders/customer-orders`}
              className='inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors'
            >
              View Customer Orders
            </Link>
            <Link
              href={`/retailer/analytics`}
              className='inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors'
            >
              View Analytics
            </Link>
          </div>
        </div>

        {/* Modern Transaction History Table */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 animate-slide-up' style={{animationDelay: '600ms'}}>
          <div className='p-6 border-b border-gray-100'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-vesoko_primary to-vesoko_primary_dark flex items-center justify-center'>
                <DollarIcon />
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Transaction History</h3>
            </div>
            <p className='text-gray-600'>
              Recent payments, payouts, and commission deductions
            </p>
          </div>
          <div className='p-4 sm:p-6'>
            {transactionHistory && transactionHistory.transactions.length > 0 ? (
              <ModernTable
                rows={transactionHistory.transactions.map((transaction) => ({
                  id: transaction._id || Math.random().toString(36).substr(2, 9),
                  data: transaction,
                  cells: transactionColumns.map(col => ({
                    content: col.render(transaction)
                  }))
                }))}
                columns={transactionColumns}
                loading={loading}
                onRowClick={(row) => {
                  // You can add a modal to show transaction details
                  console.log('Transaction clicked:', row.data);
                }}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <DollarIcon />
                </div>
                <p className="text-gray-600">No transactions yet</p>
                <p className="text-sm text-gray-500">Your payment history will appear here once you start selling</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Summary */}
        {transactionHistory?.summary && (
          <div className='bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200'>
            <h4 className='text-lg font-semibold text-gray-800 mb-4'>
              Summary
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>Total Sales</p>
                <p className='text-xl font-semibold text-green-600'>
                  {formatPrice(transactionHistory.summary.totalSales)}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>Total Payouts</p>
                <p className='text-xl font-semibold text-blue-600'>
                  {formatPrice(transactionHistory.summary.totalPayouts)}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>Commission Paid</p>
                <p className='text-xl font-semibold text-orange-600'>
                  {formatPrice(transactionHistory.summary.totalCommission)}
                </p>
              </div>
            </div>
          </div>
        )}
  


      {/* Payout Request Modal */}
      <RequestPayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        sellerId={storeInfo?._id || ''}
        availableBalance={sellerBalance?.availableBalance || 0}
        onPayoutRequested={handlePayoutRequested}
      />
    </div>
  );
};

UserPayments.noLayout = true;
export default UserPayments;
