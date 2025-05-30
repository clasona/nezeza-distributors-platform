import axiosInstance from '../axiosInstance';

export const createStripeConnectAccount = async (email: string) => {
  try {
    // const response = await axios.post(
    //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payment/create-stripe-connect-account/`,
    //   { email },
    //   {
    //     withCredentials: true,
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );

    const response = await axiosInstance.post(
      '/payment/create-stripe-connect-account/',
      {
        email,
      }
    );

    if (response.status === 200) {
      return response.data; // Return the response data on success
    } else {
      throw new Error('Error creating stripe account'); // Throw an error for other status codes
    }
  } catch (error) {
    console.error('Error creating stripe account:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
