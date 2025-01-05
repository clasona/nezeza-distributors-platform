import axios from 'axios';

export const clearCart = async () => {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/v1/cart`,
      {
        withCredentials: true,
      }
    );

    if (response.status !== 201) {
        console.error('Cart not cleared. Status:', response.status);
        return null;
    } else {
      console.log('Cart cleared successfully...');
    }
    return response.data; // Return the response data (optional)
  } catch (error) {
    console.error('Error clearing cart:', error);
    return null; // Or throw the error
  }
};
