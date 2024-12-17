import React from 'react';
import { MdLayers } from 'react-icons/md';

type SmallCardProps = {
  className: string; // Classname for the large card container.
  status: string; // Status name.
  count: number; // Count of orders for the status.
};

export default function SmallCard({ className, status, count }: SmallCardProps) {
  return (
    <div
      className={`flex items-center justify-between border p-4 h-2 rounded-md shadow-md flex-grow text-white ${className}`}
    >
      <span className='text-lg font-semibold'>{status}</span>
      <span className='text-xl font-semibold'>{count}</span>
    </div>
  );
}
