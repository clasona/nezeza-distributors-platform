import ErrorMessageModal from '@/components/ErrorMessageModal';
import Button from '@/components/FormInputs/Button';
import OrderDetailsWithImages from '@/components/Order/OrderDetailsWithImages';
import PageHeader from '@/components/PageHeader';
import RootLayout from '@/components/RootLayout';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ArchiveRowModal from '@/components/Table/ArchiveRowModal';
import FormattedStatus from '@/components/Table/FormattedStatus';
import { getOrderStatus } from '@/lib/utils';
import { archiveOrder } from '@/utils/order/archiveOrder';
import { getMyArchivedOrders } from '@/utils/order/getMyArchivedOrders';
import { getMyUnarchivedOrders } from '@/utils/order/getMyUnarchivedOrders';
import { calculateOrderStats } from '@/utils/orderUtils';
import formatDate from '@/utils/formatDate';
import router from 'next/router';
import { useEffect, useState } from 'react';
import { OrderProps } from '../../../type';
import CancelFullOrderModal from '@/components/Order/CancelFullOrderModal';
import { cancelFullOrder } from '@/utils/order/cancelFullOrder';
import { 
  Eye, 
  Archive, 
  X, 
  RefreshCw, 
  Search, 
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  ShoppingBag,
  Clock
} from 'lucide-react';
import Image from 'next/image';

