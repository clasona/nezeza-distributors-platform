import axiosInstance from "../axiosInstance"

export const subscribeToNewsletter = async (email: string): Promise<void> => {
  try {
    await axiosInstance.post('/newsletter/subscribe', { email });
  } catch (error) {
    throw new Error('Failed to subscribe to newsletter');
  }
};
