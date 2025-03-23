import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import defaultUserImage from '@/images/defaultUserImage.png';
import { getSellerTypeBaseurl } from '@/lib/utils';
import { addUser } from '@/redux/nextSlice';
import { getUserById } from '@/utils/user/getUserById';
import {
  Bell,
  CircleDollarSign,
  CircleHelp,
  CircleUserRound,
  Heart,
  LayoutDashboard,
  ListOrdered,
  ShoppingCart,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../../type';
import logo from '../../images/logo.jpg';
import { LogoutButton } from '../LogoutButton';
import SearchField from '../Table/SearchField';

// import { SessionProvider } from "next-auth/react";

const Header = () => {
  const { data: session } = useSession();
  const { cartItemsData, favoriteData, userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );
  let currentUserData: any;
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();

  const fetchUserData = async () => {
    if (!userInfo?._id) return; // Ensure userId exists before fetching
    try {
      const userData = await getUserById(userInfo._id);
      currentUserData = userData;
    } catch (error) {
      console.error('Failed to fetch user data', error);
    }
  };

  fetchUserData();

  useEffect(() => {
    if (session) {
      dispatch(
        addUser({
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
        })
      );
    }
  }, [session]);

  // useEffect(() => {
  //   const flteredBySearching = myOrders.filter((order) => {
  //     const searchMatch = Object.values(order)
  //       .join(' ')
  //       .toLowerCase()
  //       .includes(searchQuery.toLowerCase());
  //     const statusMatch =
  //       statusFilter === 'Status' || order.fulfillmentStatus === statusFilter;
  //     return searchMatch && statusMatch;
  //   });

  //   setFilteredOrders(flteredBySearching);
  // }, [searchQuery, statusFilter, myOrders]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  return (
    <div className='w-full h-20 bg-nezeza_dark_blue text-lightText sticky top-0 z-50'>
      <div className='h-full w-full mx-auto flex items-center justify-between gap-1 sm:gap-3 px-4'>
        {/* logo */}
        <Link
          href={'/'}
          className='px-1 sm:px-2 border border-transparent hover:border-white cursor-pointer duration-300 flex items-center justify-center h-[60%] sm:h-[70%]'
        >
          <Image
            className='w-16 sm:w-32 object-cover'
            src={logo}
            alt='logoImg'
          />
        </Link>
        {/* delivery */}
        {/* <div className='px-2 border border-transparent hover:border-white cursor-pointer duration-300 items-center justify-center h-[70%] hidden lg:flex gap-1'>
          <SlLocationPin />
          <div className='text-xs'>
            <p>Deliver to</p>
            <p className='text-white font-bold uppercase'>Chicago</p>
          </div>
        </div> */}
        {/* searchbar */}
        <div className='flex-grow'>
          <SearchField
            searchFieldPlaceholder='nezeza products'
            onSearchChange={handleSearchChange}
          />
        </div>

        <div className='text-xs sm:text-sm text-gray-100 flex flex-col items-center justify-center px-1 sm:px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[60%] sm:h-[70%] relative flex-shrink'>
          <Heart className='w-22 h-22' />
          <p className='text-white font-bold text-center sm:text-xs'>
            Favorites
          </p>

          <span className='absolute right-2 top-2 w-4 h-4 border border-nezeza_yellow flex items-center justify-center top-[-1px] text-xs font-semibold text-nezeza_yellow'>
            {favoriteData ? favoriteData.length : 0}
          </span>
        </div>

        {/* cart */}
        <Link
          href={'/cart'}
          className='text-xs sm:text-sm text-gray-100 flex flex-col items-center justify-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%] relative'
        >
          <ShoppingCart className='w-22 h-22 text-white' />
          <span className='absolute text-nezeza_yellow text-xs top-[-1px] right-[-4px] font-semibold min-w-[16px] h-[16px] flex items-center justify-center bg-nezeza_dark_blue border border-nezeza_yellow'>
            {cartItemsData ? cartItemsData.length : 0}
          </span>
          <p className='text-white font-bold text-center sm:text-xs'>Cart</p>
        </Link>

        {/* signin */}
        {userInfo ? (
          <div className='flex items-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%] gap-1'>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className='w-8 h-8 rounded-full overflow-hidden'>
                  {' '}
                  {/* Wrapper div */}
                  <Image
                    src={currentUserData?.image || defaultUserImage}
                    alt='userProfilePicture'
                    width={40}
                    height={40}
                    layout='responsive'
                    sizes='40px'
                    className='w-full h-full object-cover'
                  />
                </div>

                {/* <div
                  className='text-xs text-gray-100 flec flex-col
                justify-between'
                >
                  <p className='text-white font-bold'>Hi,</p>
                  <p>{userInfo.firstName}</p>
                </div> */}
              </DropdownMenuTrigger>
              <DropdownMenuContent className='px-2 py-4 pr-8'>
                <DropdownMenuLabel>Account</DropdownMenuLabel>

                <DropdownMenuSeparator />
                {storeInfo ? (
                  <DropdownMenuItem>
                    <Link
                      href={`/${getSellerTypeBaseurl(storeInfo.storeType)}`}
                      className='flex items-center space-x-2'
                    >
                      <LayoutDashboard className='w-4 h-4' />
                      <span>Seller Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <div>
                    <DropdownMenuItem>
                      <Link
                        href={`/customer/my-account`}
                        className='flex items-center space-x-2'
                      >
                        <CircleUserRound />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/customer/orders`}
                        className='flex items-center space-x-2'
                      >
                        <ListOrdered />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/customer/payments`}
                        className='flex items-center space-x-2'
                      >
                        <CircleDollarSign />
                        <span>Payments</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/customer/notifications`}
                        className='flex items-center space-x-2'
                      >
                        <Bell />
                        <span>Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/`} className='flex items-center space-x-2'>
                        <ShoppingCart />
                        <span>Shopping</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/customer/support`}
                        className='flex items-center space-x-2'
                      >
                        <CircleHelp />
                        <span>Support</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                )}
                <DropdownMenuItem>
                  <div>
                    <LogoutButton />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link
            href={'/login'}
            className='text-xs sm:text-sm text-gray-100 flex flex-col items-center justify-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%] relative'
          >
            <CircleUserRound size={22} className='text-white' />
            <p className='text-white font-bold text-center sm:text-xs'>Login</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
