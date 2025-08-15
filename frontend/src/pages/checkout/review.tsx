import FormattedPrice from '@/components/FormattedPrice';
import Button from '@/components/FormInputs/Button';
import Loading from '@/components/Loaders/Loading';
import OrderFeeBreakdown from '@/components/Order/OrderFeeBreakdown';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { createPaymentIntent } from '@/utils/payment/createPaymentIntent';
import { createShipping } from '@/utils/shipping/createShipping';
import { calculateOrderFees, type FeeBreakdown } from '@/utils/payment/feeCalculationUtils';
import { useSelector } from 'react-redux';
import { AddressProps, stateProps } from '../../../type';
import Link from 'next/link';
import Image from 'next/image';

const CheckoutReviewPage = () => {
  const { cartItemsData, userInfo, shippingAddress, buyNowProduct } = useSelector(
    (state: stateProps) => state.next
  );
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shippingGroups, setShippingGroups] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    [groupId: string]: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [isProceeding, setIsProceeding] = useState(false);

  // Determine which items to use: buy now product or cart items
  const itemsToProcess = useMemo(() => {
    if (buyNowProduct && buyNowProduct.isBuyNow) {
      // Convert buy now product to the format expected by shipping/payment APIs
      const imagesArr = Array.isArray(buyNowProduct.product.images) && buyNowProduct.product.images.length
        ? buyNowProduct.product.images
        : buyNowProduct.product.image
        ? [buyNowProduct.product.image]
        : [];
      
      return [{
        _id: buyNowProduct.product._id,
        title: buyNowProduct.product.title,
        price: buyNowProduct.product.price,
        quantity: buyNowProduct.quantity,
        description: buyNowProduct.product.description,
        category: buyNowProduct.product.category,
        image: imagesArr[0] || '',
        product: buyNowProduct.product,
        sellerId: buyNowProduct.product.storeId?._id || buyNowProduct.product.storeId,
        sellerStoreId: buyNowProduct.product.storeId,
        sellerAddress: buyNowProduct.product.storeId?.address,
        sellerStoreAddress: buyNowProduct.product.storeId?.address,
        weight: buyNowProduct.product.weight || 1,
        length: buyNowProduct.product.length || 6,
        width: buyNowProduct.product.width || 6,
        height: buyNowProduct.product.height || 4,
        addedToInventory: false,
        status: 'Active',
        cancelledQuantity: 0,
      }];
    }
    return cartItemsData;
  }, [buyNowProduct, cartItemsData]);

  useEffect(() => {
    async function loadShipping() {
      setIsLoading(true);
      setError(null);
      try {
        // Call backend to get shipping options for items (either cart or buy now)
        // The backend implements a robust fallback system:
        // 1. First tries to get real shipping rates from Shippo API and Uber API
        // 2. If seller addresses are missing, provides default shipping options
        // 3. If external APIs (Shippo/Uber) fail, falls back to standard rates
        // 4. This ensures users always see shipping options and never get stuck on loading
        const data = await createShipping(itemsToProcess, shippingAddress);
        
        // Backend returns shippingGroups array - each group represents items from one seller
        // Each group contains deliveryOptions (shipping methods available for that seller)
        setShippingGroups(data.shippingGroups || []);
        
        // Pre-select first delivery option per group for better UX
        // This prevents users from having to manually select an option for each group
        const defaults: { [groupId: string]: string } = {};
        (data.shippingGroups || []).forEach((group: any) => {
          if (group.deliveryOptions.length > 0) {
            defaults[group.groupId] = group.deliveryOptions[0].rateId;
          }
        });
        setSelectedOptions(defaults);
      } catch (err: any) {
        console.error('Shipping calculation error:', err);
        
        // Handle address validation errors specifically
        if (err.response?.status === 400 && err.response?.data?.message?.includes('address')) {
          setError(
            `Address validation failed: ${err.response.data.message}. Please go back and verify your shipping address.`
          );
        } else if (err.response?.status === 400) {
          // Other 400 errors (invalid data, etc.)
          setError(err.response.data?.message || 'Invalid request. Please check your information.');
        } else {
          // Generic error fallback
          setError(err.message || 'Failed to load shipping options');
        }
      }
      setIsLoading(false);
    }
    loadShipping();
  }, [itemsToProcess, shippingAddress]);

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return shippingGroups.reduce(
      (sum, group) =>
        sum +
        group.items.reduce(
          (itemSum: number, item: any) => itemSum + item.price * item.quantity,
          0
        ),
      0
    );
  }, [shippingGroups]);

  // Calculate shipping cost
  const shippingTotal = useMemo(() => {
    let total = 0;
    for (const group of shippingGroups) {
      const selectedRateId = selectedOptions[group.groupId];
      const chosen = group.deliveryOptions.find(
        (opt: any) => opt.rateId === selectedRateId
      );
      if (chosen) total += chosen.price;
    }
    return total;
  }, [selectedOptions, shippingGroups]);

  // Calculate tax using individual product tax rates
  const tax = useMemo(() => {
    return shippingGroups.reduce(
      (totalTax, group) =>
        totalTax +
        group.items.reduce(
          (groupTax: number, item: any) => {
            const itemSubtotal = item.price * item.quantity;
            const rawTaxRate = item.product?.taxRate || 0;
            
            // Handle both decimal (0.05) and percentage (5) formats
            // If tax rate is <= 1, assume it's already a decimal (0.05 = 5%)
            // If tax rate is > 1, assume it's a percentage (5 = 5%)
            const itemTaxRate = rawTaxRate <= 1 ? rawTaxRate : rawTaxRate / 100;
            
            const itemTax = itemSubtotal * itemTaxRate;
            
            return groupTax + itemTax;
          },
          0
        ),
      0
    );
  }, [shippingGroups]);

  // Get unique tax rates for display purposes
  const uniqueTaxRates = useMemo(() => {
    const rates = new Set<number>();
    shippingGroups.forEach(group => {
      group.items.forEach((item: any) => {
        const taxRate = item.product?.taxRate || 0;
        if (taxRate > 0) {
          rates.add(taxRate);
        }
      });
    });
    return Array.from(rates).sort((a, b) => a - b);
  }, [shippingGroups]);

  // Create tax display label
  const taxLabel = useMemo(() => {
    if (uniqueTaxRates.length === 0) {
      return 'Tax:';
    } else if (uniqueTaxRates.length === 1) {
      const rate = uniqueTaxRates[0];
      // Convert to percentage for display: if rate <= 1, multiply by 100
      const displayRate = rate <= 1 ? rate * 100 : rate;
      return `Tax (${displayRate}%):`;
    } else {
      return 'Tax:';
    }
  }, [uniqueTaxRates]);

  // Calculate comprehensive fee breakdown
  const feeBreakdown = useMemo(() => {
    if (subtotal > 0) {
      return calculateOrderFees({
        productSubtotal: subtotal,
        taxAmount: tax,
        shippingCost: shippingTotal,
        grossUpFees: true // Use gross-up model
      });
    }
    return null;
  }, [subtotal, tax, shippingTotal]);

  const grandTotal = feeBreakdown?.customerTotal || (subtotal + shippingTotal + tax);

  const handleRadio = (groupId: string, rateId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: rateId,
    }));
  };

  const canSubmit =
    shippingGroups.length > 0 &&
    Object.keys(selectedOptions).length === shippingGroups.length;

  const handleProceedToPayment = async () => {
    if (!canSubmit) return;
    setIsProceeding(true);
    setError(null);
    try {
      // Build complete shipping options with delivery dates
      const completeShippingOptions: { [groupId: string]: any } = {};
      
      for (const group of shippingGroups) {
        const selectedRateId = selectedOptions[group.groupId];
        const selectedOption = group.deliveryOptions.find(
          (opt: any) => opt.rateId === selectedRateId
        );
        
        if (selectedOption) {
          completeShippingOptions[group.groupId] = {
            rateId: selectedOption.rateId,
            deliveryTime: selectedOption.deliveryTime,
            price: selectedOption.price,
            provider: selectedOption.provider,
            servicelevel: selectedOption.servicelevel,
            durationTerms: selectedOption.durationTerms,
            label: selectedOption.label
          };
        }
      }
      
      console.log('🚚 Sending complete shipping options:', completeShippingOptions);
      
      // Create Payment Intent using complete shipping option details
      const response = await createPaymentIntent(
        itemsToProcess,
        shippingAddress,
        completeShippingOptions,
        shippingTotal
      );
      console.log('Payment intent response:', response);
      if (response.status !== 200 || !response.data?.clientSecret) {
        setError('Could not create payment intent. Please try again.');
        setIsProceeding(false);
        return;
      }
      const clientSecret = response.data.clientSecret;
      const paymentIntentId = response.data.paymentIntentId;
      
      console.log('Payment intent created:', { clientSecret, paymentIntentId });
      
      router.push({
        pathname: '/checkout/payment',
        query: {
          total: grandTotal.toFixed(2),
          clientSecret,
          paymentIntentId,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Error proceeding to payment.');
    }
    setIsProceeding(false);
  };

  // --- Render Address Section ---
  const address = shippingAddress;
  const renderAddress = (addr: AddressProps) => (
    <div className='bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <div className='text-sm text-gray-500 mb-1'>Delivering to:</div>
        <div className='font-semibold'>{addr.fullName}</div>
        <div>
          {addr.street1}
          {addr.street2 ? `, ${addr.street2}` : ''}
        </div>
        <div>
          {addr.city}, {addr.state} {addr.zip}
        </div>
        <div>{addr.country}</div>
        {addr.phone && <div>{addr.phone}</div>}
      </div>
      <button
        type='button'
        onClick={() => router.push('/checkout/shipping-address')}
        className='mt-3 sm:mt-0 bg-vesoko_primary text-white font-medium px-4 py-2 rounded hover:bg-vesoko_secondary transition'
      >
        Change
      </button>
    </div>
  );

  if (
    isLoading ||
    shippingGroups.length === 0 ||
    shippingGroups[0].deliveryOptions.length === 0
  ) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loading message='delivery options...' />
      </div>
    );
  }
  if (error) {
    const isAddressError = error.includes('address') || error.includes('validation');
    return (
      <div className='bg-vesoko_primary min-h-screen py-8 px-2 md:px-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white rounded-lg shadow-lg p-6 border border-red-200'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <svg className='h-6 w-6 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
              </div>
              <div className='ml-3 w-full'>
                <h3 className='text-lg font-medium text-red-800 mb-2'>
                  {isAddressError ? 'Address Validation Error' : 'Shipping Calculation Error'}
                </h3>
                <div className='text-sm text-red-700 mb-4'>
                  {error}
                </div>
                <div className='flex flex-col sm:flex-row gap-3'>
                  {isAddressError && (
                    <button
                      onClick={() => router.push('/checkout/shipping-address')}
                      className='bg-vesoko_primary text-white px-4 py-2 rounded hover:bg-vesoko_primary_dark transition-colors text-sm font-medium'
                    >
                      Update Shipping Address
                    </button>
                  )}
                  <button
                    onClick={() => router.reload()}
                    className='bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm font-medium'
                  >
                    Retry
                  </button>
                  <Link href={buyNowProduct && buyNowProduct.isBuyNow ? '/' : '/cart'}>
                    <span className='text-vesoko_primary hover:underline text-sm'>
                      ← {buyNowProduct && buyNowProduct.isBuyNow ? 'Back to Products' : 'Back to Cart'}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-vesoko_primary min-h-screen py-8 px-2 md:px-8'>
      <h2 className='text-2xl font-bold mb-4 text-vesoko_primary text-center'>
        Review &amp; Choose Delivery Options
      </h2>
      <div className='max-w-3xl mx-auto flex flex-col gap-4'>
        {address && renderAddress(address)}
        {/* Grouped by Shipping Group, each with multiple delivery choices */}
        {shippingGroups.map((group, idx) => {
          const selectedRateId = selectedOptions[group.groupId];
          const selectedOption = group.deliveryOptions.find(
            (opt: any) => opt.rateId === selectedRateId
          );
          return (
            <div
              key={group.groupId}
              className='mb-6 bg-white rounded-lg p-6 shadow border'
            >
              <div className='mb-3 font-semibold text-lg'>
                Shipping Group {idx + 1}
              </div>
              <div className='space-y-2 mb-4'>
                {group.items.map((item: any) => (
                  <div
                    key={item.productId}
                    className='flex items-center gap-3 bg-gray-50 p-3 rounded shadow-sm'
                  >
                    {item.image && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={56}
                        height={56}
                        className='w-14 h-14 object-cover rounded'
                      />
                    )}
                    <div className='flex-grow'>
                      <div className='font-medium'>{item.product.title}</div>
                      <div className='text-gray-500 text-sm'>
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className='font-bold'>
                      <FormattedPrice amount={item.price * item.quantity} />
                    </div>
                  </div>
                ))}
              </div>
              <div className='space-y-2'>
                {group.deliveryOptions.map((option: any) => (
                  <label
                    key={option.rateId}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
                      selectedRateId === option.rateId
                        ? 'border border-vesoko_primary bg-green-50'
                        : 'border border-gray-200'
                    }`}
                  >
                    <input
                      type='radio'
                      name={`delivery-${group.groupId}`}
                      checked={selectedRateId === option.rateId}
                      onChange={() => handleRadio(group.groupId, option.rateId)}
                      className='form-radio text-vesoko_primary'
                    />
                    <span className='font-medium'>{option.label}</span>
                    <span className='text-gray-500 text-sm'>
                      ({option.durationTerms})
                    </span>
                    <span className='font-bold text-gray-800'>
                      <FormattedPrice amount={option.price} />
                    </span>
                    <span className='text-xs text-gray-400 ml-2'>
                      {option.provider} {option.servicelevel}
                    </span>
                  </label>
                ))}
              </div>
              {selectedOption && (
                <div className='mt-2 text-green-700 text-sm'>
                  You selected: {selectedOption.label}
                </div>
              )}
            </div>
          );
        })}
        {/* Order Summary with Fee Breakdown */}
        {feeBreakdown ? (
          <OrderFeeBreakdown 
            feeBreakdown={feeBreakdown}
            showDetailedBreakdown={true}
            showProcessingFeeExplanation={true}
            className="mb-4"
          />
        ) : (
          // Fallback to simple summary if fee breakdown not available
          <div className='bg-white rounded-lg shadow-lg p-6 border'>
            <h3 className='text-lg font-bold mb-4 text-vesoko_primary'>
              Order Summary
            </h3>
            <div className='space-y-2 text-gray-700'>
              <div className='flex justify-between'>
                <span>Items Subtotal:</span>
                <span>
                  <FormattedPrice amount={subtotal} />
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Shipping:</span>
                <span>
                  <FormattedPrice amount={shippingTotal} />
                </span>
              </div>
              <div className='flex justify-between'>
                <span>{taxLabel}</span>
                <span>
                  <FormattedPrice amount={tax} />
                </span>
              </div>
            </div>
            <hr className='my-3' />
            <div className='flex justify-between text-lg font-bold text-vesoko_primary'>
              <span>Total:</span>
              <span>
                <FormattedPrice amount={grandTotal} />
              </span>
            </div>
          </div>
        )}
        <div className='text-center mt-4'>
          <Button
            buttonTitle={isProceeding ? 'Processing...' : 'Proceed to Payment'}
            isLoading={isProceeding}
            disabled={!canSubmit || isProceeding}
            className='w-full py-3 text-center justify-center bg-vesoko_secondary text-white rounded-md hover:bg-vesoko_secondary_light transition-colors duration-300 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleProceedToPayment}
          />
          {!canSubmit && (
            <div className='text-red-500 mt-2 text-sm'>
              Please select a delivery option for each group.
            </div>
          )}
        </div>
        {/* add option to go back */}
        <div className='mt-4 text-center'>
          <Link href={buyNowProduct && buyNowProduct.isBuyNow ? '/' : '/cart'}>
            <p className='text-vesoko_primary hover:underline'>
              &larr; {buyNowProduct && buyNowProduct.isBuyNow ? 'Back to Products' : 'Back to Cart'}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

CheckoutReviewPage.noLayout = true;
export default CheckoutReviewPage;
