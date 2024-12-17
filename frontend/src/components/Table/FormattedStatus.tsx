import React from 'react';

interface StatusProps {
  status: string;
}

const FormattedStatus = ({ status }: StatusProps) => {
  const statusColors: { [key: string]: string } = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Fulfilled: 'bg-purple-100 text-purple-800',
    Shipped: 'bg-blue-100 text-blue-800',
    Delivered: 'bg-teal-100 text-teal-800',
    Completed: 'bg-green-100 text-nezeza_green_800',
    Canceled: 'bg-red-100 text-red-800',
  };

  const statusClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 text-sm font-medium rounded ${statusClass}`}>
      {status}
    </span>
  );
};

export default FormattedStatus;
