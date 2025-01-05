import axios from 'axios';
import { handleAxiosError } from './errorUtils';
import { NotificationProps } from '../../type';

export const getAllNotifications = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/v1/notifications/`,

      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const notificationsData = response.data.notifications;

    if (response.status !== 200) {
      console.log('all notifications data not fetched.');
      return null;
    } else {
      console.log('all notifications data fetched successfully...');
      return notificationsData;
    }
  } catch (error: any) {
    return handleAxiosError(error); // Use the utility function
  }
};

export const updateNotification = async (
  id: string,
  updatedData: Partial<NotificationProps>
) => {
  try {
    const response = await axios.patch(
      `http://localhost:8000/api/v1/notifications/${id}`,
      updatedData,
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      console.log('Error updating notification with id:', id);

      return null;
    }
  } catch (error) {
    return handleAxiosError(error); // Use the utility function
  }
};
