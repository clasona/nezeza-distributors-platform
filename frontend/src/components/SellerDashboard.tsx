import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';
import { createStripeConnectAccount } from '@/utils/stripe/createStripeConnectAccount';
import { hasActiveStripeConnectAccount } from '@/utils/stripe/hasStripeConnectAccount';
import { fetchSellerAnalytics, SellerAnalyticsData } from '@/utils/seller/sellerAnalytics';
import { getAllProducts } from '@/utils/product/getAllProducts';
import MetricCard from '@/components/Charts/MetricCard';
import SalesChart from '@/components/Charts/SalesChart';
import DonutChart from '@/components/Charts/DonutChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MdAttachMoney, MdShoppingCart, MdPeople, MdInventory, MdTrendingUp, MdAccountBalanceWallet } from 'react-icons/md';
import { Package, Star, TrendingUp, AlertCircle, Zap } from 'lucide-react';

const SellerDashboard = () => {
  const { userInfo, storeInfo } = useSelector((state: stateProps) => state.next);
  const username = userInfo?.firstName;
  const [analyticsData, setAnalyticsData] = useState<SellerAnalyticsData | null>(null);
  const [hasStripeActiveAccount, setHasStripeActiveAccount] = useState(false);
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  const checkHasActiveStripeAccount = async () => {
    const response = await hasActiveStripeConnectAccount(userInfo?._id);
    setHasStripeActiveAccount(response?.hasStripeAccount && response?.isActive);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch analytics and total products in parallel
        const sellerStoreId = storeInfo?._id || userInfo?.storeId?._id;
        const [analyticsResponse, productsResponse] = await Promise.all([
          fetchSellerAnalytics('30d', sellerStoreId),
          getAllProducts()
        ]);
        
        setAnalyticsData(analyticsResponse);
        
        // Set total products count from the products response
        // getAllProducts returns the products array directly
        if (Array.isArray(productsResponse)) {
          setTotalProductsCount(productsResponse.length);
        } else {
          setTotalProductsCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setTotalProductsCount(0);
      }
    };
    fetchData();
    checkHasActiveStripeAccount();
  }, [userInfo?._id, storeInfo?._id]);

  if (!analyticsData) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-vesoko_powder_blue via-blue-50 to-white'>
        <div className='text-center space-y-4 animate-pulse'>
          <div className='w-16 h-16 bg-vesoko_dark_blue rounded-full mx-auto animate-spin flex items-center justify-center'>
            <TrendingUp className='w-8 h-8 text-white' />
          </div>
          <p className='text-lg font-medium text-vesoko_dark_blue'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-vesoko_powder_blue via-blue-50 to-white'>
      <div className='space-y-8 pb-8'>
        {/* Welcome Header */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-white/20'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className='animate-fade-in'>
              <h1 className='text-3xl sm:text-4xl font-bold text-vesoko_dark_blue mb-2'>
                Welcome back, {username}! 👋
              </h1>
              <p className='text-lg text-gray-600'>
                Here's what's happening with your store today
              </p>
            </div>
            
            {/* Store Quick Stats */}
            <div className='flex items-center gap-4 text-sm'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-vesoko_green_600'>
                  {totalProductsCount}
                </div>
                <div className='text-gray-600'>Products</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-vesoko_dark_blue'>
                  {analyticsData?.customerMetrics?.totalCustomers || 0}
                </div>
                <div className='text-gray-600'>Customers</div>
              </div>
            </div>
          </div>
          
          {!hasStripeActiveAccount && (
            <div className='mt-6 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-r-lg animate-slide-up'>
              <div className='flex items-center'>
                <AlertCircle className='w-5 h-5 text-orange-400 mr-3' />
                <div className='flex-1'>
                  <p className='text-orange-800 font-medium'>
                    Complete your payment setup to start receiving payments
                  </p>
                  <button
                    className='mt-2 inline-flex items-center gap-2 px-4 py-2 bg-vesoko_dark_blue text-white rounded-lg hover:bg-vesoko_dark_blue_2 transition-all duration-300 transform hover:scale-105'
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
                    <MdAccountBalanceWallet className='w-4 h-4' />
                    Set up payments
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Key Metrics */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {[
            {
              title: 'Total Revenue',
              value: `$${analyticsData?.salesMetrics.totalRevenue.toFixed(2)}`,
              change: analyticsData?.salesMetrics.revenueGrowth,
              changeLabel: 'this month',
              icon: <MdAttachMoney size={24} />,
              color: 'green',
              gradient: 'from-green-400 to-green-600'
            },
            {
              title: 'Total Orders',
              value: analyticsData?.salesMetrics.totalOrders,
              change: analyticsData?.salesMetrics.ordersGrowth,
              changeLabel: 'this month',
              icon: <Package size={24} />,
              color: 'blue',
              gradient: 'from-blue-400 to-blue-600'
            },
            {
              title: 'Total Customers',
              value: analyticsData?.customerMetrics.totalCustomers,
              change: analyticsData?.customerMetrics.customerGrowth,
              changeLabel: 'this month',
              icon: <MdPeople size={24} />,
              color: 'purple',
              gradient: 'from-purple-400 to-purple-600'
            },
            {
              title: 'Low Stock Items',
              value: analyticsData?.lowStockProducts.length,
              icon: <AlertCircle size={24} />,
              color: 'yellow',
              gradient: 'from-yellow-400 to-orange-500'
            }
          ].map((metric, index) => (
            <div 
              key={metric.title}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-white/20 transition-all duration-300 transform hover:-translate-y-2 animate-slide-up`}
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className='flex items-center justify-between mb-4'>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center text-white shadow-lg`}>
                  {metric.icon}
                </div>
                {metric.change && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <MdTrendingUp className={`w-4 h-4 ${metric.change < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(metric.change)}%
                  </div>
                )}
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-900 mb-1'>
                  {metric.value}
                </div>
                <div className='text-sm text-gray-600'>
                  {metric.title}
                </div>
                {metric.changeLabel && (
                  <div className='text-xs text-gray-500 mt-1'>
                    {metric.changeLabel}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Sales Trends */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 animate-slide-up' style={{animationDelay: '400ms'}}>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-vesoko_dark_blue to-blue-600 flex items-center justify-center'>
                <TrendingUp className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Sales Trends</h3>
            </div>
            <SalesChart data={analyticsData?.recentSales} />
          </div>

          {/* Order Status */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 animate-slide-up' style={{animationDelay: '500ms'}}>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center'>
                <Package className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Order Status</h3>
            </div>
            <DonutChart data={analyticsData?.orderStatusBreakdown} />
          </div>
        </div>
        {/* Top Products & Low Stock */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Top Products */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 animate-slide-up' style={{animationDelay: '600ms'}}>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center'>
                <Star className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Top Products</h3>
            </div>
            <div className='space-y-4'>
              {analyticsData?.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className='group flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-vesoko_dark_blue hover:shadow-md transition-all duration-300'>
                  <div className='flex items-center gap-4'>
                    <div className='relative'>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                        'bg-gradient-to-br from-blue-400 to-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <div className='absolute -top-1 -right-1 w-4 h-4 bg-vesoko_green_600 rounded-full flex items-center justify-center'>
                          <Zap className='w-2.5 h-2.5 text-white' />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900 group-hover:text-vesoko_dark_blue transition-colors'>{product.name}</p>
                      <p className='text-sm text-gray-600'>{product.quantity} units sold</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-vesoko_green_600 text-lg'>${product.revenue.toFixed(2)}</p>
                    <p className='text-xs text-gray-500'>revenue</p>
                  </div>
                </div>
              ))}
              {analyticsData?.topProducts.length === 0 && (
                <div className='text-center py-8'>
                  <Package className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                  <p className='text-gray-500'>No sales data available</p>
                  <p className='text-sm text-gray-400'>Start selling to see your top products</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Items */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 animate-slide-up' style={{animationDelay: '700ms'}}>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center'>
                <AlertCircle className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Low Stock Alerts</h3>
            </div>
            <div className='space-y-4'>
              {analyticsData?.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className='p-4 border-l-4 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-r-xl hover:shadow-md transition-all duration-300'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <p className='font-semibold text-gray-900'>{product.name}</p>
                      <p className='text-sm text-gray-600 mt-1'>
                        Current: <span className='font-medium text-red-600'>{product.currentStock}</span> | 
                        Minimum: <span className='font-medium'>{product.minStock}</span>
                      </p>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                      <span className='px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold border border-orange-200'>
                        LOW STOCK
                      </span>
                      <Link href='/retailer/inventory' className='text-xs text-vesoko_dark_blue hover:underline font-medium'>
                        Restock →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {analyticsData?.lowStockProducts.length === 0 && (
                <div className='text-center py-8'>
                  <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <MdInventory className='w-6 h-6 text-green-600' />
                  </div>
                  <p className='text-green-600 font-medium'>All products are well stocked!</p>
                  <p className='text-sm text-gray-400'>Keep up the great inventory management</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Payment Insights */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 animate-slide-up mb-8' style={{animationDelay: '800ms'}}>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-vesoko_green_600 to-green-700 flex items-center justify-center'>
                <MdAccountBalanceWallet className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Payment Overview</h3>
            </div>
            <Link
              href='/retailer/payments'
              className='inline-flex items-center gap-2 px-4 py-2 bg-vesoko_dark_blue text-white rounded-lg hover:bg-vesoko_dark_blue_2 transition-all duration-300 transform hover:scale-105 text-sm font-medium'
            >
              <MdAccountBalanceWallet className='w-4 h-4' />
              Manage Payments
            </Link>
          </div>
          
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {/* Pending Balance */}
            <div className='bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-600'>Pending Balance</span>
                <div className='w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center'>
                  <MdAttachMoney className='w-4 h-4 text-white' />
                </div>
              </div>
              <div className='text-2xl font-bold text-gray-900'>
                ${analyticsData?.paymentMetrics.pendingBalance.toFixed(2)}
              </div>
              <p className='text-xs text-gray-500 mt-1'>Processing payments</p>
            </div>
            
            {/* Available Balance */}
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-600'>Available Balance</span>
                <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center'>
                  <MdAttachMoney className='w-4 h-4 text-white' />
                </div>
              </div>
              <div className='text-2xl font-bold text-gray-900'>
                ${analyticsData?.paymentMetrics.availableBalance.toFixed(2)}
              </div>
              <p className='text-xs text-gray-500 mt-1'>Ready to withdraw</p>
            </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 animate-slide-up' style={{animationDelay: '900ms'}}>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-vesoko_dark_blue to-blue-600 flex items-center justify-center'>
              <Zap className='w-5 h-5 text-white' />
            </div>
            <h3 className='text-xl font-bold text-gray-900'>Quick Actions</h3>
          </div>
          
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            {[
              {
                href: '/retailer/inventory/new-product',
                icon: <Package className='w-6 h-6' />,
                label: 'Add Product',
                gradient: 'from-blue-500 to-blue-600',
                hoverGradient: 'hover:from-blue-600 hover:to-blue-700'
              },
              {
                href: '/retailer/orders/customer-orders',
                icon: <MdShoppingCart className='w-6 h-6' />,
                label: 'View Customer Orders',
                gradient: 'from-green-500 to-green-600',
                hoverGradient: 'hover:from-green-600 hover:to-green-700'
              },
              {
                href: '/retailer/customers',
                icon: <MdPeople className='w-6 h-6' />,
                label: 'Customers',
                gradient: 'from-purple-500 to-purple-600',
                hoverGradient: 'hover:from-purple-600 hover:to-purple-700'
              },
              {
                href: '/retailer/support',
                icon: <MdAttachMoney className='w-6 h-6' />,
                label: 'Support',
                gradient: 'from-orange-500 to-orange-600',
                hoverGradient: 'hover:from-orange-600 hover:to-orange-700'
              }
            ].map((action, index) => (
              <Link
                key={action.label}
                href={action.href}
                className={`group relative overflow-hidden bg-gradient-to-r ${action.gradient} ${action.hoverGradient} rounded-xl p-6 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
              >
                <div className='flex flex-col items-center space-y-3'>
                  <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300'>
                    {action.icon}
                  </div>
                  <span className='text-sm font-semibold text-center'>{action.label}</span>
                </div>
                
                {/* Background decoration */}
                <div className='absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300'></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
