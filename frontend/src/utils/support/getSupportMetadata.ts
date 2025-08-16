import axiosInstance from '../axiosInstance';

export interface SupportMetadata {
  statuses: Array<{ value: string; label: string }>;
  priorities: Array<{ value: string; label: string }>;
  categories: Array<{ value: string; label: string }>;
}

export const getSupportMetadata = async (): Promise<{ metadata: SupportMetadata }> => {
  try {
    const response = await axiosInstance.get('/support/metadata');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch support metadata');
  }
};
