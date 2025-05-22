import FavoritesProduct from '@/components/Favorites/FavoritesProduct';
import ResetFavorites from '@/components/Favorites/ResetFavorites';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { OrderItemsProps, stateProps } from '../../type';

const favoritesPage = () => {
  const { favoritesItemsData } = useSelector((state: stateProps) => state.next);

  return (
    <div className='mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-10 py-2 sm:py-4'>
      {favoritesItemsData.length > 0 ? (
        <>
          <div className='bg-white col-span-2 sm:col-span-4 p-4 rounded-lg'>
            <div
              className='flex items-center justify-between border-b-[1px]
                        border-b-gray-400 pb-1'
            >
              <p className='text-2xl font-semibold text-nezeza_dark_blue'>
                Favorites
              </p>
              <p className='text-lg font-semibold text-nezeza_dark_blue'>
                Subtotal
              </p>
            </div>
            <div>
              {favoritesItemsData.map((item: OrderItemsProps) => (
                <div
                  key={item.product._id}
                  className='pt-2 flex flex-col gap-2'
                >
                  <FavoritesProduct item={item} />
                </div>
              ))}
              <div className='mt-4 text-center sm:text-left'>
                <ResetFavorites />
              </div>
            </div>
          </div>

    
        </>
      ) : (
        <div className='w-full col-span-2 sm:col-span-5 flex flex-col items-center justify-center py-5 rounded-lg shadow-lg'>
          <h1 className='text-lg font-medium mb-4'>Your Favorites is Empty</h1>
          <button
            className='w-52 h-10 bg-nezeza_dark_blue text-white rounded-text-sm
                    font-semibold hover:bg-nezeza_green_600 hover:text-white'
            onClick={() => (window.location.href = '/')}
          >
            Go to Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default favoritesPage;
