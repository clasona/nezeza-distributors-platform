import { useState } from 'react';

export const sortItems = (
  items: any[],
  sortColumn: string,
  sortOrder: string
) => {
  return [...items].sort((a, b) => {
    console.log(`Sort by ${sortColumn} ${sortOrder}`);

    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Handle price column by safely removing the $ and parsing as a number
    // if (sortColumn === 'totalAmount') { //add any other column names with prices
    //   aValue = aValue ? parseFloat(aValue.replace('$', '')) : 0; // Fallback to 0
    //   bValue = bValue ? parseFloat(bValue.replace('$', '')) : 0; // Fallback to 0
    // }

    // Handle date column by parsing into timestamps
    //add any other column names with dates
    if (sortColumn === 'orderDate') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    } else {
      // Handle other data types or undefined values
      return 0;
    }
  });
};
