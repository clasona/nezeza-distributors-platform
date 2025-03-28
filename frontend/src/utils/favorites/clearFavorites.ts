import axios from 'axios';

export const clearFavorites = async () => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/favorites`,
      {
        withCredentials: true,
      }
    );

    if (response.status !== 201) {
      console.error('Favorites not cleared. Status:', response.status);
      return null;
    } else {
      console.log('Favorites cleared successfully...');
    }
    return response.data; // Return the response data (optional)
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return null; // Or throw the error
  }
};
