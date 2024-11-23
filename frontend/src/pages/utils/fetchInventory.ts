
export const fetchInventory= async () => {
  try {
    const response = await fetch(
      'http://localhost:8000/api/v1/inventory/'
    );
    const data = await response.json();
    const productsData = data.inventory;

    if (!response.ok) {
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
