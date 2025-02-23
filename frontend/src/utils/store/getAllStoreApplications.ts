import axios from 'axios';

export const getAllStoreApplications = async () => {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/v1/admin/store-applications/',
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const storeApplicationsData = response.data.storeApplications;

    // console.log(response);

    if (response.status !== 200) {
      console.log('Store applications data not fetched.');
      // console.log(storeApplicationsData);
    } else {
      console.log('store applications data fetched successfully...');
      // console.log(storeApplicationsData);
      return storeApplicationsData;
    }
  } catch (error) {
    console.error('Error fetching store applications data:', error);
  }
};
