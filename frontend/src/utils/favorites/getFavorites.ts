import axiosInstance from '../axiosInstance';

export const getFavorites = async () => {
  try {
    const response = await axiosInstance.get('/favorites');
    const favoritesItemsData = response.data.favoritesItems;

    if (response.status !== 201) {
      console.log('favorites items data not fetched.');
      return null;
    } else {
      return favoritesItemsData;
    }
  } catch (error: any) {
    throw error;
  }
};