import axios from 'axios';

export const backendLogout = async () => {
  try {
    const response = await axios.delete('/api/auth/backend-logout', {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.data;
  } catch (error: any) {
    // Even if the request fails, we consider it successful 
    // because the main goal is to clear cookies
    console.log('Backend logout request failed (this is okay):', error.response?.data || error.message);
    return { success: true, message: 'Logged out successfully' };
  }
};
