import axios from 'axios';
import { useSelector } from 'react-redux';
import { stateProps, StoreProps } from '../../../type';

export const getSingleProduct = async (id: any) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/${id}`,

      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const productData = response.data.product;

    if (response.status !== 200) {
      console.log('product data not fetched.');
    } else {
      console.log('product data fetched successfully...');
      return productData;
    }
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
};
