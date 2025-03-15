import Heading from '@/components/Heading';
import Link from 'next/link';
import { useState } from 'react';

const UserPayments = () => {
  const [stripeAccount, setStripeAccount] = useState(null);
  const [pendingBalance, setPendingBalance] = useState(2000);
  const [availableBalance, setAvailableBalance] = useState(1000);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'Payment Received', amount: 500, date: 'Feb 5, 2025' },
    { id: 2, type: 'Withdrawal', amount: 300, date: 'Feb 3, 2025' },
  ]);

  //   useEffect(() => {
  //     // Fetch stripe account details from backend
  //     setStripeAccount({ id: 'acct_123456', status: 'active' });
  //   }, []);

  return (
    <div>
      <Heading title='Payments Overview' />
      <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
          <h4 className='text-2xl font-semibold text-nezeza_dark_blue mb-4'>
            Stripe Account
          </h4>
          {stripeAccount ? (
            <p className='text-lg'>
              Your Stripe account is connected.{' '}
              <Link
                href='/stripe-account'
                className='text-nezeza_green_600 font-semibold underline'
              >
                View/Edit Account
              </Link>
            </p>
          ) : (
            <p className='text-lg'>
              You haven’t set up your Stripe account yet.{' '}
              <Link
                href='/setup-stripe'
                className='text-nezeza_green_600 font-semibold underline'
              >
                Set up now
              </Link>
            </p>
          )}
        </div>

        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
          <h4 className='text-2xl font-semibold text-nezeza_dark_blue mb-4'>
            Balance Overview
          </h4>
          <div className='grid md:grid-cols-2 gap-4 sm:gap-6'>
            <div className='p-4 sm:p-6 bg-yellow-100 rounded-xl text-center shadow-md'>
              <span className='text-lg font-medium'>Pending Balance</span>
              <p className='text-xl font-bold text-yellow-600'>
                ${pendingBalance}
              </p>
            </div>
            <div className='p-4 sm:p-6 bg-green-100 rounded-xl text-center shadow-md'>
              <span className='text-lg font-medium'>Available Balance</span>
              <p className='text-xl font-bold text-green-600'>
                ${availableBalance}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
          <h4 className='text-2xl font-semibold text-nezeza_dark_blue mb-4'>
            Recent Transactions
          </h4>
          <ul className='space-y-4'>
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className='p-4 bg-gray-100 rounded-md flex justify-between'
              >
                <span>{tx.type}</span>
                <span className='font-bold'>${tx.amount}</span>
                <span className='text-gray-500'>{tx.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-lg'>
          <h4 className='text-2xl font-semibold text-nezeza_dark_blue mb-4'>
            Withdraw Funds
          </h4>
          <p className='text-lg mb-4'>
            Your available balance is{' '}
            <span className='font-bold text-green-600'>
              ${availableBalance}
            </span>
          </p>
          <button className='bg-nezeza_green_600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-green-700'>
            Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  );
};

UserPayments.noLayout = true;
export default UserPayments;
