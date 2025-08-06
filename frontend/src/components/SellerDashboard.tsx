import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';
import { createStripeConnectAccount } from '@/utils/stripe/createStripeConnectAccount';
import { hasActiveStripeConnectAccount } from '@/utils/stripe/hasStripeConnectAccount';
import { fetchSellerAnalytics, SellerAnalyticsData } from '@/utils/seller/sellerAnalytics';
import MetricCard from '@/components/Charts/MetricCard';
import SalesChart from '@/components/Charts/SalesChart';
import DonutChart from '@/components/Charts/DonutChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MdAttachMoney, MdShoppingCart, MdPeople, MdInventory } from 'react-icons/md';

const SellerDashboard = () => {
  const { userInfo, storeInfo } = useSelector((state: stateProps) => state.next);
  const username = userInfo?.firstName;
  const [analyticsData, setAnalyticsData] = useState<SellerAnalyticsData | null>(null);
  const [hasStripeActiveAccount, setHasStripeActiveAccount] = useState(false);

  const checkHasActiveStripeAccount = async () => {
    const response = await hasActiveStripeConnectAccount(userInfo?._id);
    setHasStripeActiveAccount(response?.hasStripeAccount && response?.isActive);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pass the store ID (seller ID) to get real payment metrics
        const sellerStoreId = storeInfo?._id || userInfo?.storeId?._id;
        const data = await fetchSellerAnalytics('30d', sellerStoreId);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };
    fetchData();
    checkHasActiveStripeAccount();
  }, [userInfo?._id, storeInfo?._id]);

  if (!analyticsData) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center p-4 sm:p-6'>
        <h2 className='text-2xl font-semibold text-left text-vesoko_dark_slate'>
          {`Welcome back, ${username}!`}
        </h2>
        {!hasStripeActiveAccount && (
          <div className='bg-vesoko_red_200 p-2 sm:p-4 rounded-xl shadow-lg text-center sm:mb-4'>
            <p className='text-lg'>
              You haven’t set up your Stripe account yet.{' '}
              <span
                className='font-semibold text-vesoko_green_600 underline cursor-pointer'
                onClick={async () => {
                  try {
                    const response = await createStripeConnectAccount(
                      userInfo.email
                    );
                    if (response && response.url) {
                      window.open(response.url, '_blank');
                    } else {
                      console.error(
                        'Invalid response from createStripeAccount:',
                        response
                      );
                      alert(
                        'Error setting up Stripe account. Please try again later.'
                      );
                    }
                  } catch (error) {
                    console.error('Error creating Stripe account:', error);
                    alert(
                      'Error setting up Stripe account. Please try again later.'
                    );
                  }
                }}
              >
                Set up now
              </span>
            </p>
          </div>
        )}
      </div>
      
      {/* Key Metrics */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        <MetricCard
          title='Total Revenue'
          value={`$${analyticsData?.salesMetrics.totalRevenue.toFixed(2)}`}
          change={analyticsData?.salesMetrics.revenueGrowth}
          changeLabel='this month'
          icon={<MdAttachMoney size={20} />}
          color='green'
        />
        <MetricCard
          title='Total Orders'
          value={analyticsData?.salesMetrics.totalOrders}
          change={analyticsData?.salesMetrics.ordersGrowth}
          changeLabel='this month'
          icon={<MdShoppingCart size={20} />}
          color='blue'
        />
        <MetricCard
          title='Total Customers'
          value={analyticsData?.customerMetrics.totalCustomers}
          change={analyticsData?.customerMetrics.customerGrowth}
          changeLabel='this month'
          icon={<MdPeople size={20} />}
          color='purple'
        />
        <MetricCard
          title='Low Stock Items'
          value={analyticsData?.lowStockProducts.length}
          icon={<MdInventory size={20} />}
          color='yellow'
        />
      </div>

      {/* Sales Trends */}
      <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
        <SalesChart data={analyticsData?.recentSales} />
      </div>

      {/* Order Status */}
      <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
        <DonutChart data={analyticsData?.orderStatusBreakdown} />
      </div>

      {/* Top Products & Low Stock */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Top Products */}
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <h3 className='text-xl font-semibold mb-4'>Top Products</h3>
          <div className='space-y-3'>
            {analyticsData?.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50'>
                <div className='flex items-center gap-3'>
                  <div className='bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
                    {index + 1}
                  </div>
                  <div>
                    <p className='font-medium text-gray-900'>{product.name}</p>
                    <p className='text-sm text-gray-500'>{product.quantity} sold</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-semibold text-green-600'>${product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {analyticsData?.topProducts.length === 0 && (
              <p className='text-gray-500 text-center py-4'>No sales data available</p>
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <h3 className='text-xl font-semibold mb-4'>Low Stock Alerts</h3>
          <div className='space-y-3'>
            {analyticsData?.lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className='flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50'>
                <div>
                  <p className='font-medium text-gray-900'>{product.name}</p>
                  <p className='text-sm text-gray-500'>Current: {product.currentStock} | Min: {product.minStock}</p>
                </div>
                <div className='text-right'>
                  <span className='px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium'>
                    Low Stock
                  </span>
                </div>
              </div>
            ))}
            {analyticsData?.lowStockProducts.length === 0 && (
              <p className='text-gray-500 text-center py-4'>All products are well stocked!</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Insights */}
      <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
        <h3 className='text-xl font-semibold mb-4'>Payment Insights</h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <MetricCard
            title='Pending Balance'
            value={`$${analyticsData?.paymentMetrics.pendingBalance.toFixed(2)}`}
            color='yellow'
            size='sm'
          />
          <MetricCard
            title='Available Balance'
            value={`$${analyticsData?.paymentMetrics.availableBalance.toFixed(2)}`}
            color='green'
            size='sm'
          />
        </div>
        <div className='mt-4 flex justify-end'>
          <Link
            href='/retailer/payments'
            className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200'
          >
            Manage Payments
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
        <h3 className='text-xl font-semibold mb-4'>Quick Actions</h3>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          <Link
            href='/retailer/inventory/new-product'
            className='flex flex-col items-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors'
          >
            <MdInventory className='text-blue-600 mb-2' size={24} />
            <span className='text-sm font-medium'>Add Product</span>
          </Link>
          <Link
            href='/retailer/orders/customer-orders'
            className='flex flex-col items-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors'
          >
            <MdShoppingCart className='text-green-600 mb-2' size={24} />
            <span className='text-sm font-medium'>View Orders</span>
          </Link>
          <Link
            href='/retailer/customers'
            className='flex flex-col items-center p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors'
          >
            <MdPeople className='text-purple-600 mb-2' size={24} />
            <span className='text-sm font-medium'>Customers</span>
          </Link>
          <Link
            href='/retailer/support'
            className='flex flex-col items-center p-4 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors'
          >
            <MdAttachMoney className='text-yellow-600 mb-2' size={24} />
            <span className='text-sm font-medium'>Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
