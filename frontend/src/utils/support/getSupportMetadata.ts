import axiosInstance from '../axiosInstance';

export interface SupportMetadata {
  categories: Array<{ value: string; label: string }>;
  priorities: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
}

export const getSupportMetadata = async (): Promise<{ success: boolean; metadata: SupportMetadata }> => {
  try {
    console.log('Fetching support metadata...');
    const response = await axiosInstance.get('/support/metadata');
    console.log('Support metadata response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching support metadata:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.response?.status === 404) {
      throw new Error('Support metadata endpoint not found. Please check if the backend is running.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch support metadata. Please try again.');
    }
  }
}; 