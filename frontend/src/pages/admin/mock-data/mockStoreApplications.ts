import { StoreApplicationProps, ProductProps } from '../../../../type';


const mockStoreApplications: StoreApplicationProps[] = [
  {
    _id: 1,
    status: 'Pending',
    storeName: 'My Store',
    submittedAt: '2024-12-15',
    updatedAt: '2024-12-15',
  },
];

// Loop to generate remaining applications (12 more)
for (let i = 2; i <= 12; i++) {
  const randomStatus = ['Pending', 'Approved', 'Declined'][
    Math.floor(Math.random() * 3)
  ]; // Random application status
  const randomStoreName = ['Chez Onna', 'Amahoro Salon', 'Shein'][
    Math.floor(Math.random() * 3)
  ]; // Random application status
  const randomDate = new Date(
    2013,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  ); // Random date between 2023-01-01 and 2023-12-31
  const formattedDate = randomDate.toISOString().split('T')[0]; // format to this format: 2024-12-06

  mockStoreApplications.push({
    _id: i,
    status: randomStatus,
    storeName: randomStoreName,
    submittedAt: formattedDate,
    updatedAt: formattedDate,
  });
}

export default mockStoreApplications;
