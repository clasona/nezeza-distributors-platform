import axios from 'axios';

export const fetchProducts = async () => {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/v1/marketplace/products',
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
