import ErrorMessageModal from '@/components/ErrorMessageModal';
import Button from '@/components/FormInputs/Button';
import OrderDetailsWithImages from '@/components/Order/OrderDetailsWithImages';
import PageHeader from '@/components/PageHeader';
import RootLayout from '@/components/RootLayout';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ArchiveRowModal from '@/components/Table/ArchiveRowModal';
import { getOrderStatus } from '@/lib/utils';
import { archiveOrder } from '@/utils/order/archiveOrder';
import { getMyArchivedOrders } from '@/utils/order/getMyArchivedOrders';
import { getMyUnarchivedOrders } from '@/utils/order/getMyUnarchivedOrders';
import { calculateOrderStats } from '@/utils/orderUtils';
import router from 'next/router';
import { useEffect, useState } from 'react';
import { OrderProps } from '../../../type';
import CancelFullOrderModal from '@/components/Order/CancelFullOrderModal';
import { cancelFullOrder } from '@/utils/order/cancelFullOrder';

const Orders = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]); // All orders
  const [archivedOrders, setArchivedOrders] = useState<OrderProps[]>([]); // State for archived orders
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
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
    if (status === 'All Orders') {
      setFilteredOrders(orders);
      // setFilteredOrders([...orders, ...archivedOrders]); // Show all orders
    } else if (status === 'Archived') {
      setFilteredOrders(archivedOrders); // Show only archived orders
    } else {
      setFilteredOrders(
        orders.filter((order) => order.fulfillmentStatus === status)
      );
    }
  };

  const handleArchiveClick = (rowData: OrderProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsArchiveModalOpen(true); // Open the modal
  };
  const handleConfirmArchive = (id: string) => {
    getOrderStatus(id).then((status) => {
      if (status) {
        if (status === 'Delivered') {
          setErrorMessage('');

          setFilteredOrders((prevOrders) =>
            prevOrders.filter((order) => order._id !== id)
          );
          const orderData: Partial<OrderProps> = {
            fulfillmentStatus: 'Archived',
          };
          if (id) {
            archiveOrder(id, orderData).then(() => {
              setSuccessMessage(`Order # ${id} archived successfully.`);
              setIsArchiveModalOpen(false);
              setTimeout(() => setSuccessMessage(''), 4000);
            });
          }
        } else {
          setErrorMessage(
            "Order status must be 'Delivered' to perform this action."
          );
          setTimeout(() => setErrorMessage(''), 4000);
        }
      }
    });
  };

  // if (orders.length === 0 && archivedOrders.length === 0) {
  //   return <div>Loading...</div>;
  // }

  return (
    <RootLayout>
      <div>
        <PageHeader
          heading='My Orders'
          actions={
            <Button
              isLoading={isLoading}
              buttonTitle='Refresh'
              loadingButtonTitle='Refreshing...'
              className='text-vesoko_dark_blue hover:text-white hover:bg-vesoko_dark_blue'
              onClick={async () => {
                await fetchData();
              }}
            />
          }
        />
        {/* Order Status Counts */}
        {allOrderStatsObj.length === 0 && (
          <div className='flex flex-wrap justify-between gap-4 px-4 py-1 bg-gray-100 rounded-md'>
            <div className='cursor-pointer px-4 py-0.5 rounded-md bg-white text-gray-700 hover:bg-gray-200 transition duration-300'>
              <span>All Orders: 0</span>
            </div>
            <div className='cursor-pointer px-4 py-0.5 rounded-md bg-white text-gray-700 hover:bg-gray-200 transition duration-300'>
              <span>Archived: 0</span>
            </div>
          </div>
        )}
        <div className='flex flex-wrap justify-between gap-4 px-4 py-1 bg-gray-100 rounded-md'>
          {allOrderStatsObj.map((stat) => (
            <div
              key={stat.status}
              className={`cursor-pointer px-4 py-0.5 rounded-md ${
                filter === stat.status
                  ? 'bg-vesoko_dark_blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              } transition duration-300`}
              onClick={() => handleFilter(stat.status)}
            >
              {/* {status}: {count as number} */}
              {/* Conditionally render the count based on the status */}
              {stat.status === 'All Orders' ? (
                <span>
                  All Orders:{' '}
                  {orderStatsObj.find((s) => s.status === 'All Orders')
                    ?.count || 0}
                </span> // Use non-archived count
              ) : (
                <span>
                  {stat.status}: {stat.count as number}
                </span>
              )}
            </div>
          ))}
        </div>
        {/* Replacing Overview Section with SmallCards */}
        {/* <SmallCards orderStats={orderStats} /> */}
        <hr className='my-4 border-gray-300' />
        {/* Orders */}
        <div className='w-full grid grid-cols-1 xl:grid-cols-2 gap-6'>
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className='bg-white text-black p-4 border border-gray-300 rounded-lg shadow-lg group overflow-hidden'
            >
              {/* Total Order Summary */}
              <OrderDetailsWithImages order={order} />

              <div className='flex flex-col items-end gap-2'>
                {/* Action Buttons */}
                <div className='flex gap-2'>
                  {/* <button
                    className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-vesoko_dark_blue hover:text-white transition duration-300'
                    onClick={() => handleViewInvoice(order._id)} // Replace with your "buy again" logic
                  >
                    View Invoice
                  </button> */}
                  <button
                    className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-vesoko_gray_600 hover:text-white transition duration-300'
                    onClick={() => handleArchiveClick(order)}
                  >
                    Archive
                  </button>
                  <button
                    className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-red-400 hover:text-white transition duration-300'
                    onClick={() => handleOpenFullCancelModal(order)}
                  >
                    Cancel Order
                  </button>
                  <button
                    className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-red-400 hover:text-white transition duration-300'
                    onClick={() => router.push(`/customer/order/${order._id}`)}
                  >
                    Cancel Items
                  </button>
                  <button
                    className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-yellow-400 hover:text-white transition duration-300'
                    onClick={() => router.push(`/customer/order/${order._id}`)}
                  >
                    More Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Archive Row Modal */}
        {isArchiveModalOpen && currentRowData && (
          <ArchiveRowModal
            isOpen={isArchiveModalOpen}
            rowData={currentRowData}
            onClose={() => setIsArchiveModalOpen(false)}
            onArchive={() => handleConfirmArchive(currentRowData._id)}
          />
        )}
        {/* Render cancel full order modal */}
        {isFullCancelModalOpen &&
          orderToCancel && ( // Only render if modal is open and orderToCancel is set
            <CancelFullOrderModal
              open={isFullCancelModalOpen}
              onClose={handleCloseFullCancelModal}
              onSubmit={handleFullOrderCancelSubmit}
              orderId={orderToCancel._id}
              currentFulfillmentStatus={orderToCancel.fulfillmentStatus}
              // You can pass a custom reasonsList if needed
            />
          )}
        {/* Success Message */}
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
        {/* Error Message */}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
      </div>
    </RootLayout>
  );
};

Orders.noLayout = true;
export default Orders;
