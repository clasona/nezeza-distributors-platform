import { AddressProps, OrderItemsProps, OrderProps, ProductProps } from '../../../../type';

const mockProducts: OrderItemsProps[] = [
  {
    _id: 1,
    title: 'Akabanga',
    description: 'A traditional Kenyan spice',
    price: 5,
    quantity: 100,
    image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akabanga.png',
    category: 'kitchen',
    product: {
      _id: 1,
      title: 'Akabanga',
      description: 'A traditional Kenyan spice',
      price: 5,
      quantity: 100,
      category: 'kitchen',
      image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akabanga.png',
    },
    sellerStoreId: {
      _id: 1,
      storeType: 'Retail',
      registrationNumber: 123456,
      name: 'Kenyan Spices Ltd.',
      category: 'Food',
      description: 'Specialty spice store',
      email: 'store@example.com',
      phone: '+250 788 123 456',
      ownerId: 1,
      address: {
        street: '12 Market St',
        city: 'Nairobi',
        state: 'Nairobi',
        zipCode: '00100',
        country: 'Kenya',
      },
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
    },
  },
  {
    _id: 2,
    title: 'Akabanga',
    description: 'A traditional Kenyan spice',
    price: 5,
    quantity: 100,
    image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akabanga.png',
    category: 'kitchen',
    product: {
      _id: 1,
      title: 'Akabanga',
      description: 'A traditional Kenyan spice',
      price: 5,
      quantity: 100,
      category: 'kitchen',
      image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akabanga.png',
    },
    sellerStoreId: {
      _id: 1,
      storeType: 'Retail',
      registrationNumber: 123456,
      name: 'Kenyan Spices Ltd.',
      category: 'Food',
      description: 'Specialty spice store',
      email: 'store@example.com',
      phone: '+250 788 123 456',
      ownerId: 1,
      address: {
        street: '12 Market St',
        city: 'Nairobi',
        state: 'Nairobi',
        zipCode: '00100',
        country: 'Kenya',
      },
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
    },
  },
  {
    _id: 3,
    title: 'Akabanga',
    description: 'A traditional Kenyan spice',
    price: 5,
    quantity: 100,
    image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akanozo.png',
    category: 'kitchen',
    product: {
      _id: 1,
      title: 'Akabanga',
      description: 'A traditional Kenyan spice',
      price: 5,
      quantity: 100,
      category: 'kitchen',
      image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akanozo.png',
    },
    sellerStoreId: {
      _id: 1,
      storeType: 'Retail',
      registrationNumber: 123456,
      name: 'Kenyan Spices Ltd.',
      category: 'Food',
      description: 'Specialty spice store',
      email: 'store@example.com',
      phone: '+250 788 123 456',
      ownerId: 1,
      address: {
        street: '12 Market St',
        city: 'Nairobi',
        state: 'Nairobi',
        zipCode: '00100',
        country: 'Kenya',
      },
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
    },
  },
];

// Initialize orders array
const mockOrders: OrderProps[] = [];

/// Generate mock orders dynamically
for (let i = 1; i <= 7; i++) {
  const randomQuantity = Math.floor(Math.random() * 10) + 1; // Random quantity between 1 and 10
  // const randomProducts = mockProducts.slice(0, Math.floor(Math.random() * 10)); // Random subset of products
  // Randomly select multiple products
  const randomProducts = mockProducts
    .filter(() => Math.random() > 0.5) // 50% chance to include each product
    .slice(0, Math.floor(Math.random() * mockProducts.length) + 1); // Ensure at least 1 product

  // Ensure at least one product is selected
  if (randomProducts.length === 0) {
    randomProducts.push(
      mockProducts[Math.floor(Math.random() * mockProducts.length)]
    );
  }
  const randomStatus = [
    'Pending',
    'Fulfilled',
    'Shipped',
    'Delivered',
    'Completed',
  ][Math.floor(Math.random() * 5)]; // Random fulfillment status
  const randomTax = parseFloat((Math.random() * 100).toFixed(2)); // Random tax value
  const randomShipping = parseFloat((Math.random() * 50).toFixed(2)); // Random shipping cost
  const randomDate = new Date(
    2024,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  ); // Random date in 2024
  const formattedDate = randomDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD

  mockOrders.push({
    _id: i,
    fulfillmentStatus: randomStatus,
    orderItems: randomProducts,
    quantity: randomQuantity,
    totalAmount: randomProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ),
    totalTax: randomTax,
    totalShipping: randomShipping,
    createdAt: formattedDate,
    updatedAt: formattedDate,
    paymentMethod: ['Credit Card', 'Apple Pay', 'Debit Card'][
      Math.floor(Math.random() * 3)
    ], // Random payment method
    shippingAddress: '123 main st',
  });
}

export default mockOrders;
