import OrderDetails from '@/components/Order/OrderDetails';
import { OrderItemDetails } from '@/components/Order/OrderItemDetails';
import RootLayout from '@/components/RootLayout';
import { getSingleOrder } from '@/utils/order/getSingleOrder';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { OrderProps } from '../../../../type';
import CancelFullOrderModal from '@/components/Order/CancelFullOrderModal';
import { cancelFullOrder } from '@/utils/order/cancelFullOrder';
import { archiveOrder } from '@/utils/order/archiveOrder';
import { getOrderStatus } from '@/lib/utils';
import ArchiveRowModal from '@/components/Table/ArchiveRowModal';
import ErrorMessageModal from '@/components/ErrorMessageModal';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import formatDate from '@/utils/formatDate';
import { getOrderStatusClasses, getButtonClasses } from '@/utils/vesokoColors';
import {
  Calendar,
  DollarSign,
  Package,
  Truck,
  CreditCard,
  MapPin,
  ShoppingBag,
  ArrowLeft,
  FileText,
  Archive,
  Download,
  X
} from 'lucide-react';

const SingleOrderDetails = () => {
  const router = useRouter();
  const { id } = router.query; // Get order ID from URL

  const [order, setOrder] = useState<OrderProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>(''); // For API errors
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isFullCancelModalOpen, setIsFullCancelModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getSingleOrder(id as string);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      setErrorMessage('Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleOpenFullCancelModal = () => setIsFullCancelModalOpen(true);
  const handleCloseFullCancelModal = () => setIsFullCancelModalOpen(false);

  const handleFullOrderCancelSubmit = async (reason: string) => {
    if (!order) return; // Should not happen if modal is opened correctly

    setIsLoading(true); // Indicate loading for the API call
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Make your API call to cancel the full order
      const response = await cancelFullOrder(order._id, reason);

      setSuccessMessage(response.msg || 'Order cancelled successfully!');

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

  // Archive handlers
  const handleArchiveClick = () => {
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async (id: string) => {
    try {
      setErrorMessage('');
      
      const orderData: Partial<OrderProps> = {
        fulfillmentStatus: 'Archived',
      };
      
      await archiveOrder(id, orderData);
      setSuccessMessage(`Order #${id} archived successfully.`);
      setIsArchiveModalOpen(false);
      
      // Refresh the order data
      await fetchData();
      
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Error archiving order:', error);
      setErrorMessage('Failed to archive order. Please try again.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // View Invoice handler
  const handleViewInvoice = () => {
    if (!order) return;
    
    // Generate a simple invoice HTML content
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order #${order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #f8f9fa; }
          .total { text-align: right; font-size: 18px; font-weight: bold; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VeSoko Invoice</h1>
          <h2>Order #${order._id}</h2>
          <p>Date: ${formatDate(order.createdAt)}</p>
        </div>
        
        <div class="order-info">
          <h3>Order Information</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Status:</strong> ${order.fulfillmentStatus}</p>
        </div>
        
        ${order.shippingAddress ? `
        <div class="order-info">
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.street1}</p>
          ${order.shippingAddress.street2 ? `<p>${order.shippingAddress.street2}</p>` : ''}
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
          <p>${order.shippingAddress.country}</p>
        </div>
        ` : ''}
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Tax Rate</th>
              <th>Tax Amount</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.taxRate ? (item.taxRate * 100).toFixed(1) + '%' : '0%'}</td>
                <td>$${item.taxAmount ? item.taxAmount.toFixed(2) : '0.00'}</td>
                <td>$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="order-summary" style="margin-top: 30px; border-top: 2px solid #ddd; padding-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 16px;">Subtotal (before tax & shipping):</span>
            <span style="font-size: 16px;">$${order.orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}</span>
          </div>
          ${order.totalShipping ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 16px;">Shipping:</span>
            <span style="font-size: 16px;">$${order.totalShipping.toFixed(2)}</span>
          </div>
          ` : ''}
          ${order.totalTax ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 16px;">Total Tax:</span>
            <span style="font-size: 16px;">$${order.totalTax.toFixed(2)}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 15px;">
            <span style="font-size: 18px; font-weight: bold;">Total Amount:</span>
            <span style="font-size: 18px; font-weight: bold;">$${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <script>
          // Auto-focus and enable printing
          window.focus();
          
          // Add print button
          const printBtn = document.createElement('button');
          printBtn.innerHTML = 'Print Invoice';
          printBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 10px 20px; background: #3182ce; color: white; border: none; border-radius: 5px; cursor: pointer; z-index: 1000;';
          printBtn.onclick = () => window.print();
          document.body.appendChild(printBtn);
          
          // Hide print button when printing
          window.addEventListener('beforeprint', () => printBtn.style.display = 'none');
          window.addEventListener('afterprint', () => printBtn.style.display = 'block');
        </script>
      </body>
      </html>
    `;
    
    // Create blob and open in new tab with proper filename
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const invoiceWindow = window.open(url, '_blank');
    
    // Clean up the blob URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  };

  // Check if order can be cancelled
  const canCancelOrder = (status: string) => {
    return ['Pending', 'Confirmed', 'Processing'].includes(status);
  };

  // Check if order can be archived - customers can archive any order for organization
  const canArchiveOrder = (status: string) => {
    return status !== 'Archived'; // Can archive any order except already archived ones
  };

  if (loading) return <p>Loading...</p>;
    if (!order) return <p>Order not found</p>;

  const statusStyles = {
    pending: 'text-yellow-500',
    confirmed: 'text-green-500',
    processing: 'text-blue-500',
    shipped: 'text-blue-500',
    delivered: 'text-green-500',
    cancelled: 'text-red-500',
  };

  const isOrderProps = (data: any): data is OrderProps =>
    'fulfillmentStatus' in data;

  return (
    <RootLayout>
      <div className='min-h-screen bg-gray-50'>
        {/* Header Section */}
        <div className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-6'>
              <div className='flex items-center'>
                <button
                  onClick={() => router.back()}
                  className='mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200'
                >
                  <ArrowLeft className='w-5 h-5' />
                </button>
                <ShoppingBag className='w-8 h-8 text-vesoko_dark_blue mr-3' />
                <div>
                  <h1 className='text-3xl font-bold text-gray-900'>Order #{order._id}</h1>
                  <p className='text-gray-600 mt-1'>Order details and tracking information</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusClasses(order.fulfillmentStatus)}`}>
                  {order.fulfillmentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {isOrderProps(order) && (
            <>
              {/* Action Buttons */}
              <div className='mb-6 flex flex-wrap gap-3'>
                {/* Cancel Order - only show for certain statuses */}
                {canCancelOrder(order.fulfillmentStatus) && (
                  <button
                    className='inline-flex items-center px-4 py-2 border border-vesoko_red_200 rounded-lg text-sm font-medium text-vesoko_red_700 bg-vesoko_red_200 hover:bg-vesoko_red_600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vesoko_red_600 transition-colors duration-200'
                    onClick={handleOpenFullCancelModal}
                    disabled={isLoading}
                  >
                    <X className='w-4 h-4 mr-2' />
                    Cancel Order
                  </button>
                )}
                
                {/* View Invoice - always available */}
                <button
                  className='inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-vesoko_dark_blue hover:bg-vesoko_dark_blue_2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vesoko_dark_blue transition-colors duration-200'
                  onClick={handleViewInvoice}
                >
                  <FileText className='w-4 h-4 mr-2' />
                  View Invoice
                </button>
                
                {/* Archive Order - only show for delivered orders */}
                {canArchiveOrder(order.fulfillmentStatus) && (
                  <button
                    className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200'
                    onClick={handleArchiveClick}
                  >
                    <Archive className='w-4 h-4 mr-2' />
                    Archive
                  </button>
                )}
              </div>
              {/* Error and Success Messages */}
              {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
              {successMessage && (
                <SuccessMessageModal successMessage={successMessage} />
              )}

              {/* Order Summary Card */}
              <div className='bg-white rounded-xl shadow-sm border mb-6'>
                <div className='p-6'>
                  <h2 className='text-xl font-semibold text-gray-900 mb-4'>Order Summary</h2>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-gray-100 rounded-lg'>
                        <Calendar className='w-5 h-5 text-gray-600' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Order Date</p>
                        <p className='font-medium text-gray-900'>{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-gray-100 rounded-lg'>
                        <DollarSign className='w-5 h-5 text-gray-600' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Total Amount</p>
                        <p className='font-medium text-gray-900'>${order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-gray-100 rounded-lg'>
                        <Package className='w-5 h-5 text-gray-600' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Items</p>
                        <p className='font-medium text-gray-900'>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-gray-100 rounded-lg'>
                        <CreditCard className='w-5 h-5 text-gray-600' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Payment Method</p>
                        <p className='font-medium text-gray-900'>{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className='bg-white rounded-xl shadow-sm border mb-6'>
                  <div className='p-6'>
                    <div className='flex items-center mb-4'>
                      <MapPin className='w-5 h-5 text-gray-600 mr-2' />
                      <h2 className='text-xl font-semibold text-gray-900'>Shipping Address</h2>
                    </div>
                    <div className='text-gray-700'>
                      <p>{order.shippingAddress.street1}</p>
                      {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className='bg-white rounded-xl shadow-sm border'>
                <div className='p-6'>
                  <h2 className='text-xl font-semibold text-gray-900 mb-4'>Order Items</h2>
                  <div className='space-y-4'>
                    {order.orderItems.map((item) => (
                      <div key={item._id} className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'>
                        <img
                          src={item.image}
                          alt={item.title}
                          className='w-16 h-16 object-cover rounded-lg'
                        />
                        <div className='flex-1'>
                          <h3 className='font-medium text-gray-900'>{item.title}</h3>
                          <p className='text-sm text-gray-500'>{item.description}</p>
                          <div className='flex items-center mt-2 space-x-4'>
                            <span className='text-sm text-gray-600'>Qty: {item.quantity}</span>
                            <span className='text-sm text-gray-600'>Price: ${item.price.toFixed(2)}</span>
                            <span className='font-medium text-gray-900'>Total: ${(item.quantity * item.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modals */}
        {isFullCancelModalOpen && order && (
          <CancelFullOrderModal
            open={isFullCancelModalOpen}
            onClose={handleCloseFullCancelModal}
            onSubmit={handleFullOrderCancelSubmit}
            orderId={order._id}
            currentFulfillmentStatus={order.fulfillmentStatus} // Pass current status
            // Pass reasonsList if you want custom reasons
          />
        )}
        
        {isArchiveModalOpen && order && (
          <ArchiveRowModal
            isOpen={isArchiveModalOpen}
            rowData={order}
            onClose={() => setIsArchiveModalOpen(false)}
            onArchive={() => handleConfirmArchive(order._id)}
          />
        )}
      </div>
    </RootLayout>
  );
};

SingleOrderDetails.noLayout = true;
export default SingleOrderDetails;
