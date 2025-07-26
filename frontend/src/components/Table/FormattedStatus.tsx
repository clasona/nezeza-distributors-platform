import React from 'react';

interface StatusProps {
  status: string;
}

const FormattedStatus = ({ status }: StatusProps) => {
  const statusColors: { [key: string]: string } = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-green-100 text-green-800',
    Processing: 'bg-blue-100 text-blue-800',
    'Partially Fulfilled': 'bg-orange-100 text-orange-800',
    Fulfilled: 'bg-purple-100 text-purple-800',
    'Partially Shipped': 'bg-indigo-100 text-indigo-800',
    Shipped: 'bg-blue-100 text-blue-800',
    'Partially Delivered': 'bg-teal-100 text-teal-700',
    Delivered: 'bg-teal-100 text-teal-800',
    'Partially Cancelled': 'bg-red-100 text-red-700',
    Cancelled: 'bg-red-100 text-red-800',
    'Partially Returned': 'bg-gray-100 text-gray-700',
    Returned: 'bg-gray-100 text-gray-800',
    Approved: 'bg-green-100 text-vesoko_green_800',
    Canceled: 'bg-red-100 text-red-800',
    Declined: 'bg-red-100 text-red-800',
    Archived: 'bg-gray-100 text-gray-800',
  };

  const statusClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 text-sm font-medium rounded ${statusClass}`}>
      {status}
    </span>
  );
};

export default FormattedStatus;
