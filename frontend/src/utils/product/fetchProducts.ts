//currently loading products for the main home page
// TODO: replace with getAllInventory from the the retailers
import axios from 'axios';

export const fetchProducts = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/marketplace/products`,
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const productsData = response.data.products;

    if (response.status !== 200) {
      console.log('products data not fetched.');
      // console.log(productsData);
    } else {
      console.log('products data fetched successfully...');
      // console.log(productsData);
      return productsData;
      // return { props: { productsData } };
    }
  } catch (error) {
    console.error('Error fetching products data:', error);
  }
};
