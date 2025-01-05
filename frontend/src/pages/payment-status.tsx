import { useRouter } from 'next/router';

const PaymentStatus = () => {
  const router = useRouter();
  const { status } = router.query;

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <h1 className='text-2xl font-bold'>
        {status === 'success' ? 'Payment Successful 🎉' : 'Payment Failed ❌'}
      </h1>
    </div>
  );
};

export default PaymentStatus;
