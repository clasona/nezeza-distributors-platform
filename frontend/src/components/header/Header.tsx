import logo from '../../images/logo.jpg';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import cartIcon from '../../images/cart.png';
import { BiCaretDown } from 'react-icons/bi';
import { HiOutlineSearch } from 'react-icons/hi';
import { SlLocationPin } from 'react-icons/sl';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { stateProps } from '../../../type';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { addUser } from '@/store/nextSlice';
import { getUser } from '@/utils/user/getUser';
import defaultUserImage from '@/images/defaultUserImage.png';
import {
  Bell,
  CircleDollarSign,
  CircleHelp,
  CircleUserRound,
  Heart,
  ListOrdered,
  ShoppingCart,
  SquareArrowOutUpRight,
} from 'lucide-react';
import { LogoutButton } from '../LogoutButton';
import { getSellerTypeBaseurl } from '@/lib/utils';

// import { SessionProvider } from "next-auth/react";

const Header = () => {
  const { data: session } = useSession();
  const { cartItemsData, productData, favoriteData, userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  const [currentUserData, setCurrentUserData] = useState<any | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userInfo?.userId) return; // Ensure userId exists before fetching
      try {
        const userData = await getUser(userInfo.userId);
        setCurrentUserData(userData);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, []);

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

  return (
    <div className='w-full h-20 bg-nezeza_dark_blue text-lightText sticky top-0 z-50'>
      <div className='h-full w-full mx-auto inline-flex items-center justify-between gap-1 mdl:gap-3 px-4 '>
        {/* logo */}
        <Link
          href={'/'}
          className='px-2 border border-transparent hover:border-white cursor-pointer duration-300 flex items-center justify-center h-[70%]'
        >
          <Image className='w-32 object-cover ' src={logo} alt='logoImg' />
        </Link>
        {/* delivery */}
        <div className='px-2 border border-transparent hover:border-white cursor-pointer duration-300 items-center justify-center h-[70%] hidden xl:inline-flex gap-1'>
          <SlLocationPin />
          <div className='text-xs'>
            <p>Deliver to</p>
            <p className='text-white font-bold uppercase'>Chicago</p>
          </div>
        </div>
        {/* searchbar */}
        <div className='flex-1 h-10 hidden md:inline-flex items-center justify-between relative '>
          <input
            className='w-full h-full rounded-3xl px-2 placeholder:text-sm text-base text-black border-[3px] border-transparent outline-none
                focus-visible:border-nezeza_yellow'
            type='text'
            placeholder='Search nezeza products'
          />
          <span
            className='w-12 h-full bg-nezeza_yellow text-black text-2xl flex
                items-center justify-center absolute right-0 rounded-3xl rounded-br-md'
          >
            <HiOutlineSearch />
          </span>
        </div>
        <div className='text-xs text-gray-100 flex flex-col items-center justify-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%] relative'>
          <Heart size={22} />
          <p className='text-white font-bold text-center'>Favorites</p>{' '}
          {favoriteData.length > 0 && (
            <span className='absolute right-2 top-2 w-4 h-4 border-[1px] border-gray-400 flex items-center justify-center text-xs text-nezeza_yellow'>
              {favoriteData.length}
            </span>
          )}
        </div>

        {/* cart */}
        <Link
          href={'/cart'}
          className='flex items-center px-2  border
            border-transparent hover:border-white cursor-pointer duration-300 h-[70%] relative'
        >
          <Image
            className='w-auto object-cover h-8'
            src={cartIcon}
            alt='cartImg'
          />
          <p className='text-xs text-white font-bold mt-3'>Cart</p>
          <span className='absolute text-nezeza_yellow text-sm top-2 left-[29px] font-semibold'>
            {cartItemsData ? cartItemsData.length : 0}
          </span>
        </Link>
        {/* signin */}
        {userInfo ? (
          <div className='flex items-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%] gap-1'>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Image
                  src={currentUserData?.image || defaultUserImage}
                  alt='userProfilePicture'
                  width={50} // Adjust the width as needed
                  height={50} // Adjust the height as needed
                  className='w-8 h-8 rounded-full object-cover'
                />

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
                      href={`/${getSellerTypeBaseurl()}`}
                      target='_blank'
                      className='flex items-center space-x-2'
                    >
                      <SquareArrowOutUpRight />
                      <span>Seller Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <div>
                    <DropdownMenuItem>
                      <Link
                        href={`/user/my-account`}
                        className='flex items-center space-x-2'
                      >
                        <CircleUserRound />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/user/orders`}
                        className='flex items-center space-x-2'
                      >
                        <ListOrdered />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/user/payments`}
                        className='flex items-center space-x-2'
                      >
                        <CircleDollarSign />
                        <span>Payments</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/user/notifications`}
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
                        href={`/user/support`}
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
            // onClick={() => signIn()}
            className='text-xs text-gray-100 flex flex-col justify-center px-2 border
        border-transparent hover:border-white cursor-pointer duration-300 h-[70%]'
          >
            <div>
              {/* <p>Hello, sign in</p> */}
              <p className='text-white font-bold flex'>
                Signin or Signup{' '}
                <span>
                  <BiCaretDown />
                </span>
              </p>
            </div>
          </Link>
        )}

        {/* <Link
          href={'/login'}
          className='flex items-center border
            border-transparent hover:border-white cursor-pointer relative'
        >
          <p className='text-xs text-white font-bold'>Signin or Signup</p> */}
        {/* <span className="absolute text-nezeza_yellow text-sm top-2 left-[29px] font-semibold">
                    {productData ? productData.length: 0}
                </span> */}
        {/* </Link> */}
        {/* </div> */}
        {/* } */}
        {/* favorite */}
      </div>
    </div>
  );
};

export default Header;
