
import axios from 'axios';

export const fetchInventory = async () => {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/v1/inventory/',
      {
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
