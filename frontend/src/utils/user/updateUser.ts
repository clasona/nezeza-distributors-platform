import axios from 'axios';
import { UserProps } from '../../../type';

export const updateUser = async (
  userId: string | number,
  updatedUserInfo: Partial<UserProps>
) => {
  try {

    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userId}`,
      updatedUserInfo,
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const userData = response.data;
    if (response.status !== 200) {
      console.log('user data not updated.');
    } else {
      console.log('user data updated successfully...');
      return userData;
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};


export const updateUserByEmail = async (
  email: string,
  updatedUserInfo: Partial<UserProps>
) => {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/by/${email}`,
        updatedUserInfo, 
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const userData = response.data;
    if (response.status !== 200) {
      console.log('user data not updated.');
    } else {
      console.log('user data updated successfully...');
      return userData;
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};
