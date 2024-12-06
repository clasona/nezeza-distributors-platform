import { OrderProps, ProductProps } from "../../../../type";

const mockProducts: ProductProps[] = [
  {
    _id: 1,
    title: 'Akabanga',
    description: 'A traditional Kenyan spice',
    price: 5,
    quantity: 100,
    image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akabanga.png',
    category: 'kitchen',
    // storeId: 1, //must get from current logged in
  },
  {
    _id: 2,
    title: 'Akanozo',
    description: 'A traditional Rwandan flour',
    price: 7,
    quantity: 150,
    image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akanozo.png',
    category: 'kitchen',
    // storeId: 1, //must get from current logged in
  },
];

const mockOrders: OrderProps[] = [
  {
    _id: 1,
    fulfillmentStatus: 'Pending',
    orderItems: mockProducts,
    quantity: 100,
    totalTax: 750,
    totalShipping: 200,
    paymentMethod: 'Credit Card',
  },
  {
    _id: 2,
    fulfillmentStatus: 'Shipped',
    orderItems: mockProducts,
    quantity: 60,
    totalTax: 350,
    totalShipping: 40,
    paymentMethod: 'Credit Card',
  },
  {
    _id: 3,
    fulfillmentStatus: 'Delivered',
    orderItems: mockProducts,
    quantity: 3,
    totalTax: 123,
    totalShipping: 56,
    paymentMethod: 'Cash',
  },
];



export default mockOrders;