const Orders = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]); // All orders
  const [archivedOrders, setArchivedOrders] = useState<OrderProps[]>([]); // State for archived orders
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  const [sortCriterion, setSortCriterion] = useState<'newest' | 'oldest'>('newest');
  const [filter, setFilter] = useState('All Orders'); // Current filter
  const [orderStatsObj, setOrderStatsObj] = useState<any[]>([]); // Or a more specific type if you know it
  const [allOrderStatsObj, setAllOrderStatsObj] = useState<any[]>([]);

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState<OrderProps | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const [isFullCancelModalOpen, setIsFullCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderProps | null>(null); // To store the order being cancelled

  const handleOpenFullCancelModal = (order: OrderProps) => {
    setOrderToCancel(order); // Set the order to be cancelled
    setIsFullCancelModalOpen(true);
  };

  const handleCloseFullCancelModal = () => {
    setIsFullCancelModalOpen(false);
    setOrderToCancel(null); // Clear the order data
    setErrorMessage(''); // Clear errors on close
    setSuccessMessage(''); // Clear success on close
  };

  const handleFullOrderCancelSubmit = async (reason: string) => {
    if (!orderToCancel) return; // Should not happen if modal is opened correctly

    setIsLoading(true); // Indicate loading for the API call
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Make your API call to cancel the full order
      const response = await cancelFullOrder(orderToCancel._id, reason);

      setSuccessMessage(response.msg || 'Order cancelled successfully!');

      // Refresh order data after successful cancellation
      await fetchData();
      handleCloseFullCancelModal(); // Close modal on success

      // Optionally, you might want to redirect or update the UI more dynamically
      // For example, if you're using a state management library (like Redux, React Query),
      // you'd invalidate/refetch relevant data.
    } catch (err: any) {
      console.error('Error cancelling full order:', err);
      setErrorMessage(
        err || 'An unexpected error occurred during cancellation.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  //setting my orders data
  const fetchData = async () => {
    setIsLoading(true);

    try {
      const myOrdersData = await getMyUnarchivedOrders();
      setOrders(myOrdersData); // Set all orders
      setFilteredOrders(myOrdersData);
      const archivedData = await getMyArchivedOrders(); // Fetch archived orders
      setArchivedOrders(archivedData);
    } catch (error) {
      console.error('Error fetching my orders data:', error);
    } finally {
      setIsLoading(false); // Set loading to false *after* fetch completes (success or error)
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Apply sorting when orders or sortCriterion changes
  useEffect(() => {
    applySortingAndFiltering(filter, sortCriterion);
  }, [orders, archivedOrders, sortCriterion]);

  useEffect(() => {
    // Combine regular and archived orders for stats calculation - not sure if needed
    const allOrders = [...orders, ...archivedOrders];
    if (allOrders.length > 0) {
      const allStats = calculateOrderStats(allOrders);
      setAllOrderStatsObj(allStats); // New state for ALL stats
    }

    // Calculate stats for NON-archived orders ONLY - for other status boxes
    if (orders.length > 0) {
      const nonArchivedStats = calculateOrderStats(orders);
      setOrderStatsObj(nonArchivedStats); // Update the original state
    }
  }, [orders, archivedOrders]);

  const handleFilter = (status: string) => {
    setFilter(status);
    applySortingAndFiltering(status, sortCriterion);
  };

  const applySortingAndFiltering = (status: string, sortBy: 'newest' | 'oldest') => {
    let filtered = [];
    if (status === 'All Orders') {
      filtered = [...orders];
    } else if (status === 'Archived') {
      filtered = [...archivedOrders];
    } else {
      filtered = orders.filter((order) => order.fulfillmentStatus === status);
    }
    
    // Sort orders based on the selected criterion
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    setFilteredOrders(filtered);
  };

  const handleArchiveClick = (rowData: OrderProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsArchiveModalOpen(true); // Open the modal
  };
  const handleConfirmArchive = async (id: string) => {
    try {
      setErrorMessage('');
      
      // Remove from current filtered view
      setFilteredOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== id)
      );
      
      const orderData: Partial<OrderProps> = {
        fulfillmentStatus: 'Archived',
      };
      
      await archiveOrder(id, orderData);
      setSuccessMessage(`Order #${id} archived successfully.`);
      setIsArchiveModalOpen(false);
      
      // Refresh data to update stats and lists
      await fetchData();
      
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Error archiving order:', error);
      setErrorMessage('Failed to archive order. Please try again.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // if (orders.length === 0 && archivedOrders.length === 0) {
  //   return <div>Loading...</div>;
  // }

  // Get status icon for visual display
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <AlertCircle className='w-4 h-4 text-yellow-600' />;
      case 'placed': return <CheckCircle className='w-4 h-4 text-green-600' />;
      case 'processing': return <Package className='w-4 h-4 text-vesoko_primary' />;
      case 'shipped': return <Truck className='w-4 h-4 text-vesoko_primary' />;
      case 'delivered': return <CheckCircle className='w-4 h-4 text-green-600' />;
      case 'cancelled': return <X className='w-4 h-4 text-red-600' />;
      default: return <Package className='w-4 h-4 text-gray-600' />;
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = (status: string) => {
    return ['Pending', 'Placed', 'Processing'].includes(status);
  };

  // Check if order can be archived - customers can archive any order for organization
  const canArchiveOrder = (status: string) => {
    return status !== 'Archived'; // Can archive any order except already archived ones
  };

  return (
    <RootLayout>
      <div className='min-h-screen bg-gray-50'>
        {/* Header Section */}
        <div className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-3 sm:gap-4'>
              <div className='flex items-center min-w-0'>
                <ShoppingBag className='w-6 sm:w-8 h-6 sm:h-8 text-vesoko_primary mr-2 sm:mr-3 flex-shrink-0' />
                <div className='min-w-0'>
                  <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>My Orders</h1>
                  <p className='text-sm sm:text-base text-gray-600 mt-1 hidden sm:block'>Track and manage your purchases</p>
                </div>
              </div>
              <button
                onClick={fetchData}
                disabled={isLoading}
                className='inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-vesoko_primary hover:bg-vesoko_primary_2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vesoko_primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0'
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className='whitespace-nowrap'>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8'>
          {/* Stats Section */}
          <div className='mb-4 sm:mb-6'>
            <div className='grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-4'>
              {allOrderStatsObj.length === 0 ? (
                <div className='col-span-full text-center py-8'>
                  <Package className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No orders found</p>
                </div>
              ) : (
                allOrderStatsObj.map((stat) => (
                  <div
                    key={stat.status}
                    onClick={() => handleFilter(stat.status)}
                    className={`relative cursor-pointer rounded-md sm:rounded-xl p-2 sm:p-4 transition-all duration-200 min-h-[60px] sm:min-h-[100px] ${
                      filter === stat.status
                        ? 'bg-vesoko_primary text-white shadow-lg transform -translate-y-1'
                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <div className='flex flex-col h-full'>
                      <div className='flex-1 min-w-0'>
                        <p className={`text-[10px] sm:text-sm font-medium mb-0.5 sm:mb-1 truncate leading-tight ${
                          filter === stat.status ? 'text-white' : 'text-gray-600'
                        }`}>
                          {stat.status}
                        </p>
                        <p className={`text-sm sm:text-2xl font-bold leading-none ${
                          filter === stat.status ? 'text-white' : 'text-gray-900'
                        }`}>
                          {stat.status === 'All Orders' 
                            ? (orderStatsObj.find((s) => s.status === 'All Orders')?.count || 0)
                            : stat.count
                          }
                        </p>
                      </div>
                      <div className={`p-0.5 sm:p-2 rounded mt-1 sm:mt-2 flex-shrink-0 self-end sm:self-center ${
                        filter === stat.status 
                          ? 'bg-white bg-opacity-20' 
                          : 'bg-gray-100'
                      }`}>
                        <div className='w-2.5 h-2.5 sm:w-4 sm:h-4'>
                          {getStatusIcon(stat.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className='bg-white rounded-xl shadow-sm border'>
            <div className='p-3 sm:p-4 lg:p-6 border-b border-gray-200'>
              <div className='flex flex-col gap-3 sm:gap-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <h2 className='text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate'>
                    {filter === 'All Orders' ? `All Orders (${filteredOrders.length})` : `${filter} Orders (${filteredOrders.length})`}
                  </h2>
                  <div className='flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3'>
                    <div className='flex items-center space-x-2 flex-shrink-0'>
                      <Filter className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <label className='text-xs sm:text-sm text-gray-600 flex items-center whitespace-nowrap'>
                        Sort:
                        <select 
                          value={sortCriterion} 
                          onChange={(e) => {
                            const newSort = e.target.value as 'newest' | 'oldest';
                            setSortCriterion(newSort);
                            applySortingAndFiltering(filter, newSort);
                          }}
                          className='ml-1 sm:ml-2 p-1 border border-gray-300 rounded text-xs sm:text-sm min-w-0 flex-shrink-0'
                        >
                          <option value='newest'>Newest</option>
                          <option value='oldest'>Oldest</option>
                        </select>
                      </label>
                    </div>
                    <span className='text-xs sm:text-sm text-gray-600 text-right xs:text-left'>
                      {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className='text-center py-12'>
                <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>No orders found</h3>
                <p className='text-gray-500 mb-6'>
                  {filter === 'All Orders' 
                    ? "You haven't placed any orders yet." 
                    : `No orders with status '${filter}' found.`
                  }
                </p>
                <button
                  onClick={() => router.push('/')}
                  className='inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-vesoko_primary hover:bg-vesoko_primary_2 transition-colors duration-200'
                >
                  <ShoppingBag className='w-4 h-4 mr-2' />
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className='divide-y divide-gray-200'>
                {filteredOrders.map((order, index) => {
                  // Determine if this is the newest order when sorted by newest
                  const isNewestOrder = sortCriterion === 'newest' && index === 0 && filteredOrders.length > 1;
                  
                  return (
                    <div key={order._id} className={`p-3 sm:p-4 lg:p-6 hover:bg-gray-50 transition-colors duration-200 relative ${
                      isNewestOrder ? 'ring-2 ring-green-200 bg-green-50' : ''
                    }`}>
                      {isNewestOrder && (
                        <div className='absolute top-1 sm:top-2 right-1 sm:right-2'>
                          <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-vesoko_green_100 text-green-800'>
                            <span className='w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full mr-1 sm:mr-1.5'></span>
                            Newest
                          </span>
                        </div>
                      )}
                      <div className='space-y-3 sm:space-y-4'>
                        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3'>
                              <h3 className='text-base sm:text-lg font-semibold text-gray-900 truncate'>
                                Order #{order._id.slice(-8).toUpperCase()}
                              </h3>
                              <FormattedStatus status={order.fulfillmentStatus} />
                            </div>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600'>
                              <div className='flex items-center'>
                                <Calendar className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0' />
                                <span className='truncate'>{formatDate(order.createdAt)}</span>
                              </div>
                              <div className='flex items-center'>
                                <DollarSign className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0' />
                                <span>${order.totalAmount.toFixed(2)}</span>
                              </div>
                              <div className='flex items-center'>
                                <Package className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0' />
                                <span>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</span>
                              </div>
                              {order.estimatedDeliveryDate && (
                                <div className='flex items-center'>
                                  <Clock className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0' />
                                  <span className='text-vesoko_primary font-medium truncate'>
                                    Est. {formatDate(order.estimatedDeliveryDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className='flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto'>
                            {/* View Details */}
                            <button
                              onClick={() => router.push(`/customer/order/${order._id}`)}
                              className='inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vesoko_primary transition-colors duration-200'
                              title='View order details'
                            >
                              <Eye className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2' />
                              <span>Details</span>
                            </button>

                            {/* Cancel Order */}
                            {canCancelOrder(order.fulfillmentStatus) && (
                              <button
                                onClick={() => handleOpenFullCancelModal(order)}
                                className='inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-lg text-xs sm:text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200'
                                title='Cancel this order'
                              >
                                <X className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2' />
                                <span>Cancel</span>
                              </button>
                            )}

                            {/* Archive Order */}
                            {canArchiveOrder(order.fulfillmentStatus) && (
                              <button
                                onClick={() => handleArchiveClick(order)}
                                className='inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200'
                                title='Archive this order'
                              >
                                <Archive className='w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2' />
                                <span>Archive</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className='bg-gray-50 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4'>
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='text-sm font-medium text-gray-900'>Order Items</h4>
                            <span className='text-sm text-gray-500'>
                              {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                            {order.orderItems.slice(0, 3).map((item, index) => (
                              <div key={index} className='flex items-center space-x-3 bg-white rounded-lg p-3'>
                                <Image
                                  src={item.product.images[0]}
                                  width={48}
                                  height={48}
                                  alt={item.title}
                                  className='w-12 h-12 object-cover rounded-lg'
                                />
                                <div className='flex-1 min-w-0'>
                                  <p className='text-sm font-medium text-gray-900 truncate'>
                                    {item.title}
                                  </p>
                                  <p className='text-sm text-gray-500'>
                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.orderItems.length > 3 && (
                              <div className='flex items-center justify-center bg-white rounded-lg p-3 border-2 border-dashed border-gray-300'>
                                <span className='text-sm text-gray-500'>
                                  +{order.orderItems.length - 3} more
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className='mt-3 sm:mt-4 flex items-start space-x-2'>
                            <Truck className='w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0' />
                            <div className='text-xs sm:text-sm text-gray-600'>
                              <span className='font-medium'>Shipping to:</span>
                              <span className='ml-2'>
                                {[
                                  order.shippingAddress.street1,
                                  order.shippingAddress.city,
                                  [order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(' '),
                                  order.shippingAddress.country
                                ].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {isArchiveModalOpen && currentRowData && (
          <ArchiveRowModal
            isOpen={isArchiveModalOpen}
            rowData={currentRowData}
            onClose={() => setIsArchiveModalOpen(false)}
            onArchive={() => handleConfirmArchive(currentRowData._id)}
          />
        )}

        {isFullCancelModalOpen && orderToCancel && (
          <CancelFullOrderModal
            open={isFullCancelModalOpen}
            onClose={handleCloseFullCancelModal}
            onSubmit={handleFullOrderCancelSubmit}
            orderId={orderToCancel._id}
            currentFulfillmentStatus={orderToCancel.fulfillmentStatus}
          />
        )}

        {/* Messages */}
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
      </div>
      </div>
    </RootLayout>
  );
};

Orders.noLayout = true;
export default Orders;
