'use client';

import logo from '@/images/main.png';
import {
  Archive,
  Bell,
  CircleDollarSign,
  CircleHelp,
  LayoutDashboard,
  ListOrdered,
  ShoppingCart,
  Store,
  Truck,
  UserRoundPen,
  UsersRound,
  Warehouse,
  ChevronRight,
  LogOut,
  TrendingUp,
  Package,
  ExternalLink,
  BarChart3,
  Crown,
  Mail,
  Smartphone,
  Zap,
  Globe,
  Clock,
  Rocket,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';
import { LogoutButton } from './LogoutButton';
import { Loader2 } from 'lucide-react';

interface SideNavbarProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  basePath: string;
}

const SideNavbar = ({
  showSidebar,
  setShowSidebar,
  basePath,
}: SideNavbarProps) => {
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string>('');
  const pathname = usePathname();
  const { storeInfo } = useSelector((state: stateProps) => state.next);
  const router = useRouter();
  const storeType = storeInfo?.storeType;
  
  // Handle route changes for loading state
  useEffect(() => {
    const handleStart = (url: string) => {
      setIsNavigating(true);
      setNavigatingTo(url);
    };
    const handleComplete = () => {
      setIsNavigating(false);
      setNavigatingTo('');
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Optimized navigation handler
  const handleNavigation = async (href: string, external?: boolean) => {
    if (external) {
      window.location.href = href;
      return;
    }
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
    
    // Use Next.js router for smooth navigation
    await router.push(href);
  };

  // Organized menu sections
  const menuSections = [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          href: `${basePath}`,
          icon: LayoutDashboard,
          description: 'Store overview & analytics',
        },
      ],
    },
    {
      title: 'Sales & Orders',
      items: [
        {
          title: 'Customer Orders',
          href: `${basePath}/orders/customer-orders`,
          icon: Truck,
          description: 'Manage customer orders',
        },
        ...(storeType !== 'manufacturing' ? [
          {
            title: 'My Orders',
            href: `${basePath}/orders/my-orders`,
            icon: ListOrdered,
            description: 'Orders I placed from manufacturers',
            comingSoon: true,
            phase: 'Phase 2',
          },
          {
            title: 'Archived Orders',
            href: `${basePath}/orders/archived`,
            icon: Archive,
            description: 'Completed & archived orders',
          },
        ] : []),
      ],
    },
    {
      title: 'Inventory & Products',
      items: [
        {
          title: 'Inventory',
          href: `${basePath}/inventory`,
          icon: Warehouse,
          description: 'Manage your products',
        },
      ],
    },
    {
      title: 'Business',
      items: [
        {
          title: 'Analytics',
          href: `${basePath}/analytics`,
          icon: BarChart3,
          description: 'Advanced insights & reports',
          premium: true,
        },
        {
          title: 'Payments',
          href: `${basePath}/payments`,
          icon: CircleDollarSign,
          description: 'Revenue & payouts',
        },
        {
          title: 'Customers',
          href: `${basePath}/customers`,
          icon: UsersRound,
          description: 'Customer management',
        },
      ],
    },
    {
      title: 'Marketing & Growth',
      items: [
        {
          title: 'Email Marketing',
          href: `${basePath}/marketing/email`,
          icon: Mail,
          description: 'Automated campaigns & newsletters',
          premium: true,
        },
        {
          title: 'Mobile App',
          href: `${basePath}/marketing/mobile-app`,
          icon: Smartphone,
          description: 'Custom branded mobile app',
          premium: true,
        },
        {
          title: 'AI Assistant',
          href: `${basePath}/marketing/ai-assistant`,
          icon: Zap,
          description: 'AI-powered business insights',
          premium: true,
        },
      ],
    },
    {
      title: 'Integrations',
      items: [
        {
          title: 'Multi-Channel',
          href: `${basePath}/integrations/multi-channel`,
          icon: Globe,
          description: 'Sell on Amazon, eBay, Etsy & more',
          premium: true,
        },
      ],
    },
    {
      title: 'Account & Settings',
      items: [
        {
          title: 'My Account',
          href: `${basePath}/my-account`,
          icon: UserRoundPen,
          description: 'Personal profile settings',
        },
        {
          title: 'Store Account',
          href: `${basePath}/store-account`,
          icon: Store,
          description: 'Store profile & settings',
        },
        {
          title: 'Notifications',
          href: `${basePath}/notifications`,
          icon: Bell,
          description: 'Alerts & messages',
        },
      ],
    },
    {
      title: 'External',
      items: [
        ...(storeType !== 'manufacturing' ? [
          {
            title: 'Shopping',
            href: '/',
            icon: ShoppingCart,
            description: 'Browse marketplace',
            external: true,
          },
        ] : []),
        {
          title: 'Support',
          href: `${basePath}/support`,
          icon: CircleHelp,
          description: 'Help & support center',
        },
      ],
    },
  ];

  // Filter out empty sections
  const filteredSections = menuSections.filter(section => section.items.length > 0);

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        showSidebar
          ? 'w-64 translate-x-0'
          : 'w-64 -translate-x-full sm:-translate-x-64'
      } fixed left-0 top-0 h-screen bg-white shadow-xl border-r border-gray-200 z-40 flex flex-col hidden sm:flex`}
    >
      {/* Header Section with Store Info */}
      <div className='px-6 py-6 border-b border-gray-200'>
        {/* Header with Logo and Collapse Button */}
        <div className='mb-4 flex items-center justify-between'>
          <Link href='/' className='block'>
            <Image className='h-12 w-auto' src={logo} alt='VeSoko Logo' />
          </Link>
          
          {/* Sidebar Collapse Button */}
          <button
            onClick={() => setShowSidebar(false)}
            className='hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors duration-200'
            title='Collapse Sidebar'
            aria-label='Collapse sidebar'
          >
            <ChevronRight className='w-4 h-4 text-gray-500' />
          </button>
        </div>
        
        {/* Store Info Card */}
        <div className='bg-gradient-to-r from-vesoko_background to-vesoko_background_light rounded-xl p-4 border border-vesoko_background'>
          <div className='flex items-center space-x-3'>
            <div className='relative'>
              {storeInfo?.logo ? (
                <Image
                  src={storeInfo.logo}
                  alt='Store logo'
                  width={48}
                  height={48}
                  className='w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm'
                />
              ) : (
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-vesoko_primary to-vesoko_primary flex items-center justify-center'>
                  <Store className='w-6 h-6 text-white' />
                </div>
              )}
              <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full'></div>
            </div>
            
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-gray-900 text-sm truncate'>
                {storeInfo?.storeName || 'My Store'}
              </h3>
              <p className='text-xs text-gray-600 capitalize'>
                {storeType} Store • Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className='flex-1 overflow-y-auto px-4 py-4'>
        <nav className='space-y-6'>
          {filteredSections.map((section, sectionIndex) => (
            <div key={section.title}>
              <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2'>
                {section.title}
              </h4>
              <ul className='space-y-1'>
                {section.items.map((item) => {
                  // Don't mark external links as active
                  const isActive = !(item as any).external && (
                    item.href === pathname || 
                    (item.href !== `${basePath}` && item.href !== '/' && pathname.startsWith(item.href))
                  );
                  
                  const isNavigatingToThis = navigatingTo === item.href;
                  
                  return (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        prefetch={true}
                        onClick={(e) => {
                          if ((item as any).external) {
                            e.preventDefault();
                            window.open(item.href, '_blank', 'noopener,noreferrer');
                          } else {
                            e.preventDefault();
                            handleNavigation(item.href, false);
                          }
                        }}
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                          isActive
                            ? 'bg-gradient-to-r from-vesoko_primary to-vesoko_primary text-white shadow-md transform scale-105'
                            : isNavigatingToThis
                            ? 'bg-gray-100 text-gray-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        } ${
                          isNavigatingToThis ? 'cursor-wait' : 'cursor-pointer'
                        }`}
                      >
                        {isNavigatingToThis ? (
                          <Loader2 className='flex-shrink-0 w-5 h-5 mr-3 animate-spin text-vesoko_primary' />
                        ) : (
                          <item.icon 
                            className={`flex-shrink-0 w-5 h-5 mr-3 ${
                              isActive 
                                ? 'text-white' 
                                : 'text-gray-400 group-hover:text-gray-600'
                            }`} 
                          />
                        )}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between'>
                            <span className='truncate'>
                              {isNavigatingToThis ? 'Loading...' : item.title}
                            </span>
                            <div className='flex items-center gap-1'>
                              {(item as any).premium && (
                                <div className='flex items-center gap-1'>
                                  <Crown className={`w-3 h-3 ${
                                    isActive ? 'text-yellow-200' : 'text-yellow-500'
                                  }`} />
                                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                    isActive 
                                      ? 'bg-yellow-400/20 text-yellow-100' 
                                      : 'bg-yellow-100 text-yellow-600'
                                  }`}>
                                    PRO
                                  </span>
                                </div>
                              )}
                              {(item as any).comingSoon && (
                                <div className='flex items-center gap-1'>
                                  <Rocket className={`w-3 h-3 ${
                                    isActive ? 'text-blue-200' : 'text-blue-500'
                                  }`} />
                                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                    isActive 
                                      ? 'bg-blue-400/20 text-white' 
                                      : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    {(item as any).phase || 'SOON'}
                                  </span>
                                </div>
                              )}
                              {(item as any).external && (
                                <ExternalLink className='w-3 h-3 text-gray-400' />
                              )}
                            </div>
                          </div>
                          {showSidebar && (
                            <p className={`text-xs truncate mt-0.5 ${
                              isActive ? 'text-gray-200' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Section with Logout */}
      <div className='border-t border-gray-200 px-4 py-4'>
        <div className='bg-gray-50 rounded-lg p-3'>
          <LogoutButton className='w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200' />
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
