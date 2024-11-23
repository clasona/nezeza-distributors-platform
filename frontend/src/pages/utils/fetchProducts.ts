// export const getServerSideProps = async () => {
//   const productData = await fetchProducts();
//   return { props: { productData } };
// };

export const fetchProducts = async () => {
  try {
    const response = await fetch(
      'http://localhost:8000/api/v1/marketplace/products'
    );
    const data = await response.json();
    const productsData = data.products;

    if (!response.ok) {
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
