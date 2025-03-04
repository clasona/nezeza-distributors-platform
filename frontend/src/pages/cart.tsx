import CartPayment from '@/components/Cart/CartPayment';
import CartProduct from '@/components/Cart/CartProduct';
import ResetCart from '@/components/ResetCart';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { OrderItemsProps, stateProps } from '../../type';

const cartPage = () => {
  const { cartItemsData } = useSelector((state: stateProps) => state.next);
  //  const dispatch = useDispatch();
  //  const [loading, setLoading] = useState(true);

  //  useEffect(() => {
  //    const fetchUpdatedCart = async () => {
  //      try {
  //        const res = await getCart();

  //        dispatch(setCartItems(res)); // Update Redux state with latest cart
  //      } catch (error) {
  //        console.error('Error fetching updated cart:', error);
  //      } finally {
  //        setLoading(false);
  //      }
  //    };

  //    fetchUpdatedCart();
  //  }, [dispatch]);

  //  if (loading) {
  //    return <p className='text-center py-10'>Loading cart...</p>;
  //  }
  return (
    <div className='max-w-screen-2xl mx-auto px-6 grid grid-cols-5 gap-10 py-4'>
      {cartItemsData.length > 0 ? (
        <>
          <div className='bg-white col-span-4 p-4 rounded-lg'>
            <div
              className='flex items-center justify-between border-b-[1px]
                        border-b-gray-400 pb-1'
            >
              <p className='text-2xl font-semibold text-nezeza_dark_blue'>
                Shopping Cart
              </p>
              <p className='text-lg font-semibold text-nezeza_dark_blue'>
                Subtotal
              </p>
            </div>
            <div>
              {cartItemsData.map((item: OrderItemsProps) => (
                <div
                  key={item.product._id}
                  className='pt-2 flex flex-col gap-2'
                >
                  <CartProduct item={item} />
                </div>
              ))}
              <div className='mt-4'>
                <ResetCart />
              </div>
            </div>
          </div>

          <div
            className='bg-white h-64 col-span-1 rounded-lg flex
                    items-center justify-center'
          >
            <CartPayment />
          </div>
        </>
      ) : (
        <div className='w-full col-span-5 flex flex-col items-center justify -center py-5 rounded-lg shadow-lg'>
          <h1 className='text-lg font-medium'>Your Cart is Empty</h1>
          {/* Redirect to this user's home page */}
          <Link href='/'>
            <button
              className='w-52 h-10 bg-nezeza_dark_blue text-white rounded-text-sm
                    font-semibold hover:bg-nezeza_green_600 hover:text-white'
            >
              Go to Shopping
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default cartPage;
