import SmallCards from '@/components/SmallCards';
import { handleError } from '@/utils/errorUtils';
import { fetchCustomerOrders } from '@/utils/order/fetchCustomerOrders';
import { getMyUnarchivedOrders } from '@/utils/order/getMyUnarchivedOrders';
import { calculateOrderStats } from '@/utils/orderUtils';
import { createStripeAccount } from '@/utils/stripe/createStripeAccount';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { OrderProps, stateProps } from '../../type';

const SellerDashboard = () => {
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const username = userInfo.firstName;
  const storeType = storeInfo.storeType;
  const [myOrders, setMyOrders] = useState<OrderProps[]>([]);
  const [customerOrders, setCustomerOrders] = useState<OrderProps[]>([]);
  // const hasStripeAccount = userInfo.hasStripeAccount;
  const hasStripeAccount = false; //for testing
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myOrdersData = await getMyUnarchivedOrders();
        const customerOrdersData = await fetchCustomerOrders();
        setMyOrders(myOrdersData);
        setCustomerOrders(customerOrdersData);
      } catch (error: any) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const myOrderStats = calculateOrderStats(myOrders);
  const customerOrderStats = calculateOrderStats(customerOrders);

  const notifications = [
    'New order received from Alice Brown',
    'Stock running low for Product A',
    'Payment of $5000 processed successfully',
  ];

    return (
      <div>
        <h2 className='flex text-2xl font-semibold text-center justify-center text-nezeza_dark_slate mb-4'>{`Welcome back, ${username}!`}</h2>
        {!hasStripeAccount && (
          <div className='bg-nezeza_red_200 p-2 sm:p-4 rounded-xl shadow-lg text-center sm:mb-4'>
            <p className='text-lg'>
              You haven’t set up your Stripe account yet.{' '}
              <span
                className='font-semibold text-nezeza_green_600 underline cursor-pointer'
                onClick={async () => {
                  try {
                    const response = await createStripeAccount(userInfo.email);
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

        {/* <LargeCards /> */}
        {/* Small Cards */}

        <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
          <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
            <h4 className='text-xl text-center font-semibold text-nezeza_dark_blue mb-2'>
              Store Overview
            </h4>
            {/* <LargeCard className='bg-nezeza_green_600 ' /> */}
            <div className='grid md:grid-cols-2 gap-6 '>
              <div className='p-2 sm:p-4 bg-yellow-100 rounded-xl text-center shadow-md'>
                <span className='text-lg font-medium'>Total Expenses</span>
                <p className='text-xl font-bold text-nezeza_yellow_600'>
                  $6, 000
                </p>
              </div>

              <div className='p-2 sm:p-4 bg-green-100 rounded-xl text-center shadow-md'>
                <span className='text-lg font-medium'>Total Sales </span>
                <p className='text-xl font-bold text-nezea_green_600'>
                  $10, 000
                </p>
              </div>
            </div>
                </div>
                {storeType !== 'manufacturing' && (

                    <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
                        <h4 className='text-xl text-center font-semibold text-nezeza_dark_blue mb-2'>
                            My Orders Overview
                        </h4>
                        <SmallCards orderStats={myOrderStats} />
                    </div>)}
          <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
            <h4 className='text-xl text-center font-semibold text-nezeza_dark_blue mb-2'>
              Customer Orders Overview
            </h4>
            <SmallCards orderStats={customerOrderStats} />
          </div>
          <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
            <h4 className='text-xl text-center font-semibold text-nezeza_dark_blue mb-2'>
              Payments Overview
            </h4>
            {/* <div className='p-4 bg-purple-100 rounded-xl text-center shadow-md'>
            Total Earnings: <span className='font-bold'>{totalEarnings}</span>
          </div> */}
            <div className='grid md:grid-cols-2 gap-4 '>
              <p className='font-bold'>
                Pending balance:{' '}
                <span className='text-nezeza_yellow_600'>$2,000</span>
              </p>
              <div className='flex space-x-4'>
                <p className='font-bold'>
                  Available balance:{' '}
                  <span className='text-nezeza_green_600'>$1,000</span>
                </p>
                <Link
                  href=''
                  className='font-semibold text-nezeza_green_600 underline hover:cursor-pointer'
                >
                  Withdrawal
                </Link>
              </div>
            </div>
          </div>
          <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
            <h4 className='text-xl text-center font-semibold text-nezeza_dark_blue mb-2'>
              Inventory Alerts
            </h4>
            <p className='text-lg font-medium'>
              Low quantity items:{' '}
              <span className='font-bold text-nezeza_red_600'>4</span>
            </p>
          </div>

          <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
            <h4 className='text-xl text-center font-semibold text-nezeza_dark_blue mb-2'>
              Store Notifications
            </h4>
            <ul className='space-y-2'>
              {notifications.map((note, index) => (
                <li key={index} className='py-2 border-b last:border-b-0'>
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
            <h4 className='text-xl text-center font-semibold text-nezeza_dark_blue'>
              Weekly Sales Charts
            </h4>
            <div className='bg-gray-200 p-10 text-center rounded-xl shadow-md'>
              Chart Placeholder
            </div>
          </div>
        </div>
      </div>
    );
};
export default SellerDashboard;
