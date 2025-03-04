import axios from 'axios';
import { UserProps } from '../../../type';

interface updateUserProps {
  userId: string | number;
  storeType: string;
  // updatedData?: UserProps;
}

// for now just updating the user roles

export const updateUser = async (
  userId: string | number,
  updatedUserInfo: UserProps
) => {
  try {
    // Create an object that will hold only the updated fields
    const dataToUpdate: any = {};

    // Conditionally add fields that have been updated
    if (updatedUserInfo.email) dataToUpdate.email = updatedUserInfo.email;
    if (updatedUserInfo.firstName)
      dataToUpdate.firstName = updatedUserInfo.firstName;
    if (updatedUserInfo.lastName)
      dataToUpdate.lastName = updatedUserInfo.lastName;
    if (updatedUserInfo.roles) dataToUpdate.roles = [updatedUserInfo.roles];
    if (updatedUserInfo.image) dataToUpdate.image = updatedUserInfo.image;

    console.log(dataToUpdate);

    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userId}`,
      dataToUpdate,
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
