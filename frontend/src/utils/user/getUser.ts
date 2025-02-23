import axios from 'axios';
import { UserProps } from '../../../type';

export const getUser = async (userId: string | number): Promise<UserProps> => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/v1/users/${userId}`,

      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const userData = response.data.user;

    if (response.status !== 200) {
      console.log('user data not fetched.');
      throw new Error('Failed to fetch user data.');
    } else {
      console.log('user data fetched successfully...');
      console.log(userData);
      return userData;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('User data fetch failed');
  }
};
