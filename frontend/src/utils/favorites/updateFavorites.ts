import { OrderItemsProps } from '../../../type';
import axiosInstance from '../axiosInstance';

export const updateFavorites = async (favoritesItems: OrderItemsProps, buyerStoreId: string) => {
  try {
    const response = await axiosInstance.patch(`/favorites`, {
      favoritesItems: favoritesItems,
      buyerStoreId: buyerStoreId, // Send buyerStoreId in the request body
    });
    return response;
  } catch (error) {
    throw error; // Let the component handle the error
  }
};


