import React, { useEffect, useState } from 'react';
import {
  Trash2,
  Eye,
  RotateCcw,
  BellRing,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  X,
  Filter,
} from 'lucide-react';
import SearchField from '@/components/Table/SearchField';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import { NotificationProps } from '../../../type';
import {
  getAllNotifications,
  updateNotification,
} from '@/utils/notificationUtils';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import Button from '@/components/FormInputs/Button';
import Loading from '../Loaders/Loading';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchData = async () => {
    setIsLoading(true); // Set loading before fetch
    try {
      const data = await getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setErrorMessage('Error fetching notifications.'); // Set error message
    } finally {
      setIsLoading(false); // Set loading after fetch (success or error)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<{
    value: string;
    label: string;
  } | null>({ value: 'All Priorities', label: 'All Priorities' });
  const [statusFilter, setStatusFilter] = useState<{
    value: string;
    label: string;
  } | null>({ value: 'All Statuses', label: 'All Statuses' });
  const [sortPriority, setSortPriority] = useState<null | 'asc' | 'desc'>(null); // Correct type
  const priorityOrder = {
    low: 1,
    medium: 2,
    high: 3,
  };
  const [showMoreFilters, setshowMoreFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const toggleSortPriority = () => {
    if (sortPriority === null) {
      setSortPriority('asc');
    } else if (sortPriority === 'asc') {
      setSortPriority('desc');
    } else {
      setSortPriority(null);
    }
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const handlePriorityChange = (
    priority: {
      value: string;
      label: string;
    } | null
  ) => setPriorityFilter(priority);
  const handleStatusChange = (
    status: {
      value: string;
      label: string;
    } | null
  ) => setStatusFilter(status);
  //   const toggleSortPriority = () => setSortPriority((prev) => !prev);
  const toggleMoreFilters = () => setshowMoreFilters((prev) => !prev);

  const filteredNotifications = notifications
    .filter((notification) => {
      const searchMatch = Object.values(notification)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return searchMatch;
    })
    .filter(
      (n) =>
        (statusFilter?.value === 'All Priorities' &&
          statusFilter.label === 'All Priorities') ||
        n.priority === priorityFilter?.value
    )
    .filter(
      (n) =>
        (statusFilter?.value === 'All Statuses' &&
          statusFilter.label === 'All Statuses') ||
        (statusFilter?.value === 'unread' ? !n.read : n.read)
    )
    .filter((n) => {
      if (!startDate && !endDate) return true;
      return (
        (startDate ? n.createdAt >= startDate : true) &&
        (endDate ? n.createdAt <= endDate : true)
      );
    })
    //   .sort((a, b) => (sortPriority ? (a.priority > b.priority ? 1 : -1) : 0));
    .sort((a, b) => {
      if (sortPriority === 'asc') {
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        );
      } else if (sortPriority === 'desc') {
        return (
          priorityOrder[b.priority as keyof typeof priorityOrder] -
          priorityOrder[a.priority as keyof typeof priorityOrder]
        );
      } else {
        return 0;
      }
    });
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewNotification = (notification: NotificationProps) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null); // Reset selected notification
  };

  const updateNotificationStatus = async (notification: NotificationProps) => {
    const newReadStatus = !notification.read; // Toggle the read status
    const updatedData: Partial<NotificationProps> = {
      read: newReadStatus,
    };
    try {
      const response = await updateNotification(notification._id, updatedData);
      if (response) {
        setSuccessMessage(
          `Notification marked as ${
            newReadStatus ? 'Read' : 'Unread'
          } successfully`
        );
        setTimeout(() => setSuccessMessage(''), 4000);
        console.log(newReadStatus);
        setNotifications((prevNotifications) => {
          return prevNotifications.map((n) => {
            if (n._id === notification._id) {
              return { ...n, read: newReadStatus };
            }
            return n;
          });
        });
      } else {
        // Handle error, e.g., display an error message
        setErrorMessage('Failed to update notification.'); // Example error handling
        setTimeout(() => setErrorMessage(''), 4000);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      setErrorMessage('An error occurred while updating the notification.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Helper function to get priority icon and color
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className='w-5 h-5 text-red-500' />;
      case 'medium':
        return <Info className='w-5 h-5 text-yellow-500' />;
      case 'low':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      default:
        return <Info className='w-5 h-5 text-gray-500' />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide';
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-700 border border-red-200`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-700 border border-yellow-200`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-700 border border-green-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className='min-h-screen'>
      {/* Modern Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <BellRing className='w-8 h-8 text-vesoko_dark_blue' />
                {unreadCount > 0 && (
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold'>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Notifications</h1>
                <p className='text-gray-600 mt-1'>
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <Button
                isLoading={isLoading}
                icon={RotateCcw}
                buttonTitle='Refresh'
                buttonTitleClassName='hidden md:inline'
                loadingButtonTitle='Refreshing...'
                className='bg-vesoko_dark_blue text-white hover:bg-vesoko_dark_blue/90 border-0'
                onClick={async () => {
                  await fetchData();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6'>
          <div className='flex flex-wrap items-center gap-3 mb-4'>
            <button
              onClick={() => setNotifications([])}
              className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2 transition-colors'
            >
              <Trash2 className='w-4 h-4' />
              <span className='hidden sm:inline'>Clear All</span>
            </button>
            
            <button
              onClick={toggleSortPriority}
              className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2 transition-colors'
            >
              <Filter className='w-4 h-4' />
              <span>Priority {sortPriority === 'asc' ? '↑' : sortPriority === 'desc' ? '↓' : ''}</span>
            </button>

            <StatusFilters
              label='Status'
              options={[
                { value: 'All Statuses', label: 'All Statuses' },
                { value: 'unread', label: 'Unread' },
                { value: 'read', label: 'Read' },
              ]}
              selectedOption={statusFilter}
              onChange={handleStatusChange}
            />
            
            <div className='hidden sm:block'>
              <StatusFilters
                label='Priority'
                options={[
                  { value: 'All Priorities', label: 'All Priorities' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
                selectedOption={priorityFilter}
                onChange={handlePriorityChange}
              />
            </div>
          </div>
          
          <SearchField
            searchFieldPlaceholder='Search notifications...'
            onSearchChange={handleSearch}
          />
        </div>

        {/* Notifications List */}
        <div className='space-y-4'>
          {isLoading ? (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8'>
              <Loading message='notifications' />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
              <BellRing className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No notifications found</h3>
              <p className='text-gray-500'>You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                  notification.read 
                    ? 'border-gray-200' 
                    : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className='p-6'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start space-x-4 flex-1'>
                      {/* Status Indicator */}
                      <div className='flex-shrink-0 mt-1'>
                        {notification.read ? (
                          <div className='w-3 h-3 rounded-full bg-gray-300'></div>
                        ) : (
                          <div className='w-3 h-3 rounded-full bg-blue-500 animate-pulse'></div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-3 mb-2'>
                          {getPriorityIcon(notification.priority)}
                          <h3 className={`text-lg font-semibold ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <span className={getPriorityBadge(notification.priority)}>
                            {notification.priority}
                          </span>
                        </div>
                        
                        <p className={`text-sm mb-3 line-clamp-2 ${
                          notification.read ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          {notification.body}
                        </p>
                        
                        <div className='flex items-center space-x-4 text-xs text-gray-500'>
                          <div className='flex items-center space-x-1'>
                            <Calendar className='w-3 h-3' />
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <Clock className='w-3 h-3' />
                            <span>{new Date(notification.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className='flex items-center space-x-2 ml-4'>
                      <button
                        onClick={() => updateNotificationStatus(notification)}
                        className={`p-2 rounded-lg transition-colors ${
                          notification.read
                            ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title={notification.read ? 'Mark as unread' : 'Mark as read'}
                      >
                        {notification.read ? (
                          <Eye className='w-4 h-4' />
                        ) : (
                          <CheckCircle className='w-4 h-4' />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleViewNotification(notification)}
                        className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                        title='View details'
                      >
                        <Eye className='w-4 h-4' />
                      </button>
                      
                      <button
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.filter((n) => n._id !== notification._id)
                          )
                        }
                        className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                        title='Delete notification'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <SuccessMessageModal successMessage={successMessage} />
      )}
      
      {/* Detailed View Modal */}
      {isModalOpen && selectedNotification && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden'>
            {/* Modal Header */}
            <div className='border-b border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  {getPriorityIcon(selectedNotification.priority)}
                  <h2 className='text-xl font-bold text-gray-900'>
                    {selectedNotification.title}
                  </h2>
                  <span className={getPriorityBadge(selectedNotification.priority)}>
                    {selectedNotification.priority}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className='p-6 overflow-y-auto'>
              <div className='mb-6'>
                <div className='flex items-center space-x-4 text-sm text-gray-500 mb-4'>
                  <div className='flex items-center space-x-1'>
                    <Calendar className='w-4 h-4' />
                    <span>{formatDate(selectedNotification.createdAt)}</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <Clock className='w-4 h-4' />
                    <span>{new Date(selectedNotification.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
                
                <div className='prose max-w-none'>
                  <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                    {selectedNotification.body}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className='border-t border-gray-200 p-6 flex justify-between items-center'>
              <button
                onClick={() => updateNotificationStatus(selectedNotification)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedNotification.read
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {selectedNotification.read ? 'Mark as Unread' : 'Mark as Read'}
              </button>
              
              <button
                onClick={closeModal}
                className='px-6 py-2 bg-vesoko_dark_blue text-white rounded-lg hover:bg-vesoko_dark_blue/90 font-medium transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

UserNotifications.noLayout = true;
export default UserNotifications;
