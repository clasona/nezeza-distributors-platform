import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import FormattedPrice from '@/components/FormattedPrice';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import Loading from '@/components/Loaders/Loading';

interface ProductItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId: string;
}

interface DeliveryOption {
  rateId: string;
  label: string; // e.g. "Friday, June 6"
  deliveryTime: string; // ISO string
  price: number;
  provider: string;
  servicelevel: string;
  durationTerms: string; // e.g. "Delivery in 2 to 5 days."
}

interface ShippingGroup {
  groupId: string;
  items: ProductItem[];
  deliveryOptions: DeliveryOption[];
}

// --- Sample Data: Multiple groups, each with multiple delivery options ---
const shippingGroups: ShippingGroup[] = [
  {
    groupId: 'group1',
    items: [
      {
        productId: 'abc1',
        name: 'M1 Akarabo',
        price: 20,
        quantity: 2,
        sellerId: 'seller1',
        image: '/img/akarabo1.jpg',
      },
      {
        productId: 'abc3',
        name: 'M2 Akarabo',
        price: 30,
        quantity: 2,
        sellerId: 'seller1',
        image: '/img/akarabo2.jpg',
      },
    ],
    deliveryOptions: [
      {
        rateId: 'opt1',
        label: 'Wednesday, June 4',
        deliveryTime: '2025-06-04',
        price: 20,
        provider: 'FedEx',
        servicelevel: 'Overnight',
        durationTerms: 'Delivery by tomorrow.',
      },
      {
        rateId: 'opt2',
        label: 'Friday, June 6',
        deliveryTime: '2025-06-06',
        price: 15,
        provider: 'FedEx',
        servicelevel: '2-Day',
        durationTerms: 'Delivery in 2 days.',
      },
      {
        rateId: 'opt3',
        label: 'Sunday, June 8',
        deliveryTime: '2025-06-08',
        price: 5,
        provider: 'USPS',
        servicelevel: 'Ground',
        durationTerms: 'Delivery in 4 days.',
      },
    ],
  },
  {
    groupId: 'group2',
    items: [
      {
        productId: 'def2',
        name: 'M3 Akarabo',
        price: 10,
        quantity: 2,
        sellerId: 'seller2',
        image: '/img/akarabo3.jpg',
      },
    ],
    deliveryOptions: [
      {
        rateId: 'opt4',
        label: 'Tuesday, June 10',
        deliveryTime: '2025-06-10',
        price: 11,
        provider: 'UPS',
        servicelevel: 'Express',
        durationTerms: 'Delivery in 6 days.',
      },
      {
        rateId: 'opt5',
        label: 'June 10 - June 16',
        deliveryTime: '2025-06-10',
        price: 5,
        provider: 'USPS',
        servicelevel: 'Economy',
        durationTerms: 'Delivery between June 10 and June 16.',
      },
    ],
  },
];

const CheckoutReviewPage = () => {
  const router = useRouter();

  // Loading state simulation
  const [isLoading, setIsLoading] = useState(true);

  // Track user selection: groupId => rateId
  const [selectedOptions, setSelectedOptions] = useState<{
    [groupId: string]: string;
  }>({});

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Default select first delivery option per group
  useEffect(() => {
    if (!isLoading && Object.keys(selectedOptions).length === 0) {
      const defaults: { [groupId: string]: string } = {};
      shippingGroups.forEach((group) => {
        if (group.deliveryOptions.length > 0) {
          defaults[group.groupId] = group.deliveryOptions[0].rateId;
        }
      });
      setSelectedOptions(defaults);
    }
  }, [isLoading]);

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return shippingGroups.reduce(
      (sum, group) =>
        sum +
        group.items.reduce(
          (itemSum, item) => itemSum + item.price * item.quantity,
          0
        ),
      0
    );
  }, []);

  // Calculate shipping cost
  const shippingTotal = useMemo(() => {
    let total = 0;
    for (const group of shippingGroups) {
      const selectedRateId = selectedOptions[group.groupId];
      const chosen = group.deliveryOptions.find(
        (opt) => opt.rateId === selectedRateId
      );
      if (chosen) total += chosen.price;
    }
    return total;
  }, [selectedOptions]);

  const tax = useMemo(() => subtotal * 0.075, [subtotal]);
  const grandTotal = subtotal + shippingTotal + tax;

  const handleRadio = (groupId: string, rateId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: rateId,
    }));
  };

  const canSubmit =
    Object.keys(selectedOptions).length === shippingGroups.length;

  const handleProceedToPayment = () => {
    // You'd send the selectedOptions (rateIds), and user/shipping info to your backend here
    // For demo, just redirect
    router.push('/checkout/payment?total=' + grandTotal.toFixed(2));
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loading message='Loading delivery options...' />
      </div>
    );
  }

  return (
    <div className='bg-nezeza_powder_blue min-h-screen py-8 px-2 md:px-8'>
      <h2 className='text-2xl font-bold mb-8 text-nezeza_dark_blue text-center'>
        Review &amp; Choose Delivery Options
      </h2>

      <div className='max-w-3xl mx-auto flex flex-col gap-8'>
        {/* Grouped by Shipping Group, each with multiple delivery choices */}
        {shippingGroups.map((group, idx) => {
          const selectedRateId = selectedOptions[group.groupId];
          const selectedOption = group.deliveryOptions.find(
            (opt) => opt.rateId === selectedRateId
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
                {group.items.map((item) => (
                  <div
                    key={item.productId}
                    className='flex items-center gap-3 bg-gray-50 p-3 rounded shadow-sm'
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className='w-14 h-14 object-cover rounded'
                      />
                    )}
                    <div className='flex-grow'>
                      <div className='font-medium'>{item.name}</div>
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
                {group.deliveryOptions.map((option) => (
                  <label
                    key={option.rateId}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
                      selectedRateId === option.rateId
                        ? 'border border-nezeza_green_600 bg-green-50'
                        : 'border border-gray-200'
                    }`}
                  >
                    <input
                      type='radio'
                      name={`delivery-${group.groupId}`}
                      checked={selectedRateId === option.rateId}
                      onChange={() => handleRadio(group.groupId, option.rateId)}
                      className='form-radio text-nezeza_green_600'
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
          <h3 className='text-lg font-bold mb-4 text-nezeza_dark_blue'>
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
          <div className='flex justify-between text-lg font-bold text-nezeza_dark_blue'>
            <span>Total:</span>
            <span>
              <FormattedPrice amount={grandTotal} />
            </span>
          </div>
        </div>

        <div className='text-center'>
          <SubmitButton
            buttonTitle='Proceed to Payment'
            isLoading={false}
            disabled={!canSubmit}
            className='w-full py-3 bg-nezeza_dark_blue text-white rounded-md hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleProceedToPayment}
          />
          {!canSubmit && (
            <div className='text-red-500 mt-2 text-sm'>
              Please select a delivery option for each group.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CheckoutReviewPage.noLayout = true;
export default CheckoutReviewPage;
