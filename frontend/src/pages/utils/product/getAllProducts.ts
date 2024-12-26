import axios from 'axios';
import { useSelector } from 'react-redux';
import { stateProps, StoreProps } from '../../../../type';

export const getAllProducts = async (userInfo: any) => {
  const manufacturerId = userInfo.userId;
  try {
    const response = await axios.get(
      `http://localhost:8000/api/v1/manufacturers/${manufacturerId}/products`,

      {
        //   params: { manufacturerId: userInfo.userId },
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const productsData = response.data.products;

    if (response.status !== 200) {
      console.log('manufacturer inventory data not fetched.');
    } else {
      console.log('manufacturer inventory data fetched successfully...');
      return productsData;
    }
  } catch (error) {
    console.error('Error fetching manufacturer inventory data:', error);
  }
};
