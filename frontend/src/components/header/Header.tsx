import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal,
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
  User,
  Menu,
  Info,
  Store,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ShoppingBag,
  BookOpen,
  FileText,
  Lock,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps, UserProps } from '../../../type';
import logo from '../../images/main.png';
import { LogoutButton } from '../LogoutButton';
import SearchField2 from '../header/SearchField2';
import { getUserByEmail } from '@/utils/user/getUserByEmail';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

const Header = ({
  onSearchChange = () => {},
  searchQuery = '',
}: HeaderProps) => {
  const { data: session } = useSession();
  const { cartItemsData, favoritesItemsData, userInfo, storeInfo } =
    useSelector((state: stateProps) => state.next);
  const [currentUserData, setCurrentUserData] = useState<UserProps | null>(
    null
  );
  // const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = userInfo?._id;
      if (!userId || userInfo?._id === userId) return; // already have this user
      try {
        const userData = await getUserById(userInfo?._id);
        setCurrentUserData(userData);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, [userInfo?._id]);

  useEffect(() => {
    const fetchUserByEmail = async () => {
      const email = session?.user?.email as string;
      if (!email || userInfo?.email === email) return; // already have this user
      try {
        const response = await getUserByEmail(email);
        if (response && response.data.user) {
          const userData = response.data.user;
          dispatch(
            addUser({
              _id: userData._id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              image: userData.image || null,
              address: userData.address || null,
              storeId: userData.storeId || null,
            })
          );
        }
      } catch (error) {
        console.error('Failed to fetch user by email', error);
      }
    };
    fetchUserByEmail();
  }, [session, dispatch]);

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

  // const handleSearchChange = (query: string) => {
  //   setSearchQuery(query); // Update the search query
  // };

  return (
    <div className='w-full bg-gradient-to-r from-vesoko_primary via-vesoko_secondary to-vesoko_primary text-white sticky top-0 z-50 shadow-lg backdrop-blur-sm'>
      {/* Main header row */}
      <div className='h-16 sm:h-20 w-full max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4'>
        {/* Logo - Mobile Optimized */}
        <Link
          href={'/'}
          className='flex-shrink-0 group transition-all duration-300 hover:scale-105'
        >
          <div className='flex items-center justify-center w-[100px] h-[50px] xs:w-[120px] xs:h-[60px] sm:w-[180px] sm:h-[70px] lg:w-[200px] lg:h-[80px] relative'>
            <Image
              src={logo}
              alt='VeSoko Logo'
              width={220}
              height={90}
              className='object-contain w-full h-full filter brightness-110 group-hover:brightness-125 transition-all duration-300'
              priority
            />
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'></div>
          </div>
        </Link>
        
        {/* Searchbar - Enhanced design */}
        <div className='hidden sm:flex flex-grow mx-4 lg:mx-8 max-w-2xl'>
          <div className='w-full relative'>
            <SearchField2
              searchFieldPlaceholder='authentic African products...'
              onSearchChange={onSearchChange}
              value={searchQuery}
            />
          </div>
        </div>

        {/* Right side navigation - Mobile Optimized */}
        <div className='flex items-center gap-1 sm:gap-2 lg:gap-3'>
          {/* Favorites - Mobile Optimized */}
          <Link
            href={'/favorites'}
            className='group relative flex flex-col items-center justify-center px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 min-h-[44px] touch-manipulation'
          >
            <div className='relative'>
              <Heart className='w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-300' />
              {favoritesItemsData && favoritesItemsData.length > 0 && (
                <span className='absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-vesoko_primary text-white text-xs font-bold rounded-full min-w-[16px] h-[16px] sm:min-w-[20px] sm:h-[20px] flex items-center justify-center shadow-lg animate-pulse text-[10px] sm:text-xs'>
                  {favoritesItemsData.length > 9 ? '9+' : favoritesItemsData.length}
                </span>
              )}
            </div>
            <span className='text-white font-medium text-[10px] sm:text-xs mt-0.5 sm:mt-1 group-hover:text-vesoko_background transition-colors duration-300'>
              Favorites
            </span>
          </Link>

          {/* Cart - Mobile Optimized */}
          <Link
            href={'/cart'}
            className='group relative flex flex-col items-center justify-center px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 min-h-[44px] touch-manipulation'
          >
            <div className='relative'>
              <ShoppingCart className='w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-300' />
              {cartItemsData && cartItemsData.length > 0 && (
                <span className='absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-vesoko_primary text-white text-xs font-bold rounded-full min-w-[16px] h-[16px] sm:min-w-[20px] sm:h-[20px] flex items-center justify-center shadow-lg animate-pulse text-[10px] sm:text-xs'>
                  {cartItemsData.length > 9 ? '9+' : cartItemsData.length}
                </span>
              )}
            </div>
            <span className='text-white font-medium text-[10px] sm:text-xs mt-0.5 sm:mt-1 group-hover:text-vesoko_background transition-colors duration-300'>
              Cart
            </span>
          </Link>

          {/* User Account - Mobile Optimized */}
          {userInfo ? (
            <div className='flex items-center'>
              <DropdownMenu>
                <DropdownMenuTrigger className='group relative flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 min-h-[44px] touch-manipulation'>
                  <div className='relative'>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white/30 group-hover:border-white/60 transition-all duration-300'>
                      <Image
                        src={userInfo?.image || currentUserData?.image || defaultUserImage}
                        alt='Profile Picture'
                        width={40}
                        height={40}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-vesoko_primary rounded-full border-1 sm:border-2 border-white'></div>
                  </div>
                  <div className='hidden md:block text-left'>
                    <p className='text-white font-medium text-sm'>Hello!</p>
                    <p className='text-white/80 text-xs'>{userInfo.firstName || 'User'}</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-xl p-2 mt-2'>
                  <DropdownMenuLabel className='text-gray-900 font-semibold px-3 py-2'>
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className='bg-gray-200' />
                  
                  {storeInfo ? (
                    <DropdownMenuItem className='rounded-lg hover:bg-vesoko_background transition-colors duration-200'>
                      <Link
                        href={`/${getSellerTypeBaseurl(storeInfo.storeType)}`}
                        className='flex items-center space-x-3 w-full px-2 py-2'
                      >
                        <LayoutDashboard className='w-5 h-5 text-vesoko_primary' />
                        <span className='text-gray-700 font-medium'>Seller Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem className='rounded-lg hover:bg-blue-50 transition-colors duration-200'>
                        <Link
                          href='/customer/my-account'
                          className='flex items-center space-x-3 w-full px-2 py-2'
                        >
                          <User className='w-5 h-5 text-blue-600' />
                          <span className='text-gray-700 font-medium'>My Account</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='rounded-lg hover:bg-blue-50 transition-colors duration-200'>
                        <Link
                          href='/customer/orders'
                          className='flex items-center space-x-3 w-full px-2 py-2'
                        >
                          <ListOrdered className='w-5 h-5 text-blue-600' />
                          <span className='text-gray-700 font-medium'>My Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='rounded-lg hover:bg-blue-50 transition-colors duration-200'>
                        <Link
                          href='/customer/payments'
                          className='flex items-center space-x-3 w-full px-2 py-2'
                        >
                          <CircleDollarSign className='w-5 h-5 text-blue-600' />
                          <span className='text-gray-700 font-medium'>Payments</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='rounded-lg hover:bg-blue-50 transition-colors duration-200'>
                        <Link
                          href='/customer/notifications'
                          className='flex items-center space-x-3 w-full px-2 py-2'
                        >
                          <Bell className='w-5 h-5 text-blue-600' />
                          <span className='text-gray-700 font-medium'>Notifications</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='rounded-lg hover:bg-blue-50 transition-colors duration-200'>
                        <Link
                          href='/customer/support'
                          className='flex items-center space-x-3 w-full px-2 py-2'
                        >
                          <CircleHelp className='w-5 h-5 text-blue-600' />
                          <span className='text-gray-700 font-medium'>Support</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className='bg-gray-200 my-2' />
                  <DropdownMenuItem className='rounded-lg hover:bg-red-50 transition-colors duration-200'>
                    <div className='w-full px-2 py-1'>
                      <LogoutButton />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link
              href='/login'
              className='group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-vesoko_primary hover:bg-vesoko_primary_dark text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-h-[44px] touch-manipulation'
            >
              <User size={16} className='sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300' />
              <span className='text-xs sm:text-sm'>Sign In</span>
            </Link>
          )}

          {/* Public Pages Navigation Dropdown - Always visible at the far right */}
          <DropdownMenu>
            <DropdownMenuTrigger className='group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 min-h-[44px] touch-manipulation'>
              <Menu className='w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform duration-300' />
              <span className='hidden sm:inline text-white font-medium text-xs sm:text-sm group-hover:text-vesoko_background transition-colors duration-300'>More</span>
              <ChevronDown className='w-3 h-3 sm:w-4 sm:h-4 text-white/80 group-hover:text-white transition-colors duration-300' />
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-52' align='start'>
              <DropdownMenuLabel>Explore VeSoko</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                {/* For Sellers Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Store className='w-4 h-4 text-vesoko_primary mr-2' />
                    For Sellers
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>
                        <Link href='/sellers' className='flex items-center w-full'>
                          <Store className='w-4 h-4 text-vesoko_primary mr-2' />
                          Become a Seller
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href='/select-store-type' className='flex items-center w-full'>
                          <FileText className='w-4 h-4 text-vesoko_primary mr-2' />
                          Start Application
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href='/sellers/faq' className='flex items-center w-full'>
                          <HelpCircle className='w-4 h-4 text-vesoko_primary mr-2' />
                          Seller FAQ
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem>
                        <Link href='/sellers/privacy-policy' className='flex items-center w-full'>
                          <Lock className='w-4 h-4 text-vesoko_primary mr-2' />
                          Seller Privacy
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href='/sellers/terms-conditions' className='flex items-center w-full'>
                          <FileText className='w-4 h-4 text-vesoko_primary mr-2' />
                          Seller Terms
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                
                {/* For Buyers Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ShoppingBag className='w-4 h-4 text-blue-600 mr-2' />
                    For Buyers
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>
                        <Link href='/' className='flex items-center w-full'>
                          <ShoppingBag className='w-4 h-4 text-blue-600 mr-2' />
                          Browse Products
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href='/favorites' className='flex items-center w-full'>
                          <Heart className='w-4 h-4 text-blue-600 mr-2' />
                          My Favorites
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href='/cart' className='flex items-center w-full'>
                          <ShoppingCart className='w-4 h-4 text-blue-600 mr-2' />
                          Shopping Cart
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href='/buyers/faq' className='flex items-center w-full'>
                          <HelpCircle className='w-4 h-4 text-blue-600 mr-2' />
                          Buyers FAQ
                        </Link>
                      </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href='/buyers/privacy-policy' className='flex items-center w-full'>
                            <Lock className='w-4 h-4 text-blue-600 mr-2' />
                            Buyers Privacy
                          </Link>
                        </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href='/buyers/terms-conditions' className='flex items-center w-full'>
                          <FileText className='w-4 h-4 text-blue-600 mr-2' />
                          Buyers Terms
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Link href='/about' className='flex items-center w-full'>
                    <Info className='w-4 h-4 text-blue-600 mr-2' />
                    About Us
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href='/contact' className='flex items-center w-full'>
                    <MessageSquare className='w-4 h-4 text-orange-600 mr-2' />
                    Contact Us
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Link href='/return-refund-policy' className='flex items-center w-full'>
                    <FileText className='w-4 h-4 text-gray-600 mr-2' />
                    Return Policy
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile search bar row - Enhanced design */}
      <div className='sm:hidden bg-gradient-to-r from-vesoko_primary via-vesoko_secondary to-vesoko_primary px-4 pb-4 pt-2 border-t border-white/10'>
        <div className='relative'>
          <SearchField2
            searchFieldPlaceholder='authentic African products...'
            onSearchChange={onSearchChange}
            value={searchQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
