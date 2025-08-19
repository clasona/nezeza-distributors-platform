import React, { useEffect, useState } from 'react';
import { OrderProps, SubOrderProps, UserProps } from '../../../type';
import { calculateOrderItemsSubtotal } from '@/utils/order/calculateOrderItemsSubtotal';
import FormattedStatus from '../Table/FormattedStatus';
import { OrderItemDetails } from './OrderItemDetails';
import { CustomerOrderItemDetails } from './CustomerOrderItemDetails';
import { useForm } from 'react-hook-form';
import { getOrderFulfillmentStatuses } from '../../lib/utils';
import DropdownInput from '../FormInputs/DropdownInput';
import FormattedPrice from '../FormattedPrice';
import { calculateOrderFees, FeeBreakdown } from '@/utils/payment/feeCalculationUtils';
import OrderFeeDisplay from './OrderFeeDisplay';
import OrderRevenueBreakdown from './OrderRevenueBreakdown';
import { 
  Package, 
  MapPin, 
  User, 
  CreditCard, 
  Calendar, 
  Truck, 
  Phone, 
  Mail, 
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Info
} from 'lucide-react';
import Image from 'next/image';

interface CustomerMoreOrderDetailsModalProps {
  isOpen: boolean;
  rowData: SubOrderProps & { buyer: UserProps };
  onClose: () => void;
  onCancelOrder?: (orderId: string) => void;
  onArchiveOrder?: (orderId: string) => void;
  onViewInvoice?: (orderId: string) => void;
  onUpdateOrder?: (orderId: string, status: string) => void;
}

