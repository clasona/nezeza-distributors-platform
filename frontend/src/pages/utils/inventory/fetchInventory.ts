import axios from 'axios';
import { useSelector } from 'react-redux';
import { StoreProps } from '../../../../type';

export const fetchInventory = async (storeInfo: StoreProps) => {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/v1/wholesaler/inventory-items',

      {
        params: { storeId: storeInfo._id }, //TODO: get this from redux user info
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const productsData = response.data.inventory;

    if (response.status !== 200) {
      console.log('inventory data not fetched.');
      // console.log(productsData);
    } else {
      console.log('inventory data fetched successfully...');
      // console.log(productsData);
      return productsData;
      // return { props: { productsData } };
    }
  } catch (error) {
    console.error('Error fetching inventory data:', error);
  }
};
