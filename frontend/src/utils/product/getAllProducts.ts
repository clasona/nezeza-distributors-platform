import axios from 'axios';
import { useSelector } from 'react-redux';
import { stateProps, StoreProps } from '../../../type';

export const getAllProducts = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/v1/products/all`,

      {
        //   params: { manufacturerId: userInfo.userId },
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const productsData = response.data.products;

    if (response.status !== 200) {
      console.log('all products data not fetched.');
    } else {
      console.log('all products data fetched successfully...');
      return productsData;
    }
  } catch (error) {
    console.error('Error fetching all products data:', error);
  }
};
