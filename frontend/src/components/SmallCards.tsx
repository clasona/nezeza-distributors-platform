import React from 'react';
import SmallCard from './SmallCard';

type OrderStat = {
  status: string; // Status name.
  count: number; // Count of orders for the status.
  className: string; // Classname for styling the card.
};

type SmallCardsProps = {
  orderStats: OrderStat[]; // Array of order statistics.
};

export default function SmallCards({ orderStats }: SmallCardsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-2 justify-between">
      {orderStats.map((stat) => (
        <SmallCard
          key={stat.status}
          className={stat.className}
          status={stat.status}
          count={stat.count}
        />
      ))}
    </div>
  );
}


// export default function SmallCards() {
//     const orderStats = [{
//         status: 'Pending',
//         count: 1000,
//       }, {
//     }]
//   return (
//     <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8'>
//       <SmallCard className='bg-gray-600' />
//       <SmallCard className='bg-yellow-600' />
//       <SmallCard className='bg-purple-600' />
//       <SmallCard className='bg-blue-600' />
//       <SmallCard className='bg-teal-600' />
//       <SmallCard className='bg-green-600' />
//     </div>
//   );
// }
