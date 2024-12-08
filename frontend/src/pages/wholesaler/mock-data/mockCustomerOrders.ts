import { OrderProps, ProductProps } from '../../../../type';

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
    totalPrice: mockProducts.reduce((total, item) => total + item.price, 0),

    totalTax: 750,
    totalShipping: 200,
    orderDate: '12/24/2024',
    paymentMethod: 'Credit Card',
  },
];

// Loop to generate remaining orders (12 more)
for (let i = 2; i <= 25; i++) {
  const randomQuantity = Math.floor(Math.random() * 10) + 1; // Random quantity between 1 and 10
  const randomProducts = mockProducts.slice(0, Math.floor(Math.random() * 14)); // Random subset of products
  const randomStatus = [
    'Pending',
    'Fulfilled',
    'Shipped',
    'Delivered',
    'Completed',
  ][Math.floor(Math.random() * 3)]; // Random fulfillment status
  const randomTax = Math.random() * 100; // Random tax value
  const randomShipping = Math.random() * 50; // Random shipping cost
  const randomDate = new Date(
    2013,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  ); // Random date between 2023-01-01 and 2023-12-31
  const formattedDate = randomDate.toISOString().split('T')[0]; // format to this format: 2024-12-06

  mockOrders.push({
    _id: i,
    fulfillmentStatus: randomStatus,
    orderItems: randomProducts,
    quantity: randomQuantity,
    totalPrice: randomProducts.reduce((total, item) => total + item.price, 0),
    totalTax: randomTax,
    totalShipping: randomShipping,
    orderDate: formattedDate,
    paymentMethod: ['Credit Card', 'Apple Pay', 'Debit Card'][
      Math.floor(Math.random() * 3)
    ], // Random payment method
  });
}

export default mockOrders;