const CustomerMoreOrderDetailsModal = ({
  isOpen,
  rowData,
  onClose,
  onCancelOrder,
  onArchiveOrder,
  onViewInvoice,
  onUpdateOrder,
}: CustomerMoreOrderDetailsModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  const [orderData, setOrderData] = useState<SubOrderProps>(rowData);

  useEffect(() => {
    console.log('Received rowData:', rowData);
    if (isOpen) {
      setOrderData(rowData);
      // Initialize form with current order status (convert to lowercase to match options)
      setValue('fulfillmentStatus', rowData.fulfillmentStatus.toLowerCase());
    }
  }, [isOpen, rowData, setValue]);

  const isOrderProps = (data: any): data is SubOrderProps =>
    'fulfillmentStatus' in data;

  if (!isOpen) return null;

  const handleUpdateOrder = () => {
    const newStatus = getValues('fulfillmentStatus');
    if (onUpdateOrder) {
      onUpdateOrder(orderData._id, newStatus);
    }
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      className='fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75'
    >
      <div className='bg-vesoko_background p-8 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h3 id='modal-title' className='text-2xl font-bold text-vesoko_black'>
            Order Details - <span className='text-vesoko_blue_600'>#{orderData._id}</span>
          </h3>
          <div className='flex items-center space-x-4'>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-gray-300 text-vesoko_gray_600 rounded-md hover:bg-gray-400 transition'
            >
              Close
            </button>
          </div>
        </div>

        {/* Main content grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          
          {/* Left column - Order details and customer info */}
          <div className='lg:col-span-2 space-y-6'>
            
            {/* Order Status Card */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center space-x-3'>
                  <Package className='w-6 h-6 text-vesoko_blue_600' />
                  <h4 className='text-xl font-bold text-gray-900'>Order Status</h4>
                </div>
                <div className='flex items-center space-x-2'>
                  {orderData.fulfillmentStatus === 'Completed' ? (
                    <CheckCircle className='w-6 h-6 text-green-600' />
                  ) : orderData.fulfillmentStatus === 'Cancelled' ? (
                    <XCircle className='w-6 h-6 text-red-600' />
                  ) : (
                    <AlertCircle className='w-6 h-6 text-yellow-600' />
                  )}
                  <FormattedStatus status={orderData.fulfillmentStatus} />
                </div>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between py-3 border-b border-gray-100'>
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-400' />
                      <span className='text-sm font-medium text-gray-600'>Order Date</span>
                    </div>
                    <span className='text-sm text-gray-900 font-medium'>
                      {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className='flex items-center justify-between py-3 border-b border-gray-100'>
                    <div className='flex items-center space-x-2'>
                      <Clock className='w-4 h-4 text-gray-400' />
                      <span className='text-sm font-medium text-gray-600'>Last Updated</span>
                    </div>
                    <span className='text-sm text-gray-900 font-medium'>
                      {new Date(orderData.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className='flex items-center justify-between py-3'>
                    <div className='flex items-center space-x-2'>
                      <FileText className='w-4 h-4 text-gray-400' />
                      <span className='text-sm font-medium text-gray-600'>Order ID</span>
                    </div>
                    <span className='text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded'>
                      {orderData._id}
                    </span>
                  </div>
                </div>
                
                <div className='space-y-4'>
                  {/* <div className='p-4 bg-gray-50 rounded-lg'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Update Status</label>
                    <DropdownInput
                      label=''
                      id='fulfillmentStatus'
                      name='fulfillmentStatus'
                      options={getOrderFulfillmentStatuses()}
                      register={register}
                      errors={errors}
                      className='w-full'
                    />
                  </div> */}
                  
                  {/* Shipping Info */}
                  {(orderData.trackingInfo || orderData.shippingDetails) && (
                    <div className='p-4 bg-blue-50 rounded-lg'>
                      <div className='flex items-center space-x-2 mb-3'>
                        <Truck className='w-4 h-4 text-blue-600' />
                        <h5 className='font-medium text-blue-900'>Shipping Details</h5>
                      </div>
                      {(orderData.trackingInfo?.trackingNumber || orderData.shippingDetails?.trackingNumber) && (
                        <div className='space-y-2'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-blue-700'>Tracking Number:</span>
                            <span className='font-medium text-blue-900'>
                              {orderData.trackingInfo?.trackingNumber || orderData.shippingDetails?.trackingNumber}
                            </span>
                          </div>
                          <div className='flex justify-between text-sm'>
                            <span className='text-blue-700'>Carrier:</span>
                            <span className='font-medium text-blue-900'>
                              {orderData.trackingInfo?.carrier || orderData.shippingDetails?.carrier}
                            </span>
                          </div>
                          {(orderData.trackingInfo?.labelUrl || orderData.shippingDetails?.labelUrl) && (
                            <button
                              onClick={() => window.open(
                                orderData.trackingInfo?.labelUrl || orderData.shippingDetails?.labelUrl, 
                                '_blank'
                              )}
                              className='mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors'
                            >
                              View Shipping Label
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <div className='flex items-center space-x-3 mb-6'>
                <User className='w-6 h-6 text-vesoko_blue_600' />
                <h4 className='text-xl font-bold text-gray-900'>Customer Information</h4>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  {(rowData as any)?.buyer && (
                    <>
                      <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-10 h-10 bg-vesoko_blue_100 rounded-full flex items-center justify-center'>
                          <User className='w-5 h-5 text-vesoko_blue_600' />
                        </div>
                        <div>
                          <div className='font-medium text-gray-900'>
                            {(rowData as any).buyer.firstName} {(rowData as any).buyer.lastName}
                          </div>
                          <div className='text-sm text-gray-500'>Customer Name</div>
                        </div>
                      </div>
                      
                      <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-10 h-10 bg-vesoko_blue_100 rounded-full flex items-center justify-center'>
                          <Mail className='w-5 h-5 text-vesoko_blue_600' />
                        </div>
                        <div>
                          <div className='font-medium text-gray-900'>{(rowData as any).buyer.email}</div>
                          <div className='text-sm text-gray-500'>Email Address</div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className='flex items-center justify-between py-3 border-b border-gray-100'>
                    <span className='text-sm font-medium text-gray-600'>Customer ID</span>
                    <span className='text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded'>
                      {orderData.buyerId}
                    </span>
                  </div>
                </div>
                
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                    <div className='w-10 h-10 bg-vesoko_green_100 rounded-full flex items-center justify-center'>
                      <CreditCard className='w-5 h-5 text-green-600' />
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>{orderData.paymentMethod}</div>
                      <div className='text-sm text-gray-500'>Payment Method</div>
                    </div>
                  </div>
                  
                  <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      orderData.paymentStatus === 'Paid' 
                        ? 'bg-vesoko_green_100' 
                        : orderData.paymentStatus === 'Failed' 
                        ? 'bg-red-100' 
                        : 'bg-yellow-100'
                    }`}>
                      {orderData.paymentStatus === 'Paid' ? (
                        <CheckCircle className='w-5 h-5 text-green-600' />
                      ) : orderData.paymentStatus === 'Failed' ? (
                        <XCircle className='w-5 h-5 text-red-600' />
                      ) : (
                        <AlertCircle className='w-5 h-5 text-yellow-600' />
                      )}
                    </div>
                    <div>
                      <div className={`font-medium ${
                        orderData.paymentStatus === 'Paid' 
                          ? 'text-green-900' 
                          : orderData.paymentStatus === 'Failed' 
                          ? 'text-red-900' 
                          : 'text-yellow-900'
                      }`}>
                        {orderData.paymentStatus}
                      </div>
                      <div className='text-sm text-gray-500'>Payment Status</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              {orderData.shippingAddress && (
                <div className='mt-6 pt-6 border-t border-gray-200'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <MapPin className='w-5 h-5 text-vesoko_blue_600' />
                    <h5 className='font-semibold text-gray-900'>Shipping Address</h5>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <div className='text-sm text-gray-900 space-y-1'>
                      {orderData.shippingAddress.fullName && (
                        <div className='font-medium'>{orderData.shippingAddress.fullName}</div>
                      )}
                      <div>{orderData.shippingAddress.street1}</div>
                      {orderData.shippingAddress.street2 && (
                        <div>{orderData.shippingAddress.street2}</div>
                      )}
                      <div>
                        {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zip}
                      </div>
                      <div>{orderData.shippingAddress.country}</div>
                      {orderData.shippingAddress.phone && (
                        <div className='flex items-center space-x-2 mt-2'>
                          <Phone className='w-4 h-4 text-gray-400' />
                          <span>{orderData.shippingAddress.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Items */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h4 className='text-xl font-bold text-gray-900 mb-6'>Order Items</h4>
              <div className='space-y-4'>
                {orderData.products.map((product, index) => (
                  <div key={product._id} className='flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
                  {/* what placeholder should i have in my public? */}
                  <Image
                    src={product.images?.[0] ?? '/placeholder.jpg'}
                    alt={product.description || product.title || 'Product image'}
                    width={64}
                    height={64}
                      className='w-16 h-16 rounded-lg object-cover border border-gray-200'
                      unoptimized={product.images?.[0]?.startsWith('https://') || product.images?.[0]?.startsWith('/uploads/')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                      }}
                    />
                    <div className='flex-1 min-w-0'>
                      <h5 className='font-semibold text-gray-900 truncate'>{product.title}</h5>
                      <p className='text-sm text-gray-500 mt-1 line-clamp-2'>{product.description}</p>
                      <div className='flex items-center space-x-4 mt-2'>
                        <span className='text-sm font-medium text-gray-700'>Qty: {product.quantity}</span>
                        <span className='text-sm font-medium text-gray-700'>Price: ${product.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-lg font-bold text-gray-900'>
                        ${(product.price * product.quantity).toFixed(2)}
                      </div>
                      <div className='text-sm text-gray-500'>Total</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right sidebar - Order Summary */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-xl shadow-lg p-6 sticky top-6'>
              <h4 className='text-xl font-bold text-gray-900 mb-6'>Order Summary</h4>
              
              {/* Order Totals */}
              <div className='space-y-4 mb-6'>
                <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                  <span className='text-gray-600 font-medium'>Products</span>
                  <span className='font-bold text-gray-900'><FormattedPrice amount={orderData.totalAmount} /></span>
                </div>
                
                <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                  <span className='text-gray-600 font-medium'>Tax</span>
                  <span className='font-bold text-gray-900'><FormattedPrice amount={orderData.totalTax} /></span>
                </div>
                
                <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                  <span className='text-gray-600 font-medium'>Shipping</span>
                  <span className='font-bold text-gray-900'><FormattedPrice amount={orderData.totalShipping} /></span>
                </div>
                
                <OrderFeeDisplay
                  productSubtotal={orderData.totalAmount}
                  taxAmount={orderData.totalTax}
                  shippingCost={orderData.totalShipping}
                  grossUpFees={true}
                />
              </div>
              
              {/* Fee Transparency Section */}
              <div className='bg-vesoko_background rounded-lg p-4 mb-6'>
                <div className='flex items-center space-x-2 mb-3'>
                  <DollarSign className='w-5 h-5 text-vesoko_primary' />
                  <h5 className='font-semibold text-vesoko_primary'>Revenue Breakdown</h5>
                </div>
                <OrderRevenueBreakdown
                  productSubtotal={orderData.totalAmount}
                  taxAmount={orderData.totalTax}
                  shippingCost={orderData.totalShipping}
                  grossUpFees={true}
                />
              </div>
              
              {/* Store Information */}
              {orderData.sellerStoreId && (
                <div className='border-t pt-6'>
                  <h5 className='font-semibold text-gray-900 mb-4'>Store Information</h5>
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                      <div className='w-8 h-8 bg-vesoko_blue_100 rounded-full flex items-center justify-center'>
                        <Package className='w-4 h-4 text-vesoko_blue_600' />
                      </div>
                      <div>
                        <div className='font-medium text-gray-900'>
                          {typeof orderData.sellerStoreId === 'object' 
                            ? orderData.sellerStoreId.name 
                            : 'Store Name'
                          }
                        </div>
                        <div className='text-sm text-gray-500'>Store Name</div>
                      </div>
                    </div>
                    
                    {typeof orderData.sellerStoreId === 'object' && orderData.sellerStoreId.email && (
                      <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-8 h-8 bg-vesoko_blue_100 rounded-full flex items-center justify-center'>
                          <Mail className='w-4 h-4 text-vesoko_blue_600' />
                        </div>
                        <div>
                          <div className='font-medium text-gray-900'>{orderData.sellerStoreId.email}</div>
                          <div className='text-sm text-gray-500'>Store Email</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className='border-t pt-6 mt-6'>
                <h5 className='font-semibold text-gray-900 mb-4'>Quick Actions</h5>
                <div className='space-y-3'>
                  {onViewInvoice && (
                    <button
                      onClick={() => onViewInvoice(orderData._id)}
                      className='w-full px-4 py-3 bg-vesoko_blue_600 text-white rounded-lg hover:bg-vesoko_blue_700 transition-colors font-medium'
                    >
                      View Invoice
                    </button>
                  )}
                  
                  {onUpdateOrder && (
                    <button
                      onClick={handleSubmit(handleUpdateOrder)}
                      className='w-full px-4 py-3 bg-vesoko_primary text-white rounded-lg hover:bg-vesoko_primary_dark transition-colors font-medium'
                    >
                      Update Order Status
                    </button>
                  )}
                  
                  {onCancelOrder && orderData.fulfillmentStatus === 'Pending' && (
                    <button
                      onClick={() => onCancelOrder(orderData._id)}
                      className='w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium'
                    >
                      Cancel Order
                    </button>
                  )}
                  
                  {onArchiveOrder && (
                    <button
                      onClick={() => onArchiveOrder(orderData._id)}
                      className='w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium'
                    >
                      Archive Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className='lg:hidden mt-8 pt-6 border-t border-gray-200'>
          <div className='flex flex-wrap gap-3'>
            {onUpdateOrder && (
              <button
                onClick={handleSubmit(handleUpdateOrder)}
                className='px-4 py-2 bg-vesoko_primary text-white rounded-md hover:bg-vesoko_primary transition'
              >
                Update Order
              </button>
            )}
            {onCancelOrder && orderData.fulfillmentStatus === 'Pending' && (
              <button
                onClick={() => onCancelOrder(orderData._id)}
                className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition'
              >
                Cancel Order
              </button>
            )}
            {onArchiveOrder && (
              <button
                onClick={() => onArchiveOrder(orderData._id)}
                className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition'
              >
                Archive Order
              </button>
            )}
          </div>
      </div>
    </div>
  </div>
  );
}

export default CustomerMoreOrderDetailsModal;
