import axios from 'axios';
import { NotificationProps } from '../../type';
import axiosInstance from './axiosInstance';

export const getAllNotifications = async () => {
  try {
    const response = await axiosInstance.get('/notifications');

    if (response.status !== 200) {
      console.log('notifications data not fetched.');
      return null;
    } else {
      return response.data.notifications;
    }
  } catch (error: any) {
    throw error;
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
   throw error; // Use the utility function
  }
};
