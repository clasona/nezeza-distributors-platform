import { NextApiRequest, NextApiResponse } from 'next';
import { StoreProduct } from '../../../type';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { items, email } = req.body;
  const modifiedItems = items.map((item: StoreProduct) => ({
    quantity: item.quantity,
    price_data: {
      currency: 'usd',
      unit_amount: item.price * 100,
      product_data: {
        name: item.title,
        description: item.description,
        images: [item.image],
      },
    },
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'], //you can add more countries
    },
    line_items: modifiedItems,
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/payment-success`,
    cancel_url: `${process.env.CLIENT_URL}/checkout`,
    metadata: {
      email,
      images: JSON.stringify(items.map((item: any) => item.image)),
    },
  });

  res.status(200).json({ id: session.id });
}

// import { NextApiRequest, NextApiResponse } from 'next';
// import { ProductProps, StoreProduct } from '../../../type';
// import axios from 'axios'; // Use axios to call your backend `createOrder` function
// import { createOrder } from '../utils/order/createOrder';

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     res.setHeader('Allow', ['POST']);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }

//   try {
//     const { items, email } = req.body;

//     const modifiedItems = items.map((item: StoreProduct) => ({
//       quantity: item.quantity,
//       price_data: {
//         currency: 'usd',
//         unit_amount: item.price * 100,
//         product_data: {
//           name: item.title,
//           description: item.description,
//           images: [item.image],
//         },
//       },
//     }));

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       shipping_address_collection: {
//         allowed_countries: ['US', 'CA'], // Add more countries if needed
//       },
//       line_items: modifiedItems,
//       mode: 'payment',
//       success_url: `${process.env.CLIENT_URL}/success`,
//       cancel_url: `${process.env.CLIENT_URL}/checkout`,
//       metadata: {
//         email,
//         images: JSON.stringify(items.map((item: any) => item.image)),
//       },
//     });

// Prepare order data for your backend `createOrder` function
// const orderItems = items.map((item: ProductProps) => ({
//   title: item.title,
//   price: item.price,
//   image: item.image,
//   amount: item.quantity,
//   product: item.id, // Assuming the product ID is stored as `id`
// }));

// const orderData = {
//   tax: 10, // Adjust tax as needed
//   shippingFee: 20, // Adjust shipping fee as needed
//   paymentMethod: 'credit_card', // Replace with actual payment method if dynamic
//   items: orderItems,
// };

//       const extraOrderDetails = {
//         payment_method: 'credit_card', //TODO: need to obtain this from order then pass it to createOrder
//       };

// createOrder(orderItems);

// Call your backend `createOrder` endpoint
// const orderResponse = await axios.post(
//   `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders`,
//   orderData,
//   {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   }
// );

// console.log('Order created successfully:', orderResponse.data);

// Send the session ID back to the client
//     res.status(200).json({ id: session.id });
//   } catch (error) {
//     console.error('Error in API handler:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }
