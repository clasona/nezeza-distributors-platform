import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllNotifications } from '@/utils/notificationUtils';
import Image from 'next/image';
import {
  Archive,
  Bell,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  CircleUserRound,
  LayoutDashboard,
  ListOrdered,
  Menu,
  PlusCircle,
  ShoppingCart,
  Store,
  Truck,
  UsersRound,
  Warehouse,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NotificationProps, stateProps } from '../../type';
import { LogoutButton } from './LogoutButton';
import { useSelector } from 'react-redux';

interface TopNavbarProps {
  storeName: string;
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  basePath: string;
}

const TopNavbar = ({
  storeName,
  showSidebar,
  setShowSidebar,
  basePath,
}: TopNavbarProps) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { storeInfo } = useSelector((state: stateProps) => state.next);
  const storeType = storeInfo?.storeType;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllNotifications();
        setNotifications(data);
        if (data) {
          setUnreadCount(data.filter((n: any) => !n.read).length); // Update unread count directly
        } else {
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      className={`flex items-center justify-between bg-white shadow-lg border-b border-gray-200 h-20 px-6 py-3 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showSidebar ? 'md:left-64' : ''
      }`}
    >
      {/* Left Section - Menu Toggle & Store Info */}
      <div className='flex items-center space-x-4'>
        {/* Enhanced Sidebar Toggle Button */}
        <div className='relative group'>
          <button
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
              showSidebar
                ? 'bg-vesoko_green_100 text-vesoko_green_700 hover:bg-vesoko_green_200 shadow-md border border-vesoko_green_200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 hover:shadow-md'
            }`}
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? 'Hide Sidebar (Ctrl+B)' : 'Show Sidebar (Ctrl+B)'}
            aria-label={showSidebar ? 'Hide sidebar navigation' : 'Show sidebar navigation'}
          >
            {showSidebar ? (
              <PanelLeftClose className='w-5 h-5' />
            ) : (
              <PanelLeftOpen className='w-5 h-5' />
            )}
          </button>
          
          {/* Tooltip */}
          <div className='absolute left-1/2 transform -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
            {showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
            <span className='text-gray-300 ml-1'>(Ctrl+B)</span>
            <div className='absolute left-1/2 transform -translate-x-1/2 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800'></div>
          </div>
        </div>

        {/* Store Logo & Info */}
        <div className='flex items-center space-x-3'>
          {/* Store Logo */}
          <div className='relative'>
            {storeInfo?.logo ? (
              <Image
                src={storeInfo.logo}
                alt={`${storeName} logo`}
                width={40}
                height={40}
                className='w-10 h-10 rounded-lg object-cover border-2 border-vesoko_green_200'
              />
            ) : (
              <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-vesoko_green_500 to-vesoko_green_600 flex items-center justify-center'>
                <Store className='w-5 h-5 text-white' />
              </div>
            )}
            {/* Online status indicator */}
            <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
          </div>

          {/* Store Name & Details */}
          <div className='hidden sm:block'>
            <h2 className='text-lg font-bold text-gray-900 truncate max-w-48'>
              {storeName}
            </h2>
            <p className='text-xs text-gray-500 capitalize'>
              {storeType} Store • Online
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Actions & User Menu */}
      <div className='flex items-center space-x-3'>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-200'
            >
              <Bell className='w-5 h-5 text-gray-600' />
              <span className='sr-only'>Notifications</span>
              {unreadCount > 0 && (
                <div className='absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full px-1'>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='px-2 py-4 pr-8'>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {notifications.filter((n) => !n.read).length > 0 ? (
              notifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <DropdownMenuItem key={notification._id}>
                    {' '}
                    {/* Add key prop */}
                    <div className='flex items-center space-x-2'>
                      <div className='flex flex-col space-y-1'>
                        <p>{notification.title}</p>
                        <div className='flex items-center space-x-2'>
                          <p
                            className={`px-3 py-0.5  rounded-full text-sm text-white ${
                              notification.priority === 'high'
                                ? 'bg-red-700'
                                : notification.priority === 'medium'
                                ? 'bg-yellow-700'
                                : 'bg-green-700'
                            }`}
                          >
                            {notification.priority}
                          </p>
                          <p> {notification.createdAt}</p>
                        </div>
                      </div>
                      <button>
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  </DropdownMenuItem>
                ))
            ) : (
              <DropdownMenuItem>
                <p className='text-center text-gray-500'>
                  No unread high priority notifications.
                </p>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200'>
              {storeInfo?.logo ? (
                <Image
                  src={storeInfo.logo}
                  alt='User avatar'
                  width={32}
                  height={32}
                  className='w-8 h-8 rounded-full object-cover'
                />
              ) : (
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-vesoko_green_500 to-vesoko_green_600 flex items-center justify-center'>
                  <CircleUserRound className='w-4 h-4 text-white' />
                </div>
              )}
              <ChevronDown className='w-4 h-4 text-gray-500 hidden sm:block' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-64 p-4 mt-2 mr-4' align='end'>
            {/* Store Header */}
            <div className='flex items-center space-x-3 pb-3 border-b border-gray-200'>
              <div className='relative'>
                {storeInfo?.logo ? (
                  <Image
                    src={storeInfo.logo}
                    alt={`${storeName} logo`}
                    width={48}
                    height={48}
                    className='w-12 h-12 rounded-lg object-cover border-2 border-vesoko_green_200'
                  />
                ) : (
                  <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-vesoko_green_500 to-vesoko_green_600 flex items-center justify-center'>
                    <Store className='w-6 h-6 text-white' />
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-gray-900 truncate'>
                  {storeName}
                </p>
                <p className='text-xs text-gray-500 capitalize'>
                  {storeType} Store
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href={`/${basePath}`}
                className='flex items-center space-x-2'
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/${basePath}/inventory`}
                className='flex items-center space-x-2'
              >
                <Warehouse />
                <span>Inventory</span>
              </Link>
            </DropdownMenuItem>
            {storeType === 'manufacturing' ? (
              <DropdownMenuItem>
                <Link
                  href={`/${basePath}/orders/customer-orders`}
                  className='flex items-center space-x-2'
                >
                  <Truck />
                  <span>Customer Orders</span>
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ListOrdered />
                  <span>Orders</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      <Link
                        href={`/${basePath}/orders/my-orders`}
                        className='flex items-center space-x-2 opacity-60'
                      >
                        <ListOrdered />
                        <span>My Orders</span>
                        <span className='text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full ml-auto'>Phase 2</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/${basePath}/orders/customer-orders`}
                        className='flex items-center space-x-2'
                      >
                        <Truck />
                        <span>Customer Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/${basePath}/orders/archived`}
                        className='flex items-center space-x-2'
                      >
                        <Archive />
                        <span>Archived</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <CircleUserRound />
                <span>Account</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <Link
                      href={`/${basePath}/my-account`}
                      className='flex items-center space-x-2'
                    >
                      <CircleUserRound />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/${basePath}/store-account`}
                      className='flex items-center space-x-2'
                    >
                      <Store />
                      <span>Store Account</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            {storeType !== 'manufacturing' && (
              <DropdownMenuItem>
                <Link href={`/`} className='flex items-center space-x-2'>
                  <ShoppingCart />
                  <span>Shopping</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <PlusCircle />
                <span>More...</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <Link
                      href={`/${basePath}/payments`}
                      className='flex items-center space-x-2'
                    >
                      <CircleDollarSign />
                      <span>Payments</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/${basePath}/customers`}
                      className='flex items-center space-x-2'
                    >
                      <UsersRound />
                      <span>Customers</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/${basePath}/notifications`}
                      className='flex items-center space-x-2'
                    >
                      <Bell />
                      <span>Notifications</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/${basePath}/support`}
                      className='flex items-center space-x-2'
                    >
                      <CircleHelp />
                      <span>Support</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>
              <div>
                <LogoutButton />
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopNavbar;
