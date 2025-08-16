import axiosInstance from '../axiosInstance';

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface GetAdminUsersResponse {
  success: boolean;
  users: AdminUser[];
}

export const getAdminUsers = async (): Promise<GetAdminUsersResponse> => {
  try {
    const response = await axiosInstance.get('/admin/users?role=admin');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch admin users');
  }
};
