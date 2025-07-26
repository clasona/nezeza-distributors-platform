import FormattedPrice from '@/components/FormattedPrice';
import Button from '@/components/FormInputs/Button';
import Loading from '@/components/Loaders/Loading';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { createPaymentIntent } from '@/utils/payment/createPaymentIntent';
import { createShipping } from '@/utils/shipping/createShipping';
import { useSelector } from 'react-redux';
import { AddressProps, stateProps } from '../../../type';
import Link from 'next/link';

const CheckoutReviewPage = () => {
  const { cartItemsData, userInfo, shippingAddress } = useSelector(
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

  useEffect(() => {
    async function loadShipping() {
      setIsLoading(true);
      setError(null);
      try {
        // Call backend to get shipping options for cart items
        // The backend implements a robust fallback system:
        // 1. First tries to get real shipping rates from Shippo API and Uber API
        // 2. If seller addresses are missing, provides default shipping options
        // 3. If external APIs (Shippo/Uber) fail, falls back to standard rates
        // 4. This ensures users always see shipping options and never get stuck on loading
        const data = await createShipping(cartItemsData, shippingAddress);
        console.log('Shipping data:', data);
        
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
        // Even if the shipping API completely fails, we show an error
        // but the fallback system in the backend should prevent this from happening
        setError(err.message || 'Failed to load shipping options');
      }
      setIsLoading(false);
    }
    loadShipping();
  }, []);

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

  const tax = useMemo(() => subtotal * 0.075, [subtotal]);
  const grandTotal = subtotal + shippingTotal + tax;

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
      // Create Payment Intent
      const response = await createPaymentIntent(
        cartItemsData,
        shippingAddress
      );
      if (response.status !== 200 || !response.data?.clientSecret) {
        setError('Could not create payment intent. Please try again.');
        setIsProceeding(false);
        return;
      }
      const clientSecret = response.data.clientSecret;
      router.push({
        pathname: '/checkout/payment',
        query: {
          total: grandTotal.toFixed(2),
          clientSecret,
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
        className='mt-3 sm:mt-0 bg-vesoko_green_600 text-white font-medium px-4 py-2 rounded hover:bg-vesoko_green_800 transition'
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
    return (
      <div className='flex items-center justify-center min-h-screen text-red-600'>
        {error}
      </div>
    );
  }

  return (
    <div className='bg-vesoko_powder_blue min-h-screen py-8 px-2 md:px-8'>
      <h2 className='text-2xl font-bold mb-4 text-vesoko_dark_blue text-center'>
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
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
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
                        ? 'border border-vesoko_green_600 bg-green-50'
                        : 'border border-gray-200'
                    }`}
                  >
                    <input
                      type='radio'
                      name={`delivery-${group.groupId}`}
                      checked={selectedRateId === option.rateId}
                      onChange={() => handleRadio(group.groupId, option.rateId)}
                      className='form-radio text-vesoko_green_600'
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
        {/* Order Summary */}
        <div className='bg-white rounded-lg shadow-lg p-6 border'>
          <h3 className='text-lg font-bold mb-4 text-vesoko_dark_blue'>
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
              <span>Tax (7.5%):</span>
              <span>
                <FormattedPrice amount={tax} />
              </span>
            </div>
          </div>
          <hr className='my-3' />
          <div className='flex justify-between text-lg font-bold text-vesoko_dark_blue'>
            <span>Total:</span>
            <span>
              <FormattedPrice amount={grandTotal} />
            </span>
          </div>
        </div>
        <div className='text-center mt-4'>
          <Button
            buttonTitle={isProceeding ? 'Processing...' : 'Proceed to Payment'}
            isLoading={isProceeding}
            disabled={!canSubmit || isProceeding}
            className='w-full py-3 text-center justify-center bg-vesoko_green_600 text-white rounded-md hover:bg-vesoko_green_800 transition-colors duration-300 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleProceedToPayment}
          />
          {!canSubmit && (
            <div className='text-red-500 mt-2 text-sm'>
              Please select a delivery option for each group.
            </div>
          )}
        </div>
        {/* add option to go back to cart */}
        <div className='mt-4 text-center'>
          <Link href='/cart'>
            <p className='text-vesoko_dark_blue hover:underline'>
              &larr; Back to Cart
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

CheckoutReviewPage.noLayout = true;
export default CheckoutReviewPage;
