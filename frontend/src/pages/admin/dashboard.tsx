import PageHeader from '@/components/PageHeader';
import Button from '@/components/FormInputs/Button';
import { 
  RotateCcw, 
  Users, 
  Store, 
  ShoppingCart, 
  Truck, 
  CircleDollarSign, 
  MessageSquare, 
  Book,
  BarChart3,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from './layout';

const DashboardPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate a data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Dashboard cards data
  const dashboardCards = [
    {
      title: 'Store Applications',
      description: 'Manage and review all pending store applications',
      icon: Book,
      color: 'bg-vesoko_primary',
      path: '/admin/store-applications',
      count: '12 Pending'
    },
    {
      title: 'Users Management',
      description: 'View and manage all registered users',
      icon: Users,
      color: 'bg-vesoko_primary',
      path: '/admin/users',
      count: '1,234 Users'
    },
    {
      title: 'Stores',
      description: 'Monitor and manage active stores',
      icon: Store,
      color: 'bg-vesoko_primary_600',
      path: '/admin/stores',
      count: '56 Active'
    },
    {
      title: 'Products',
      description: 'Overview of all products in the platform',
      icon: ShoppingCart,
      color: 'bg-vesoko_primary',
      path: '/admin/products',
      count: '2,340 Products'
    },
    {
      title: 'Orders',
      description: 'Track and manage customer orders',
      icon: Truck,
      color: 'bg-vesoko_red_600',
      path: '/admin/orders',
      count: '89 Today'
    },
    {
      title: 'Payments',
      description: 'Monitor payment transactions and issues',
      icon: CircleDollarSign,
      color: 'bg-vesoko_secondary',
      path: '/admin/payments',
      count: '$12,450 Today'
    },
    {
      title: 'Support',
      description: 'Handle customer support requests',
      icon: MessageSquare,
      color: 'bg-vesoko_primary',
      path: '/admin/support',
      count: '5 Open'
    },
    {
      title: 'Analytics',
      description: 'View platform performance and metrics',
      icon: BarChart3,
      color: 'bg-vesoko_primary_2',
      path: '/admin/analytics',
      count: 'View Reports'
    },
    {
      title: 'Settings',
      description: 'Configure platform settings and preferences',
      icon: Settings,
      color: 'bg-vesoko_gray_600',
      path: '/admin/settings',
      count: 'Configure'
    }
  ];

  return (
    <AdminLayout>
      <PageHeader
        heading='Admin Dashboard'
        actions={
          <Button
            isLoading={isRefreshing}
            icon={RotateCcw}
            buttonTitle='Refresh'
            buttonTitleClassName='hidden md:inline'
            loadingButtonTitle='Refreshing...'
            className='text-vesoko_primary hover:text-white hover:bg-vesoko_primary'
            onClick={handleRefresh}
          />
        }
      />
      {/* Dashboard Overview Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
        {dashboardCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={index} 
              className='bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-vesoko_gray_200 hover:shadow-xl transition-shadow duration-300'
            >
              <div className='flex items-center justify-between mb-4'>
                <div className={`p-3 rounded-full ${card.color} text-white`}>
                  <IconComponent className='h-6 w-6' />
                </div>
                <span className='text-sm font-medium text-vesoko_gray_600 dark:text-gray-300'>
                  {card.count}
                </span>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                {card.title}
              </h3>
              <p className='text-sm text-vesoko_gray_600 dark:text-gray-300 mb-4'>
                {card.description}
              </p>
              <Button
                buttonTitle='Manage'
                onClick={() => handleNavigate(card.path)}
                className='w-full bg-vesoko_primary hover:bg-vesoko_primary_2 text-white py-2 px-4 rounded-md transition-colors duration-200'
              />
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className='p-6'>
        <div className='bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-vesoko_gray_200'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Recent Activity
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center p-3 bg-vesoko_background rounded-lg'>
              <div className='p-2 bg-vesoko_primary rounded-full mr-3'>
                <Book className='h-4 w-4 text-white' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>New store application submitted</p>
                <p className='text-xs text-vesoko_gray_600'>Cunda Fashion House - 2 minutes ago</p>
              </div>
            </div>
            <div className='flex items-center p-3 bg-vesoko_background rounded-lg'>
              <div className='p-2 bg-vesoko_primary rounded-full mr-3'>
                <Users className='h-4 w-4 text-white' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>New user registered</p>
                <p className='text-xs text-vesoko_gray_600'>john.doe@example.com - 15 minutes ago</p>
              </div>
            </div>
            <div className='flex items-center p-3 bg-vesoko_background rounded-lg'>
              <div className='p-2 bg-vesoko_primary_600 rounded-full mr-3'>
                <ShoppingCart className='h-4 w-4 text-white' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>New product listed</p>
                <p className='text-xs text-vesoko_gray_600'>African Art Collection - 1 hour ago</p>
              </div>
            </div>
          </div>
          <div className='mt-4 text-center'>
            <Button
              buttonTitle='View All Activity'
              className='text-vesoko_primary hover:bg-vesoko_background border border-vesoko_primary'
              onClick={() => handleNavigate('/admin/activity')}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

DashboardPage.noLayout = true;
export default DashboardPage;
