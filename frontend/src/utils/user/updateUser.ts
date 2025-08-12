import axios from 'axios';
import { UserProps } from '../../../type';
import axiosInstance from '../axiosInstance';


export const updateUser = async (
  userId: string | number,
  updatedUserInfo: Partial<UserProps>
) => {
  try {

    const response = await axiosInstance.patch(
      `/users/${userId}`,
      updatedUserInfo
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
    const response = await axiosInstance.patch(
      `/users/by/${email}`,
      updatedUserInfo
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
