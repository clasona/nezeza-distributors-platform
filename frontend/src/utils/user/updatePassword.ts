import axiosInstance from '../axiosInstance';

interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const updateUserPassword = async (userId: string, passwordData: UpdatePasswordData) => {
  try {
    const response = await axiosInstance.patch(
      `/users/${userId}/password`,
      passwordData
    );

    if (response.status !== 200) {
      throw new Error('Failed to update password');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error updating password:', error);
    throw error?.response?.data || error;
  }
};
