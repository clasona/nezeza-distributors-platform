import React, { useEffect, useState } from 'react';
import { Bell, Trash2, Eye, XCircle, Filter, Search } from 'lucide-react';
import SearchField from '@/components/Table/SearchField';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import TableFilters from '@/components/Table/TableFilters';
import DateFilters from '@/components/Table/Filters/DateFilters';
import { NotificationProps } from '../../../type';
import {
  getAllNotifications,
  updateNotification,
} from '@/utils/notificationUtils';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import Button from '@/components/FormInputs/Button';
import PageHeader from '@/components/PageHeader';
import { stateProps, UserProps } from '../../../type';
import Loading from '../Loaders/Loading';

const UserNotifications = (userInfo: any) => {
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
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
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
  const handlePriorityChange = (priority: string) =>
    setPriorityFilter(priority);
  const handleStatusChange = (status: string) => setStatusFilter(status);
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
        priorityFilter === 'All Priorities' || n.priority === priorityFilter
    )
    .filter(
      (n) =>
        statusFilter === 'All Statuses' ||
        (statusFilter === 'unread' ? !n.read : n.read)
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

  return (
    <div>
      <PageHeader
        heading='Notifications'
        actions={
          <Button
            isLoading={isLoading}
            buttonTitle='Refresh'
            loadingButtonTitle='Refreshing...'
            className='text-nezeza_dark_blue hover:text-white hover:bg-nezeza_dark_blue'
            onClick={async () => {
              await fetchData();
            }}
          />
        }
      />

      <TableFilters>
        <button
          onClick={() => setNotifications([])}
          className='bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 flex items-center'
        >
          <Trash2 className='w-4 h-4 mr-1' /> Delete All
        </button>
        {/* <button
          onClick={toggleSortPriority}
          className='bg-nezeza_dark_blue text-white px-3 py-1 rounded-md hover:bg-blue-700'
        >
          Sort by Priority
        </button> */}
        <button
          onClick={toggleSortPriority}
          className='text-nezeza_dark_blue outline hover:text-white hover:bg-nezeza_dark_blue px-3 py-1 rounded-md'
        >
          Sort by priority{' '}
          {sortPriority === 'asc'
            ? '(asc)'
            : sortPriority === 'desc'
            ? '(desc)'
            : ''}
        </button>
        <SearchField
          searchFieldPlaceholder='notifications...'
          onSearchChange={handleSearch}
        />

        <StatusFilters
          label='Status'
          options={['All Statuses', 'unread', 'read']}
          selectedOption={statusFilter}
          onChange={handleStatusChange}
        />
        <StatusFilters
          label='Priority'
          options={['All Priorities', 'high', 'medium', 'low']}
          selectedOption={priorityFilter}
          onChange={handlePriorityChange}
        />

        {showMoreFilters && (
          <DateFilters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        )}
        <button
          onClick={toggleMoreFilters}
          className='text-sm text-nezeza_dark_blue underline'
        >
          {showMoreFilters ? 'Less Filters' : 'More Filters'}
        </button>
        <ClearFilters
          clearFiltersFunction={() => {
            setPriorityFilter('All Priorities');
            setStatusFilter('All Statuses');
            setStartDate('');
            setEndDate('');
          }}
        />
      </TableFilters>

      <div className='p-6 bg-white shadow-lg rounded-xl mt-4'>
        {isLoading ? ( // Show loading indicator
          <Loading message='notifications' />
        ) : filteredNotifications.length === 0 ? (
          <p className='text-center'>No notifications found</p>
        ) : (
          <ul className='space-y-4'>
            {filteredNotifications.map((notification) => (
              <li
                key={notification._id}
                className={`p-4 rounded-lg flex items-center justify-between shadow-md ${
                  notification.read ? 'bg-gray-100' : 'bg-blue-50'
                }`}
              >
                <div className='flex items-center space-x-4'>
                  <Bell
                    className={
                      notification.read
                        ? 'text-gray-400'
                        : 'text-nezeza_dark_blue'
                    }
                  />
                  <div>
                    <span className='text-lg font-medium'>
                      {notification.title}
                    </span>
                    <div className='flex space-x-4'>
                      <p
                        className={`text-sm font-semibold ${
                          notification.priority === 'high'
                            ? 'text-red-600'
                            : notification.priority === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        Priority: {notification.priority}
                      </p>
                      {/* <p className='text-sm'>Type: {notification.type}</p> */}
                      <p className='text-sm'>Date: {notification.createdAt}</p>
                    </div>
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <button
                    className={`text-sm px-3 py-1 rounded-lg ${
                      notification.read
                        ? 'text-gray-500 bg-gray-200 hover:text-gray-700 hover:bg-gray-300'
                        : 'text-white bg-nezeza_green_600 hover:bg-nezeza_green_800'
                    }`}
                    onClick={() => updateNotificationStatus(notification)}
                  >
                    {notification.read ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                  <button
                    className='text-sm text-gray-700 bg-gray-200 px-3 py-1 rounded-lg'
                    onClick={() => handleViewNotification(notification)}
                  >
                    <Eye className='w-4 h-4' />
                  </button>
                  <button
                    className='text-sm text-red-600 bg-red-100 px-3 py-1 rounded-lg'
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.filter((n) => n._id !== notification._id)
                      )
                    }
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {successMessage && (
        <SuccessMessageModal successMessage={successMessage} />
      )}
      {isModalOpen && selectedNotification && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          {' '}
          {/* Add z-index */}
          <div className='bg-nezeza_light_blue p-6 rounded-lg shadow-md w-96 max-h-[90vh] overflow-y-auto'>
            {' '}
            {/* Add max-h and overflow */}
            <h2 className='text-lg font-semibold mb-2'>
              {selectedNotification.title}
            </h2>
            <div className='mb-4'>
              {' '}
              {/* Group metadata */}
              {/* <p className='text-sm text-gray-600'>
                Type: {selectedNotification.type}
              </p> */}
              <p className='text-sm text-gray-600'>
                Priority: {selectedNotification.priority}
              </p>
              <p className='text-sm text-gray-600'>
                Date: {selectedNotification.createdAt}
              </p>
              {/* Add other metadata as needed */}
            </div>
            <p className='whitespace-pre-wrap'>{selectedNotification.body}</p>{' '}
            {/* Preserve whitespace */}
            <div className='mt-4 flex justify-end'>
              <button
                onClick={closeModal}
                className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300'
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
