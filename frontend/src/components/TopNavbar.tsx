import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { GoSidebarCollapse } from 'react-icons/go';
import { MdOutlineClose } from 'react-icons/md';
import { getAllNotifications } from '@/utils/notificationUtils';
import { Bell, CircleHelp, CircleUserRound, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { NotificationProps } from '../../type';
import { LogoutButton } from './LogoutButton';

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
  const [unreadCount, setUnreadCount] = useState(0); // State for unread count

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

  // add fixed to fix top nav bar
  return (
    <div
      className={`${
        showSidebar
          ? 'flex items-center justify-between bg-nezeza_light_blue dark:bg-slate-800 text-nezeza_dark_slate dark:text-nezeza_light_slate ml-60 h-20 px-8 py-4 fixed top-0 w-full z-50 pr-[20rem]'
          : 'flex items-center justify-between bg-nezeza_light_blue dark:bg-slate-800 text-nezeza_dark_slate dark:text-nezeza_light_slate h-20 px-8 py-4 fixed top-0 w-full z-50'
      }`}
    >
      <button onClick={() => setShowSidebar(!showSidebar)}>
        <GoSidebarCollapse />
        {/* <SidebarTrigger /> */}
      </button>
      <h2 className='text-2xl font-bold text-center text-nezeza_dark_blue'>
        {storeName}
      </h2>

      <div className='flex space-x-3'>
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
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                href={`/${basePath}/my-account`}
                className='flex items-center space-x-2'
              >
                {/* <CgProfile /> */}
                <CircleUserRound />
                <span>My Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/${basePath}/store-account`}
                className='flex items-center space-x-2'
              >
                {/* <CgProfile /> */}
                <CircleUserRound />
                <span>Store Account</span>
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
