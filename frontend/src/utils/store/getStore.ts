import axios from 'axios';

export const getStore = async (storeId: string|number) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/v1/store/${storeId}`,

      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const storeData = response.data.store;

    if (response.status !== 200) {
      console.log('store data not fetched.');
    } else {
        console.log('store data fetched successfully...');
        console.log(storeData)
      return storeData;
    }
  } catch (error) {
    console.error('Error fetching store data:', error);
  }
};
