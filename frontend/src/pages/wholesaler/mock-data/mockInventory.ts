import { InventoryProps } from '../../../../type';

const numInventoryItems = 21; // Adjust this value to control the number of items

const mockInventory: InventoryProps[] = [];

for (let i = 0; i < numInventoryItems; i++) {
  const randomTitle = [
    'Akanozo',
    'Kinazi',
    'Akarabo',
    'Akabanga',
  ][Math.floor(Math.random() * 3)];
    const randomDescription = generateRandomDescription(); // Function to generate random descriptions
  // const randomImage = `https://nezeza-products.s3.us-east-2.amazonaws.com/image${i}.png`; // Random image URL pattern
  const randomImage = [
    'akanozo.png',
    'kinazi.jpg',
    'akarabo.png',
    'akabanga.png',
  ][Math.floor(Math.random() * 3)];

  const randomOwner = Math.floor(Math.random() * 100) + 1; // Random owner ID
  const randomBuyerStoreId = Math.floor(Math.random() * 50) + 1; // Random buyer store ID
  const randomProductId = Math.floor(Math.random() * 1000) + 1; // Random product ID
  const randomStock = Math.floor(Math.random() * 100) + 1; // Random stock quantity
  const randomPrice = Math.floor(Math.random() * 10000) + 100; // Random price (cents)
  const randomFreeShipping = Math.random() < 0.5; // Random boolean for free shipping
  const randomAvailability = Math.random() < 0.8; // Random boolean for availability
  const randomAverageRating = Math.random() * 5; // Random average rating
  const randomNumOfReviews = Math.floor(Math.random() * 100); // Random number of reviews
  const formattedDate = generateRandomDate(); // Function to generate random date

  mockInventory.push({
    _id: i + 1, // Generate unique IDs
    title: randomTitle,
    description: randomDescription,
    image: `https://nezeza-products.s3.us-east-2.amazonaws.com/${randomImage}`,
    owner: randomOwner,
    buyerStoreId: randomBuyerStoreId,
    productId: randomProductId,
    stock: randomStock,
    price: randomPrice / 100, // Convert price to dollars
    freeShipping: randomFreeShipping,
    availability: randomAvailability,
    averageRating: randomAverageRating,
    numOfReviews: randomNumOfReviews,
    lastUpdated: formattedDate,
    createdAt: formattedDate,
    updatedAt: formattedDate,
  });
}

function generateRandomDescription() {
  // Implement your logic to generate random descriptions (e.g., using lorem ipsum generators)
  return 'Some random product description'; // Replace with your implementation
}

function generateRandomDate() {
  // Implement the logic to generate random dates (as shown in previous example)
  const randomDate = new Date(
    2024,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  );
  return randomDate.toISOString().split('T')[0];
}

export default mockInventory;
