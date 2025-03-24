import axiosInstance from '../axiosInstance';

export const createOrder = async (orderItems: any) => {
   const tax = 10; // TODO: to be changed later
   const shippingFee = 20; // TODO: to be changed later
   const paymentMethod = 'credit_card';
  try {
    const response = await axiosInstance.post('/orders', {
      items: orderItems,
      tax: tax,
      shippingFee: shippingFee,
      paymentMethod: paymentMethod,
    });
    return response; //returns client secret and payment intent
  } catch (error) {
    throw error; // Let the component handle the error
  }
};
