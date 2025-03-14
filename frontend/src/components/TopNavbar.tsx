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
import {
  Archive,
  Bell,
  CircleDollarSign,
  CircleHelp,
  CircleUserRound,
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  ShoppingCart,
  Store,
  Truck,
  UsersRound,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GoSidebarCollapse } from 'react-icons/go';
import { MdOutlineClose } from 'react-icons/md';
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
  const storeType = storeInfo.storeType;

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
      className={`flex items-center justify-between bg-nezeza_light_blue dark:bg-slate-800 text-nezeza_dark_slate dark:text-nezeza_light_slate h-20 px-8 py-4 fixed top-0 w-full z-50 ${
        showSidebar ? 'sm:ml-60 sm:pr-[20rem]' : ''
      }`}
    >
      <button
        className='hidden sm:block'
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <GoSidebarCollapse />
      </button>
      <h2 className='text-2xl font-bold text-center text-nezeza_dark_blue'>
        {storeName}
      </h2>

      <div className='flex items-center space-x-3'>
        <button>
          {/* <ThemeSwitcher /> */}
          {/* <MdOutlineLightMode className='text-2xl text-nezeza_dark_slate group-hover:text-nezeza_dark_slate '></MdOutlineLightMode> */}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              type='button'
              className='relative inline-flex items-center p-3 text-sm font-medium text-center text-nezeza_dark_slate bg-transparent rounded-lg'
            >
              {/* <MdOutlineNotifications className='text-2xl text-nezeza_dark_slate group-hover:text-nezeza_dark_slate '></MdOutlineNotifications> */}
              <Bell />
              <span className='sr-only'>Notifications</span>
              <div className='absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-nezeza_red_600 border-2  rounded-full -top-0 end-6 dark:border-gray-900'>
                {unreadCount}
              </div>
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
                        <MdOutlineClose />
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

        <DropdownMenu>
          <DropdownMenuTrigger>
            <button>
              <CircleUserRound />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='px-2 py-4 pr-8'>
            <DropdownMenuLabel>My Store</DropdownMenuLabel>
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
                        className='flex items-center space-x-2'
                      >
                        <ListOrdered />
                        <span>My Orders</span>
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
